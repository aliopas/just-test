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

  // Step 1: Get all user IDs that have investor_profiles
  const { data: investorUserIds, error: investorIdsError } = await supabase
    .from('investor_profiles')
    .select('user_id, full_name, preferred_name, kyc_status');

  if (investorIdsError) {
    throw new Error(`خطأ في جلب معرفات المستثمرين: ${investorIdsError.message}`);
  }

  const investorIds = (investorUserIds ?? []).map(p => p.user_id);
  const profilesMap = new Map(
    (investorUserIds ?? []).map(p => [p.user_id, p])
  );

  // If no investors found, return empty result
  if (investorIds.length === 0) {
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

  // Step 2: Query users table for investors
  let query = supabase
    .from('users')
    .select('id, email, phone, phone_cc, status, created_at, updated_at', { count: 'exact' })
    .in('id', investorIds);

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  // Apply search filter
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
    throw new Error(`خطأ في جلب المستثمرين: ${usersError.message}`);
  }

  const userRows = (users as any[] | null) ?? [];

  // Step 3: Apply KYC status filter if needed
  let filteredUsers = userRows;
  if (filters.kycStatus && filters.kycStatus !== 'all') {
    filteredUsers = userRows.filter((user) => {
      const profile = profilesMap.get(user.id);
      return profile?.kyc_status === filters.kycStatus;
    });
  }

  // Step 4: Transform to InvestorListItem format
  const investors: InvestorListItem[] = filteredUsers.map((user) => {
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
      console.log('[useAdminInvestorsDirect] Investor data:', {
        userId: user.id,
        email: user.email,
        phone: phone,
        fullName: profile?.full_name,
        finalInvestor: investor,
      });
    }
    
    return investor;
  });

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
