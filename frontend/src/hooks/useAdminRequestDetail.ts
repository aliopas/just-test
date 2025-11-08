import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type { AdminRequestDetail } from '../types/admin';

async function fetchAdminRequestDetail(requestId: string) {
  return apiClient<AdminRequestDetail>(`/admin/requests/${requestId}`);
}

export function useAdminRequestDetail(requestId?: string | null) {
  return useQuery({
    queryKey: ['adminRequestDetail', requestId],
    queryFn: () => {
      if (!requestId) {
        throw new Error('requestId is required');
      }
      return fetchAdminRequestDetail(requestId);
    },
    enabled: Boolean(requestId),
    staleTime: 60_000,
  });
}

