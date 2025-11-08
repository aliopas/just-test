import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
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
  return params.toString();
}

async function fetchInvestorRequests(filters: RequestListFilters) {
  const queryString = serializeFilters(filters);
  const path = `/investor/requests${queryString ? `?${queryString}` : ''}`;
  return apiClient<RequestListResponse>(path);
}

export function useInvestorRequests(filters: RequestListFilters) {
  const queryKey = useMemo(
    () => [
      ...QUERY_KEY,
      filters.status ?? 'all',
      filters.page ?? 1,
    ],
    [filters.status, filters.page]
  );

  const query = useQuery({
    queryKey,
    queryFn: () => fetchInvestorRequests(filters),
    keepPreviousData: true,
  });

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

