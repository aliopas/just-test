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
    refetchOnWindowFocus: false, // Prevent automatic refetch when window gains focus
    refetchOnMount: false, // Prevent refetch on component mount if data exists
    refetchOnReconnect: false, // Prevent refetch on network reconnect
    // Removed refetchInterval to prevent automatic page refreshes
  });
}

