/**
 * Hook لجلب طلبات إنشاء الحسابات (Account Requests) مباشرة من Supabase
 * بديل لـ useAdminAccountRequests الذي يستخدم API backend
 */

import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type {
  AdminSignupRequestFilters,
  AdminSignupRequest,
  AdminSignupRequestListResponse,
} from '../types/admin-account-request';

type SignupRequestRow = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  company: string | null;
  message: string | null;
  requested_role: string | null;
  status: 'pending' | 'approved' | 'rejected';
  payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  reviewer_id: string | null;
  reviewed_at: string | null;
  decision_note: string | null;
  approved_user_id: string | null;
};

type AdminSignupRequestViewRow = {
  signup_request_id: string;
  admin_id: string;
  viewed_at: string;
};

async function fetchAdminAccountRequestsDirect(
  filters: AdminSignupRequestFilters
) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const page = filters.page ?? 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from('investor_signup_requests')
    .select(
      `
      id,
      email,
      full_name,
      phone,
      company,
      message,
      requested_role,
      status,
      payload,
      created_at,
      updated_at,
      reviewer_id,
      reviewed_at,
      decision_note,
      approved_user_id
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.search && filters.search.trim().length > 0) {
    const pattern = `%${filters.search.trim().toLowerCase()}%`;
    query = query.or(
      `email.ilike.${pattern},full_name.ilike.${pattern},company.ilike.${pattern}`
    );
  }

  // Apply pagination
  const { data: requests, error: requestsError, count } = await query
    .range(offset, offset + limit - 1);

  if (requestsError) {
    throw new Error(`خطأ في جلب طلبات إنشاء الحسابات: ${requestsError.message}`);
  }

  const requestRows = (requests as SignupRequestRow[] | null) ?? [];

  // Get read status for current admin (if authenticated)
  let readStatusMap: Record<string, boolean> = {};
  if (requestRows.length > 0) {
    const { data: authData } = await supabase.auth.getUser();
    if (authData.user) {
      const requestIds = requestRows.map(r => r.id);
      const { data: views } = await supabase
        .from('admin_signup_request_views')
        .select('signup_request_id')
        .eq('admin_id', authData.user.id)
        .in('signup_request_id', requestIds);

      if (views) {
        readStatusMap = views.reduce(
          (acc, view) => {
            acc[view.signup_request_id as string] = true;
            return acc;
          },
          {} as Record<string, boolean>
        );
      }
    }
  }

  // Transform to AdminSignupRequest format
  const adminRequests: AdminSignupRequest[] = requestRows.map(row => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    company: row.company,
    message: row.message,
    requestedRole: row.requested_role ?? 'investor',
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reviewerId: row.reviewer_id,
    reviewedAt: row.reviewed_at,
    decisionNote: row.decision_note,
    approvedUserId: row.approved_user_id,
    payload: row.payload ?? {},
    isRead: readStatusMap[row.id] ?? false,
  }));

  const total = count ?? 0;
  const pageCount = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    requests: adminRequests,
    meta: {
      page,
      limit,
      total,
      pageCount,
      hasNext: page < pageCount,
    },
  };
}

export function useAdminAccountRequestsDirect(filters: AdminSignupRequestFilters) {
  const queryKey = useMemo(
    () => [
      'adminAccountRequestsDirect',
      filters.page ?? 1,
      filters.status ?? 'all',
      filters.search ?? '',
    ],
    [filters.page, filters.status, filters.search]
  );

  const query = useQuery({
    queryKey,
    queryFn: () => fetchAdminAccountRequestsDirect(filters),
    placeholderData: keepPreviousData,
    // Removed refetchInterval to prevent automatic page refreshes
    enabled: typeof window !== 'undefined', // Only on client
  });

  return {
    requests: (query.data?.requests ?? []) as AdminSignupRequest[],
    meta:
      query.data?.meta ??
      ({
        page: filters.page ?? 1,
        limit: 20,
        total: 0,
        pageCount: 0,
        hasNext: false,
      } satisfies AdminSignupRequestListResponse['meta']),
    ...query,
  };
}
