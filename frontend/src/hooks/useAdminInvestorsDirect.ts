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

type UserRow = {
  id: string;
  email: string;
  phone: string | null;
  phone_cc: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  user_id: string;
  full_name: string | null;
  preferred_name: string | null;
  kyc_status: string | null;
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

  // Build query for users with role = 'investor'
  let query = supabase
    .from('users')
    .select(
      `
      id,
      email,
      phone,
      phone_cc,
      role,
      status,
      created_at,
      updated_at
    `,
      { count: 'exact' }
    )
    .eq('role', 'investor');

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.search && filters.search.trim().length > 0) {
    const pattern = `%${filters.search.trim().toLowerCase()}%`;
    query = query.or(`email.ilike.${pattern}`);
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

  const userRows = (users as UserRow[] | null) ?? [];

  // Fetch profiles for these users
  const userIds = userRows.map((u) => u.id);
  let profiles: ProfileRow[] = [];
  
  if (userIds.length > 0) {
    const profilesResult = await supabase
      .from('investor_profiles')
      .select('user_id, full_name, preferred_name, kyc_status')
      .in('user_id', userIds);
    profiles = (profilesResult.data as ProfileRow[] | null) ?? [];
  }

  const profilesByUserId = profiles;
  const profilesMap = profilesByUserId.reduce(
    (acc, profile) => {
      acc[profile.user_id] = profile;
      return acc;
    },
    {} as Record<string, ProfileRow>
  );

  // Apply KYC status filter if needed
  let filteredUsers = userRows;
  if (filters.kycStatus && filters.kycStatus !== 'all') {
    filteredUsers = userRows.filter((user) => {
      const profile = profilesMap[user.id];
      return profile?.kyc_status === filters.kycStatus;
    });
  }

  // Transform to InvestorListItem format
  const investors: InvestorListItem[] = filteredUsers.map((user) => {
    const profile = profilesMap[user.id];
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: profile?.full_name ?? null,
      preferredName: profile?.preferred_name ?? null,
      status: user.status,
      kycStatus: profile?.kyc_status ?? null,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
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
