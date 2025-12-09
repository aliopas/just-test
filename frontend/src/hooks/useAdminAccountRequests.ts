import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiClient } from '../utils/api-client';
import type {
  AdminSignupRequestFilters,
  AdminSignupRequestListResponse,
  ApproveSignupRequestPayload,
  RejectSignupRequestPayload,
  AdminSignupRequest,
} from '../types/admin-account-request';

const ACCOUNT_REQUESTS_ROOT = ['adminAccountRequests'] as const;

const requestKeys = {
  list: (filters: AdminSignupRequestFilters) =>
    [...ACCOUNT_REQUESTS_ROOT, 'list', filters] as const,
};

const DEFAULT_LIMIT = 20;

function serializeFilters(filters: AdminSignupRequestFilters) {
  const params = new URLSearchParams();
  params.set('page', String(filters.page ?? 1));
  params.set('limit', String(DEFAULT_LIMIT));

  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status);
  }

  if (filters.search && filters.search.trim().length > 0) {
    params.set('search', filters.search.trim());
  }

  return params.toString();
}

export function useAdminAccountRequests(filters: AdminSignupRequestFilters) {
  return useQuery<AdminSignupRequestListResponse>({
    queryKey: requestKeys.list(filters),
    queryFn: () => {
      const query = serializeFilters(filters);
      const path = query
        ? `/admin/account-requests?${query}`
        : '/admin/account-requests';
      return apiClient<AdminSignupRequestListResponse>(path);
    },
    placeholderData: keepPreviousData,
    // Removed refetchInterval to prevent automatic page refreshes
  });
}

export function useApproveAccountRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApproveSignupRequestPayload) =>
      apiClient<{ request: AdminSignupRequest }>(
        `/admin/account-requests/${payload.id}/approve`,
        {
          method: 'POST',
          body: JSON.stringify({
            note: payload.note,
            sendInvite: payload.sendInvite ?? true,
            locale: payload.locale ?? 'ar',
          }),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_REQUESTS_ROOT });
    },
  });
}

export function useRejectAccountRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RejectSignupRequestPayload) =>
      apiClient<{ request: AdminSignupRequest }>(
        `/admin/account-requests/${payload.id}/reject`,
        {
          method: 'POST',
          body: JSON.stringify({
            note: payload.note,
          }),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_REQUESTS_ROOT });
    },
  });
}

export function useUnreadSignupRequestCount() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: [...ACCOUNT_REQUESTS_ROOT, 'unreadCount'] as const,
    queryFn: () => apiClient<{ unreadCount: number }>('/admin/account-requests/unread-count'),
    // Removed refetchInterval to prevent automatic page refreshes
  });

  // Invalidate list queries when unread count changes
  useEffect(() => {
    if (query.isSuccess) {
      queryClient.invalidateQueries({ queryKey: [...ACCOUNT_REQUESTS_ROOT, 'list'] });
    }
  }, [query.isSuccess, query.data?.unreadCount, queryClient]);

  return query;
}

export function useMarkSignupRequestRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      return apiClient<{ requestId: string; viewedAt: string }>(
        `/admin/account-requests/${requestId}/mark-read`,
        {
          method: 'POST',
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_REQUESTS_ROOT });
    },
  });
}

