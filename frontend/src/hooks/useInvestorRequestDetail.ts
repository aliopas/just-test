import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type { InvestorRequestDetail } from '../types/request';

function fetchInvestorRequestDetail(requestId: string) {
  return apiClient<InvestorRequestDetail>(`/investor/requests/${requestId}`);
}

export function useInvestorRequestDetail(requestId?: string | null) {
  return useQuery({
    queryKey: ['investorRequestDetail', requestId],
    queryFn: () => {
      if (!requestId) {
        throw new Error('requestId is required');
      }
      return fetchInvestorRequestDetail(requestId);
    },
    enabled: Boolean(requestId),
    staleTime: 60_000,
  });
}

