import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type { AdminDashboardStats } from '../types/admin-dashboard';

function fetchAdminDashboardStats() {
  return apiClient<AdminDashboardStats>('/admin/dashboard/stats');
}

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: fetchAdminDashboardStats,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

