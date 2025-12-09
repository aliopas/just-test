import { useEffect, useMemo } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type {
  InvestorRequest,
  RequestListFilters,
  RequestListResponse,
} from '../types/request';

const QUERY_KEY = ['investorRequests'];

function serializeFilters(filters: RequestListFilters) {
  const params = new URLSearchParams();
  if (filters.page && filters.page > 1) {
    params.set('page', String(filters.page));
  }
  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status);
  }
  if (filters.type && filters.type !== 'all') {
    params.set('type', filters.type);
  }
  return params.toString();
}

async function fetchInvestorRequests(filters: RequestListFilters) {
  const queryString = serializeFilters(filters);
  const path = `/investor/requests${queryString ? `?${queryString}` : ''}`;
  return apiClient<RequestListResponse>(path);
}

export function useInvestorRequests(filters: RequestListFilters) {
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
    queryFn: () => fetchInvestorRequests(filters),
    placeholderData: keepPreviousData,
    // Removed refetchInterval to prevent automatic page refreshes
  });

  // Subscribe to Supabase Realtime to get near-instant updates when requests change
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel('investor-requests-realtime')
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


