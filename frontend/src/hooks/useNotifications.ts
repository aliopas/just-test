import { useEffect, useMemo } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type {
  NotificationListFilters,
  NotificationListResponse,
} from '../types/notification';
import { getCurrentUserIdFromToken } from '../utils/auth-token';
import { getSupabaseBrowserClient } from '../utils/supabase-client';

const QUERY_KEY = ['notifications'];

function serializeFilters(filters: NotificationListFilters) {
  const params = new URLSearchParams();
  if (filters.page && filters.page > 1) {
    params.set('page', String(filters.page));
  }
  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status);
  }
  return params.toString();
}

async function fetchNotifications(filters: NotificationListFilters) {
  const queryString = serializeFilters(filters);
  const path = `/notifications${queryString ? `?${queryString}` : ''}`;
  return apiClient<NotificationListResponse>(path);
}

function useNotificationsRealtime(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) {
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel(`notifications:user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);
}

export function useNotifications(filters: NotificationListFilters) {
  const queryKey = useMemo(
    () => [
      ...QUERY_KEY,
      filters.status ?? 'all',
      filters.page ?? 1,
    ],
    [filters.status, filters.page]
  );

  const userId = getCurrentUserIdFromToken();
  useNotificationsRealtime(userId);

  const query = useQuery<NotificationListResponse>({
    queryKey,
    queryFn: () => fetchNotifications(filters),
    placeholderData: keepPreviousData,
    enabled: Boolean(userId),
  });

  return {
    notifications: query.data?.notifications ?? [],
    meta:
      query.data?.meta ?? {
        page: filters.page ?? 1,
        limit: 20,
        total: 0,
        pageCount: 0,
        hasNext: false,
        hasPrevious: false,
        unreadCount: 0,
      },
    ...query,
  };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) =>
      apiClient<{ notificationId: string; readAt: string }>(
        `/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      apiClient<{ updated: number }>(`/notifications/mark-all-read`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

