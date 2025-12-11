import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type {
  AdminCreateUserPayload,
  AdminUpdateUserPayload,
  AdminUser,
  AdminUserFilters,
  AdminUserListResponse,
} from '../types/admin-users';

const USERS_ROOT = ['adminUsers'] as const;

const userKeys = {
  list: (filters: AdminUserFilters) => [...USERS_ROOT, 'list', filters] as const,
};

const DEFAULT_LIMIT = 25;

function serializeFilters(filters: AdminUserFilters) {
  const params = new URLSearchParams();
  params.set('page', String(filters.page ?? 1));
  params.set('limit', String(DEFAULT_LIMIT));

  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status);
  }

  if (filters.kycStatus && filters.kycStatus !== 'all') {
    params.set('kycStatus', filters.kycStatus);
  }

  if (filters.search && filters.search.trim().length > 0) {
    params.set('search', filters.search.trim());
  }

  return params.toString();
}

export function useAdminUsers(filters: AdminUserFilters) {
  return useQuery<AdminUserListResponse>({
    queryKey: userKeys.list(filters),
    queryFn: () => {
      const query = serializeFilters(filters);
      const path = query ? `/admin/users?${query}` : '/admin/users';
      return apiClient<AdminUserListResponse>(path);
    },
    placeholderData: keepPreviousData,
    // Removed refetchInterval to prevent automatic page refreshes
  });
}

export function useCreateAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminCreateUserPayload) =>
      apiClient<AdminUser>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_ROOT });
    },
  });
}

export function useUpdateAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: AdminUpdateUserPayload }) =>
      apiClient<AdminUser>(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_ROOT });
    },
  });
}

export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiClient<{ success: boolean; deletedUserId: string }>(`/admin/users/${userId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_ROOT });
    },
  });
}


