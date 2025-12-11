import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type { AdminContentAnalyticsResponse } from '../types/admin-content-analytics';

type ContentAnalyticsParams = {
  days?: number;
  limitTop?: number;
};

function buildQuery(params?: ContentAnalyticsParams) {
  if (!params) {
    return '';
  }
  const search = new URLSearchParams();
  if (params.days) {
    search.set('days', String(params.days));
  }
  if (params.limitTop) {
    search.set('limitTop', String(params.limitTop));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

async function fetchAdminContentAnalytics(
  params?: ContentAnalyticsParams
): Promise<AdminContentAnalyticsResponse> {
  const query = buildQuery(params);
  return apiClient<AdminContentAnalyticsResponse>(
    `/admin/analytics/content${query}`
  );
}

export function useAdminContentAnalytics(params?: ContentAnalyticsParams) {
  return useQuery({
    queryKey: ['adminContentAnalytics', params ?? {}],
    queryFn: () => fetchAdminContentAnalytics(params),
    staleTime: 60_000,
    refetchOnWindowFocus: false, // Prevent automatic refetch when window gains focus
    refetchOnMount: false, // Prevent refetch on component mount if data exists
    refetchOnReconnect: false, // Prevent refetch on network reconnect
  });
}


