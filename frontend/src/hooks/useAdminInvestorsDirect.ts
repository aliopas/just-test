/**
 * Hook لجلب قائمة المستثمرين للإدارة مباشرة من Supabase
 * بديل لـ useAdminInvestors الذي يستخدم API backend
 */

import { useEffect, useRef } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type InvestorListItem = {
  id: string;
  email: string;
  phone: string | null;
  fullName: string | null;
  preferredName: string | null;
  status: string;
  kycStatus: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InvestorListFilters = {
  page?: number;
  limit?: number;
  status?: 'all' | 'pending' | 'active' | 'suspended';
  kycStatus?: 'all' | 'pending' | 'in_review' | 'approved' | 'rejected';
  search?: string;
  sortBy?: 'created_at' | 'email' | 'full_name';
  order?: 'asc' | 'desc';
};

export type InvestorListResponse = {
  investors: InvestorListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};


async function fetchAdminInvestorsDirect(
  filters: InvestorListFilters
): Promise<InvestorListResponse> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 25;
  const offset = (page - 1) * limit;

  // Step 1: Query investors from users table (role = 'investor')
  // Simplified: Just get all investors first, we'll filter client-side
  let query = supabase
    .from('users')
    .select('id, email, phone, phone_cc, status, created_at, updated_at', { count: 'exact' })
    .eq('role', 'investor');

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  // Apply search filter on email/phone (profile name search will be done client-side)
  if (filters.search && filters.search.trim().length > 0) {
    const pattern = `%${filters.search.trim()}%`;
    query = query.or(`email.ilike.${pattern},phone.ilike.${pattern}`);
  }

  // Apply sorting
  const sortBy = filters.sortBy ?? 'created_at';
  const order = filters.order === 'asc' ? true : false;
  query = query.order(sortBy, { ascending: order });

  // Apply pagination
  const { data: users, error: usersError, count } = await query
    .range(offset, offset + limit - 1);

  if (usersError) {
    console.error('[useAdminInvestorsDirect] Error fetching users:', usersError);
    console.error('[useAdminInvestorsDirect] Query details:', {
      filters,
      hasSearch: !!filters.search,
      hasKycFilter: filters.kycStatus !== 'all',
      errorCode: usersError.code,
      errorMessage: usersError.message,
      errorDetails: usersError.details,
      errorHint: usersError.hint,
    });
    
    // Check if it's an RLS policy error
    if (usersError.code === '42501' || usersError.message?.includes('permission denied') || usersError.message?.includes('policy')) {
      throw new Error(`خطأ في الصلاحيات: لا يمكنك الوصول إلى بيانات المستخدمين. تأكد من أن لديك صلاحيات الإدارة.`);
    }
    
    throw new Error(`خطأ في جلب المستخدمين: ${usersError.message}`);
  }

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[useAdminInvestorsDirect] Fetched users:', {
      count: users?.length ?? 0,
      totalCount: count,
      filters,
    });
  }

  let userRows = (users as any[] | null) ?? [];

  // Step 2: Fetch profiles for the users we got
  const profilesMap = new Map<string, { user_id: string; full_name: string | null; preferred_name: string | null; kyc_status: string | null }>();
  
  if (userRows.length > 0) {
    const userIds = userRows.map(u => u.id);
    const { data: userProfiles, error: profilesError } = await supabase
      .from('investor_profiles')
      .select('user_id, full_name, preferred_name, kyc_status')
      .in('user_id', userIds);
    
    if (!profilesError && userProfiles) {
      userProfiles.forEach(p => {
        profilesMap.set(p.user_id, p);
      });
    } else if (profilesError) {
      console.warn('[useAdminInvestorsDirect] Could not fetch investor profiles:', profilesError);
      // Continue without profiles - users will show without profile data
    }
  }

  // Step 3: Apply client-side filtering for search (profile names)
  if (filters.search && filters.search.trim().length > 0) {
    const searchTerm = filters.search.trim().toLowerCase();
    userRows = userRows.filter((user) => {
      const profile = profilesMap.get(user.id);
      const matchesEmail = user.email?.toLowerCase().includes(searchTerm);
      const matchesPhone = user.phone?.toLowerCase().includes(searchTerm);
      const matchesFullName = profile?.full_name?.toLowerCase().includes(searchTerm);
      const matchesPreferredName = profile?.preferred_name?.toLowerCase().includes(searchTerm);
      
      return matchesEmail || matchesPhone || matchesFullName || matchesPreferredName;
    });
  }
  
  // Step 4: Apply KYC filter client-side
  if (filters.kycStatus && filters.kycStatus !== 'all') {
    userRows = userRows.filter((user) => {
      const profile = profilesMap.get(user.id);
      // If no profile, exclude from results unless KYC status is null and filter is 'pending'
      if (!profile) {
        return filters.kycStatus === 'pending'; // null kyc_status can be considered pending
      }
      return profile.kyc_status === filters.kycStatus;
    });
  }

  // Step 6: Transform to InvestorListItem format
  const investors: InvestorListItem[] = userRows.map((user) => {
    const profile = profilesMap.get(user.id);
    
    // Combine phone_cc with phone if both exist
    const phone = user.phone 
      ? (user.phone_cc ? `${user.phone_cc}${user.phone}` : user.phone)
      : null;
    
    const investor = {
      id: user.id,
      email: user.email,
      phone: phone,
      fullName: profile?.full_name ?? null,
      preferredName: profile?.preferred_name ?? null,
      status: user.status,
      kycStatus: profile?.kyc_status ?? null,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[useAdminInvestorsDirect] User data:', {
        userId: user.id,
        email: user.email,
        phone: phone,
        fullName: profile?.full_name,
        hasProfile: !!profile,
        finalInvestor: investor,
      });
    }
    
    return investor;
  });

  // Calculate total count
  // The count from query should be accurate since we apply filters at query level
  const total = count ?? 0;
  const pageCount = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    investors,
    meta: {
      page,
      limit,
      total,
      pageCount,
      hasNext: page < pageCount,
      hasPrev: page > 1,
    },
  };
}

export function useAdminInvestorsDirect(filters: InvestorListFilters) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  const queryKey = [
    'adminInvestorsDirect',
    filters.page ?? 1,
    filters.limit ?? 25,
    filters.status ?? 'all',
    filters.kycStatus ?? 'all',
    filters.search ?? '',
    filters.sortBy ?? 'created_at',
    filters.order ?? 'desc',
  ] as const;

  // Set up realtime subscription for users and investor_profiles
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel('admin-investors-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: 'role=eq.investor',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['adminInvestorsDirect'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'investor_profiles',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['adminInvestorsDirect'] });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[useAdminInvestorsDirect] Subscribed to realtime updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[useAdminInvestorsDirect] Error subscribing to realtime updates');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient]);

  return useQuery<InvestorListResponse>({
    queryKey,
    queryFn: () => fetchAdminInvestorsDirect(filters),
    placeholderData: keepPreviousData,
    // Removed refetchInterval to prevent automatic page refreshes
    enabled: typeof window !== 'undefined', // Only on client
  });
}
