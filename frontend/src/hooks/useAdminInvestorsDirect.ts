/**
 * Hook لجلب قائمة المستثمرين للإدارة مباشرة من Supabase
 * بديل لـ useAdminInvestors الذي يستخدم API backend
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';

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

  // Step 1: Get all investor_profiles to create a map for later lookup
  const { data: investorProfiles, error: investorProfilesError } = await supabase
    .from('investor_profiles')
    .select('user_id, full_name, preferred_name, kyc_status');

  // If we can't fetch profiles, continue with empty map (users without profiles will have null values)
  const profilesMap = new Map(
    (investorProfiles ?? []).map(p => [p.user_id, p])
  );

  if (investorProfilesError) {
    console.warn('[useAdminInvestorsDirect] Could not fetch investor profiles:', investorProfilesError);
    // Continue anyway - we'll just show users without profile data
  }

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[useAdminInvestorsDirect] Found investor profiles:', {
      count: profilesMap.size,
    });
  }

  // Step 2: If search includes profile names or KYC filter, find matching user IDs first
  let searchUserIds: string[] | null = null;
  let kycMatchingUserIds: string[] | null = null;

  if (filters.search && filters.search.trim().length > 0) {
    const searchTerm = filters.search.trim().toLowerCase();
    // Find profiles matching the search term
    const matchingProfileUserIds: string[] = [];
    profilesMap.forEach((profile, userId) => {
      if (
        (profile.full_name && profile.full_name.toLowerCase().includes(searchTerm)) ||
        (profile.preferred_name && profile.preferred_name.toLowerCase().includes(searchTerm))
      ) {
        matchingProfileUserIds.push(userId);
      }
    });
    
    if (matchingProfileUserIds.length > 0) {
      searchUserIds = matchingProfileUserIds;
    }
  }

  // Get user IDs with matching KYC status if filter is applied
  if (filters.kycStatus && filters.kycStatus !== 'all') {
    kycMatchingUserIds = [];
    profilesMap.forEach((profile, userId) => {
      if (profile.kyc_status === filters.kycStatus) {
        kycMatchingUserIds!.push(userId);
      }
    });
  }

  // Step 3: Query ALL users from users table
  let query = supabase
      .from('users')
    .select('id, email, phone, phone_cc, status, created_at, updated_at', { count: 'exact' });

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  // Combine search and KYC filters
  let finalUserIds: string[] | null = null;
  
  if (searchUserIds && kycMatchingUserIds) {
    // Intersect both filters
    finalUserIds = searchUserIds.filter(id => kycMatchingUserIds!.includes(id));
    if (finalUserIds.length === 0) {
      // No intersection, return empty result
      return {
        investors: [],
        meta: {
          page,
          limit,
          total: 0,
          pageCount: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  } else if (searchUserIds) {
    finalUserIds = searchUserIds;
  } else if (kycMatchingUserIds) {
    finalUserIds = kycMatchingUserIds;
    if (finalUserIds.length === 0) {
      // No users match KYC filter, return empty result
      return {
        investors: [],
        meta: {
          page,
          limit,
          total: 0,
          pageCount: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }

  // Apply user ID filter if we have one
  if (finalUserIds && finalUserIds.length > 0) {
    query = query.in('id', finalUserIds);
  }

  // Apply search filter on email/phone (in addition to profile name search)
  if (filters.search && filters.search.trim().length > 0) {
    const pattern = `%${filters.search.trim()}%`;
    // If we already have user IDs from profile search, we need to combine
    // For now, we'll search in email/phone and filter results later
    if (!finalUserIds) {
    query = query.or(`email.ilike.${pattern},phone.ilike.${pattern}`);
    }
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
      finalUserIds: finalUserIds?.length,
      hasSearch: !!filters.search,
      hasKycFilter: filters.kycStatus !== 'all',
    });
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

  // Step 4: Apply additional client-side filtering for search (profile names)
  // This handles cases where search matches profile names but we couldn't filter at query level
  if (filters.search && filters.search.trim().length > 0 && !searchUserIds) {
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

  // Step 5: Transform to InvestorListItem format
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

  return useQuery<InvestorListResponse>({
    queryKey,
    queryFn: () => fetchAdminInvestorsDirect(filters),
    placeholderData: keepPreviousData,
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: typeof window !== 'undefined', // Only on client
  });
}
