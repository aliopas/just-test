/**
 * Hooks لجلب وإدارة الإشعارات مباشرة من Supabase
 * بديل لـ useNotifications الذي يستخدم API backend
 */

import { useEffect, useMemo, useState } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type {
  NotificationListFilters,
  NotificationListResponse,
  NotificationItem,
  NotificationChannel,
  NotificationType,
} from '../types/notification';

const QUERY_KEY = ['notificationsDirect'] as const;

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  channel: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

function toNotificationChannel(value: string): NotificationChannel {
  const validChannels: NotificationChannel[] = ['email', 'sms', 'in_app'];
  return validChannels.includes(value as NotificationChannel)
    ? (value as NotificationChannel)
    : 'in_app';
}

function toNotificationType(value: string): NotificationType {
  const validTypes: NotificationType[] = [
    'request_submitted',
    'request_pending_info',
    'request_approved',
    'request_rejected',
    'request_settling',
    'request_completed',
    'news_published',
    'news_approved',
    'news_rejected',
  ];
  return validTypes.includes(value as NotificationType)
    ? (value as NotificationType)
    : 'request_submitted';
}

async function fetchNotificationsDirect(
  filters: NotificationListFilters
): Promise<NotificationListResponse> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }

  const page = filters.page ?? 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Apply status filter
  if (filters.status === 'unread') {
    query = query.is('read_at', null);
  } else if (filters.status === 'read') {
    query = query.not('read_at', 'is', null);
  }

  // Apply pagination
  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`خطأ في جلب الإشعارات: ${error.message}`);
  }

  const rows = (data as NotificationRow[] | null) ?? [];
  const total = count ?? 0;
  const pageCount = total === 0 ? 0 : Math.ceil(total / limit);

  // Get unread count
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null);

  // Transform to NotificationItem format
  const notifications: NotificationItem[] = rows.map((row) => ({
    id: row.id,
    type: toNotificationType(row.type),
    channel: toNotificationChannel(row.channel),
    payload: row.payload ?? {},
    readAt: row.read_at,
    stateRead: row.read_at !== null,
    createdAt: row.created_at,
  }));

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

function useNotificationsRealtimeDirect(userId: string | undefined) {
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
      .channel(`notifications-direct:user:${userId}`)
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

export function useNotificationsDirect(filters: NotificationListFilters) {
  const queryKey = useMemo(
    () => [
      ...QUERY_KEY,
      filters.status ?? 'all',
      filters.page ?? 1,
    ],
    [filters.status, filters.page]
  );

  // Get current user ID
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id);
    });
  }, []);

  useNotificationsRealtimeDirect(userId);

  const query = useQuery<NotificationListResponse>({
    queryKey,
    queryFn: () => fetchNotificationsDirect(filters),
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

async function markNotificationReadDirect(notificationId: string): Promise<{
  notificationId: string;
  readAt: string;
}> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }

  const readAt = new Date().toISOString();

  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: readAt })
    .eq('id', notificationId)
    .eq('user_id', user.id)
    .select('id, read_at')
    .maybeSingle();

  if (error) {
    throw new Error(`فشل في تحديث الإشعار: ${error.message}`);
  }

  if (!data) {
    throw new Error('الإشعار غير موجود أو لا يمكن الوصول إليه');
  }

  return {
    notificationId: data.id,
    readAt: data.read_at as string,
  };
}

async function markAllNotificationsReadDirect(): Promise<{ updated: number }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }

  const readAt = new Date().toISOString();

  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: readAt })
    .eq('user_id', user.id)
    .is('read_at', null)
    .select('id');

  if (error) {
    throw new Error(`فشل في تحديث الإشعارات: ${error.message}`);
  }

  return {
    updated: data?.length ?? 0,
  };
}

export function useMarkNotificationReadDirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationReadDirect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useMarkAllNotificationsReadDirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsReadDirect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
