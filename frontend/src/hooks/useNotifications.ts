import { useEffect, useMemo, useState } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  NotificationListFilters,
  NotificationListResponse,
  NotificationItem,
} from '../types/notification';
import { getSupabaseBrowserClient } from '../utils/supabase-client';

const QUERY_KEY = ['notifications'];
const DEFAULT_LIMIT = 20;

// Map database row to frontend format
function mapNotificationRow(row: {
  id: string;
  type: string;
  channel: string;
  payload: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}): NotificationItem {
  return {
    id: row.id,
    type: row.type as NotificationItem['type'],
    channel: row.channel as NotificationItem['channel'],
    payload: row.payload ?? {},
    readAt: row.read_at,
    stateRead: row.read_at != null,
    createdAt: row.created_at,
  };
}

async function fetchNotifications(filters: NotificationListFilters): Promise<NotificationListResponse> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const userId = user.id;
  const page = filters.page ?? 1;
  const limit = DEFAULT_LIMIT;
  const offset = (page - 1) * limit;
  const end = offset + limit - 1;

  // Build query
  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  // Apply status filter
  if (filters.status === 'unread') {
    query = query.is('read_at', null);
  } else if (filters.status === 'read') {
    query = query.not('read_at', 'is', null);
  }

  // Order and paginate
  query = query.order('created_at', { ascending: false }).range(offset, end);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  // Get unread count separately
  const { count: unreadCount, error: unreadCountError } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  if (unreadCountError) {
    console.warn('Failed to get unread count:', unreadCountError);
  }

  const total = count ?? 0;
  const pageCount = limit > 0 ? Math.ceil(total / limit) : 0;
  const notifications = (data ?? []).map(mapNotificationRow);

  return {
    notifications,
    meta: {
      page,
      limit,
      total,
      pageCount,
      hasNext: offset + limit < total,
      hasPrevious: page > 1,
      unreadCount: unreadCount ?? 0,
    },
  };
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

  const supabase = getSupabaseBrowserClient();
  const [userId, setUserId] = useState<string | undefined>(undefined);

  // Get user ID from Supabase session
  useEffect(() => {
    if (!supabase) {
      setUserId(undefined);
      return;
    }

    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (!error && user) {
        setUserId(user.id);
      } else {
        setUserId(undefined);
      }
    });
  }, [supabase]);

  useNotificationsRealtime(userId);

  const query = useQuery<NotificationListResponse>({
    queryKey,
    queryFn: () => fetchNotifications(filters),
    placeholderData: keepPreviousData,
    enabled: Boolean(userId),
    // Removed refetchInterval to prevent automatic page refreshes
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
    mutationFn: async (notificationId: string) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('notifications')
        .update({
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .eq('user_id', user.id)
        .select('id, read_at')
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to mark notification as read: ${error.message}`);
      }

      if (!data) {
        throw new Error('Notification not found');
      }

      return {
        notificationId: data.id,
        readAt: data.read_at as string,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('notifications')
        .update({
          read_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .is('read_at', null)
        .select('id');

      if (error) {
        throw new Error(`Failed to mark all notifications as read: ${error.message}`);
      }

      return {
        updated: data?.length ?? 0,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

