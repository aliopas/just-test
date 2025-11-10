import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type {
  AdminAuditLogFilters,
  AdminAuditLogResponse,
} from '../types/admin-audit';

function buildQuery(filters: AdminAuditLogFilters) {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.actorId) params.set('actorId', filters.actorId);
  if (filters.action) params.set('action', filters.action);
  if (filters.resourceType) params.set('resourceType', filters.resourceType);
  if (filters.resourceId) params.set('resourceId', filters.resourceId);
  return params.toString();
}

export function useAdminAuditLogs(filters: AdminAuditLogFilters) {
  return useQuery<AdminAuditLogResponse>({
    queryKey: ['adminAuditLogs', filters],
    queryFn: async () => {
      const query = buildQuery(filters);
      const url = query
        ? `/admin/audit-logs?${query}`
        : '/admin/audit-logs';
      return apiClient<AdminAuditLogResponse>(url);
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

