import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type {
  AdminRequestFilters,
  AdminRequestListResponse,
  AdminRequest,
  AdminRequestListMeta,
} from '../types/admin';

function serializeFilters(filters: AdminRequestFilters) {
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

  if (filters.minAmount != null) {
    params.set('minAmount', String(filters.minAmount));
  }

  if (filters.maxAmount != null) {
    params.set('maxAmount', String(filters.maxAmount));
  }

  if (filters.createdFrom) {
    params.set('createdFrom', filters.createdFrom);
  }

  if (filters.createdTo) {
    params.set('createdTo', filters.createdTo);
  }

  if (filters.search && filters.search.trim().length > 0) {
    params.set('search', filters.search.trim());
  }

  if (filters.sortBy) {
    params.set('sortBy', filters.sortBy);
  }

  if (filters.order) {
    params.set('order', filters.order);
  }

  return params.toString();
}

async function fetchAdminRequests(filters: AdminRequestFilters) {
  const query = serializeFilters(filters);
  const path = `/admin/requests${query ? `?${query}` : ''}`;
  return apiClient<AdminRequestListResponse>(path);
}

export function useAdminRequests(filters: AdminRequestFilters) {
  const queryKey = useMemo(
    () => [
      'adminRequests',
      filters.page ?? 1,
      filters.status ?? 'all',
      filters.type ?? 'all',
      filters.minAmount ?? null,
      filters.maxAmount ?? null,
      filters.createdFrom ?? null,
      filters.createdTo ?? null,
      filters.search ?? '',
      filters.sortBy ?? 'created_at',
      filters.order ?? 'desc',
    ],
    [
      filters.page,
      filters.status,
      filters.type,
      filters.minAmount,
      filters.maxAmount,
      filters.createdFrom,
      filters.createdTo,
      filters.search,
      filters.sortBy,
      filters.order,
    ]
  );

  const query = useQuery<AdminRequestListResponse>({
    queryKey,
    queryFn: () => fetchAdminRequests(filters),
    placeholderData: keepPreviousData,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    requests: (query.data?.requests ?? []) as AdminRequest[],
    meta:
      query.data?.meta ??
      ({
        page: filters.page ?? 1,
        limit: 25,
        total: 0,
        pageCount: 0,
        hasNext: false,
      } satisfies AdminRequestListMeta),
    ...query,
  };
}


