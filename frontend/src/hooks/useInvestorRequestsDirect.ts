/**
 * Hook لجلب طلبات المستثمر مباشرة من Supabase
 * بديل لـ useInvestorRequests الذي يستخدم API backend
 * 
 * هذا الـ hook يستخدم Supabase مباشرة مثل الصفحة الرئيسية
 */

import { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type {
  InvestorRequest,
  RequestListFilters,
  RequestListResponse,
} from '../types/request';

const QUERY_KEY = ['investorRequestsDirect'];

type RequestWorkflowRow = {
  id: string;
  request_number: string;
  type: string;
  amount: number | string | null;
  currency: string | null;
  target_price: number | string | null;
  expiry_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  last_event: {
    id: string | null;
    from_status: string | null;
    to_status: string | null;
    actor_id: string | null;
    note: string | null;
    created_at: string | null;
  } | null;
};

async function fetchInvestorRequestsDirect(filters: RequestListFilters) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // Get current user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('يجب تسجيل الدخول لعرض الطلبات');
  }

  const userId = authData.user.id;
  const page = filters.page ?? 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  // Build query using v_request_workflow view
  let query = supabase
    .from('v_request_workflow')
    .select(
      `
      id,
      request_number,
      type,
      amount,
      currency,
      target_price,
      expiry_at,
      status,
      created_at,
      updated_at,
      last_event
    `,
      { count: 'exact' }
    )
    .eq('user_id', userId);

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.type && filters.type !== 'all') {
    if (Array.isArray(filters.type)) {
      query = query.in('type', filters.type);
    } else {
      query = query.eq('type', filters.type);
    }
  }

  // Apply ordering and pagination
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`خطأ في جلب الطلبات: ${error.message}`);
  }

  const rows = (data as RequestWorkflowRow[] | null) ?? [];

  // Transform to InvestorRequest format
  const requests: InvestorRequest[] = rows.map(row => ({
    id: row.id,
    requestNumber: row.request_number,
    type: row.type as any,
    amount: typeof row.amount === 'string' ? Number(row.amount) : row.amount,
    currency: row.currency ?? null,
    targetPrice:
      typeof row.target_price === 'string'
        ? Number.parseFloat(row.target_price)
        : row.target_price,
    expiryAt: row.expiry_at,
    status: row.status as any,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastEvent: row.last_event
      ? {
          id: row.last_event.id ?? undefined,
          fromStatus: row.last_event.from_status ?? undefined,
          toStatus: row.last_event.to_status ?? undefined,
          actorId: row.last_event.actor_id ?? undefined,
          note: row.last_event.note ?? undefined,
          createdAt: row.last_event.created_at ?? undefined,
        }
      : null,
  }));

  const total = count ?? 0;
  const pageCount = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    requests,
    meta: {
      page,
      limit,
      total,
      pageCount,
      hasNext: page < pageCount,
    },
  };
}

export function useInvestorRequestsDirect(filters: RequestListFilters) {
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => [
      ...QUERY_KEY,
      filters.status ?? 'all',
      filters.type ?? 'all',
      filters.page ?? 1,
    ],
    [filters.status, filters.type, filters.page]
  );

  const query = useQuery<RequestListResponse>({
    queryKey,
    queryFn: () => fetchInvestorRequestsDirect(filters),
    placeholderData: keepPreviousData,
    refetchInterval: 30000, // Fallback polling every 30 seconds
    enabled: typeof window !== 'undefined', // Only on client
  });

  // Subscribe to Supabase Realtime to get near-instant updates
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel('investor-requests-realtime-direct')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
        },
        () => {
          // Invalidate all investor requests queries so they refetch with fresh data
          queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    requests: (query.data?.requests ?? []) as InvestorRequest[],
    meta: query.data?.meta ?? {
      page: filters.page ?? 1,
      limit: 10,
      total: 0,
      pageCount: 0,
      hasNext: false,
    },
    ...query,
  };
}
