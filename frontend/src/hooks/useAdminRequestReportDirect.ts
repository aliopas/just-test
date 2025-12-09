/**
 * Hook لجلب تقرير الطلبات للإدارة مباشرة من Supabase
 * بديل لـ useAdminRequestReport الذي يستخدم API backend
 */

import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type {
  AdminRequestReportFilters,
  AdminRequestReportResponse,
  AdminRequestReportItem,
} from '../types/admin-reports';
import type { RequestStatus, RequestType } from '../types/request';

type RequestRow = {
  id: string;
  request_number: string;
  status: string;
  type: string;
  amount: number | string | null;
  currency: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
};

type UserRow = {
  id: string;
  email: string | null;
};

type ProfileRow = {
  user_id: string;
  full_name: string | null;
};

function toRequestStatus(value: string): RequestStatus {
  const validStatuses: RequestStatus[] = [
    'draft',
    'submitted',
    'screening',
    'pending_info',
    'compliance_review',
    'approved',
    'rejected',
    'settling',
    'completed',
  ];
  return validStatuses.includes(value as RequestStatus) ? (value as RequestStatus) : 'draft';
}

function toRequestType(value: string): RequestType {
  const validTypes: RequestType[] = ['buy', 'sell', 'partnership', 'board_nomination', 'feedback'];
  return validTypes.includes(value as RequestType) ? (value as RequestType) : 'buy';
}

async function fetchAdminRequestReportDirect(
  filters: AdminRequestReportFilters
): Promise<AdminRequestReportResponse> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // Build query
  let query = supabase
    .from('requests')
    .select(
      `
      id,
      request_number,
      status,
      type,
      amount,
      currency,
      created_at,
      updated_at,
      user_id
    `
    )
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.from) {
    query = query.gte('created_at', filters.from);
  }

  if (filters.to) {
    query = query.lte('created_at', filters.to);
  }

  if (filters.status && filters.status !== 'all' && Array.isArray(filters.status)) {
    query = query.in('status', filters.status);
  } else if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.type && filters.type !== 'all') {
    query = query.eq('type', filters.type);
  }

  if (filters.minAmount !== undefined) {
    query = query.gte('amount', filters.minAmount);
  }

  if (filters.maxAmount !== undefined) {
    query = query.lte('amount', filters.maxAmount);
  }

  const { data: requests, error: requestsError } = await query;

  if (requestsError) {
    throw new Error(`خطأ في جلب تقرير الطلبات: ${requestsError.message}`);
  }

  const requestRows = (requests as RequestRow[] | null) ?? [];

  // Fetch user information
  const userIds = [...new Set(requestRows.map((r) => r.user_id))];
  
  let users: UserRow[] = [];
  let profiles: ProfileRow[] = [];

  if (userIds.length > 0) {
    const [usersResult, profilesResult] = await Promise.all([
      supabase
        .from('users')
        .select('id, email')
        .in('id', userIds),
      supabase
        .from('investor_profiles')
        .select('user_id, full_name')
        .in('user_id', userIds),
    ]);

    users = (usersResult.data as UserRow[] | null) ?? [];
    profiles = (profilesResult.data as ProfileRow[] | null) ?? [];
  }

  const usersById = users.reduce(
    (acc, user) => {
      acc[user.id] = user;
      return acc;
    },
    {} as Record<string, UserRow>
  );

  const profilesByUserId = profiles.reduce(
    (acc, profile) => {
      acc[profile.user_id] = profile.full_name;
      return acc;
    },
    {} as Record<string, string | null>
  );

  // Transform to AdminRequestReportItem format
  const items: AdminRequestReportItem[] = requestRows.map((row) => {
    const user = usersById[row.user_id];
    const investorName = profilesByUserId[row.user_id];

    return {
      id: row.id,
      requestNumber: row.request_number,
      status: toRequestStatus(row.status),
      type: toRequestType(row.type),
      amount: typeof row.amount === 'string' ? Number(row.amount) : (row.amount ?? 0),
      currency: row.currency ?? 'SAR',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      investorEmail: user?.email ?? null,
      investorName: investorName ?? null,
    };
  });

  return {
    format: 'json',
    requests: items,
    generatedAt: new Date().toISOString(),
  };
}

export function useAdminRequestReportDirect(filters: AdminRequestReportFilters) {
  const queryKey = [
    'adminRequestReportDirect',
    filters.from ?? '',
    filters.to ?? '',
    filters.status ?? 'all',
    filters.type ?? 'all',
    filters.minAmount ?? '',
    filters.maxAmount ?? '',
  ] as const;

  return useQuery<AdminRequestReportResponse>({
    queryKey,
    queryFn: () => fetchAdminRequestReportDirect(filters),
    staleTime: 60_000,
    // Removed refetchInterval to prevent automatic page refreshes
    enabled: typeof window !== 'undefined', // Only on client
  });
}
