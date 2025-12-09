import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type { InvestorDashboardResponse } from '../types/dashboard';

function fetchInvestorDashboard() {
  return apiClient<InvestorDashboardResponse>('/investor/dashboard');
}

export function useInvestorDashboard() {
  return useQuery({
    queryKey: ['investorDashboard'],
    queryFn: fetchInvestorDashboard,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    // Removed refetchInterval to prevent automatic page refreshes
  });
}

