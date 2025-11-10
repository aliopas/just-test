import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type { RequestTimelineResponse } from '../types/request';

function fetchRequestTimeline(requestId: string, scope: 'investor' | 'admin') {
  const path =
    scope === 'admin'
      ? `/admin/requests/${requestId}/timeline`
      : `/investor/requests/${requestId}/timeline`;
  return apiClient<RequestTimelineResponse>(path);
}

export function useRequestTimeline(
  requestId?: string | null,
  scope: 'investor' | 'admin' = 'investor'
) {
  return useQuery({
    queryKey: ['requestTimeline', scope, requestId],
    queryFn: () => {
      if (!requestId) {
        throw new Error('requestId is required');
      }
      return fetchRequestTimeline(requestId, scope);
    },
    enabled: Boolean(requestId),
    staleTime: 60_000,
  });
}

