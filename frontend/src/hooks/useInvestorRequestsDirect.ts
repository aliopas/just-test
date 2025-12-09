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
  RequestCurrency,
  RequestType,
  RequestStatus,
} from '../types/request';

const QUERY_KEY = ['investorRequestsDirect'];

// Helper functions to convert string types to typed enums
function toRequestCurrency(value: string | null): RequestCurrency | null {
  if (!value) return null;
  const validCurrencies: RequestCurrency[] = ['SAR', 'USD', 'EUR'];
  return validCurrencies.includes(value as RequestCurrency) ? (value as RequestCurrency) : null;
}

function toRequestType(value: string): RequestType {
  const validTypes: RequestType[] = ['buy', 'sell', 'partnership', 'board_nomination', 'feedback'];
  return validTypes.includes(value as RequestType) ? (value as RequestType) : 'buy';
}

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

  // Query requests table directly (RLS will filter by user_id automatically)
  // Get the last event for each request using a subquery
  let query = supabase
    .from('requests')
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
      updated_at
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
  const result = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  const data = result.data;
  const error = result.error;
  const count = result.count;

  // Fetch last event for each request separately
  // This is done after getting the requests to avoid complex joins
  const requestIds = (data ?? []).map((r: any) => r.id);
  let lastEventsMap: Record<string, any> = {};
  
  if (requestIds.length > 0) {
    // Get the most recent event for each request
    const { data: eventsData } = await supabase
      .from('request_events')
      .select('request_id, id, from_status, to_status, actor_id, note, created_at')
      .in('request_id', requestIds)
      .order('created_at', { ascending: false });

    // Group by request_id and take the first (most recent) event for each
    if (eventsData) {
      const eventsByRequest: Record<string, any[]> = {};
      eventsData.forEach((event: any) => {
        if (!eventsByRequest[event.request_id]) {
          eventsByRequest[event.request_id] = [];
        }
        eventsByRequest[event.request_id].push(event);
      });

      // Get the most recent event for each request
      Object.keys(eventsByRequest).forEach((requestId) => {
        const events = eventsByRequest[requestId];
        if (events.length > 0) {
          lastEventsMap[requestId] = events[0]; // Most recent is first due to ordering
        }
      });
    }
  }

  if (error) {
    throw new Error(`خطأ في جلب الطلبات: ${error.message}`);
  }

  const rows = (data as any[] | null) ?? [];

  // Transform to InvestorRequest format
  const requests: InvestorRequest[] = rows.map((row: any) => {
    const lastEvent = lastEventsMap[row.id];
    return {
      id: row.id,
      requestNumber: row.request_number,
      type: toRequestType(row.type),
      amount: typeof row.amount === 'string' ? Number(row.amount) : row.amount ?? null,
      currency: toRequestCurrency(row.currency),
      targetPrice:
        typeof row.target_price === 'string'
          ? Number.parseFloat(row.target_price)
          : row.target_price ?? null,
      expiryAt: row.expiry_at,
      status: toRequestStatus(row.status),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastEvent: lastEvent
        ? {
            id: lastEvent.id ?? null,
            fromStatus: lastEvent.from_status ? toRequestStatus(lastEvent.from_status) : null,
            toStatus: lastEvent.to_status ? toRequestStatus(lastEvent.to_status) : null,
            actorId: lastEvent.actor_id ?? null,
            note: lastEvent.note ?? null,
            createdAt: lastEvent.created_at ?? null,
          }
        : null,
    };
  });

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

    let channel: any = null;

    // Get current user ID for filtering
    supabase.auth.getUser().then(({ data: authData }) => {
      if (!authData.user) return;

      const userId = authData.user.id;

      channel = supabase
        .channel('investor-requests-realtime-direct')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'requests',
            filter: `user_id=eq.${userId}`, // Only listen to changes for current user's requests
          },
          () => {
            // Invalidate all investor requests queries so they refetch with fresh data
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
          }
        )
        .subscribe();
    });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
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
