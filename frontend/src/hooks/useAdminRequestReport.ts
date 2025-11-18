import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type {
  AdminRequestReportFilters,
  AdminRequestReportResponse,
} from '../types/admin-reports';

function buildQueryParams(filters: AdminRequestReportFilters) {
  const params = new URLSearchParams();
  if (filters.from) {
    params.set('from', filters.from);
  }
  if (filters.to) {
    params.set('to', filters.to);
  }
  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status.join(','));
  }
  if (filters.type && filters.type !== 'all') {
    params.set('type', filters.type);
  }
  if (filters.minAmount !== undefined) {
    params.set('minAmount', String(filters.minAmount));
  }
  if (filters.maxAmount !== undefined) {
    params.set('maxAmount', String(filters.maxAmount));
  }
  return params.toString();
}

export function useAdminRequestReport(filters: AdminRequestReportFilters) {
  return useQuery({
    queryKey: ['adminRequestReport', filters],
    queryFn: async () => {
      const query = buildQueryParams(filters);
      const url = query ? `/admin/reports/requests?${query}` : '/admin/reports/requests';
      return apiClient<AdminRequestReportResponse>(url);
    },
    staleTime: 60_000,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

