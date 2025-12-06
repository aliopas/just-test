/**
 * Hook لجلب Timeline للطلب مباشرة من Supabase
 * بديل لـ useRequestTimeline الذي يستخدم API backend
 */

import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type { RequestTimelineResponse, RequestTimelineEntry } from '../types/request';
import type { RealtimeChannel } from '@supabase/supabase-js';

type EventRow = {
  id: string;
  request_id: string;
  from_status: string | null;
  to_status: string | null;
  actor_id: string | null;
  note: string | null;
  created_at: string;
};

type CommentRow = {
  id: string;
  request_id: string;
  actor_id: string;
  comment: string;
  created_at: string;
};

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  channel: string;
  payload: unknown;
  read_at: string | null;
  created_at: string;
};

type UserRow = {
  id: string;
  email: string | null;
};

type ProfileRow = {
  user_id: string;
  full_name: string | null;
};

async function fetchRequestTimelineDirect(
  requestId: string,
  scope: 'investor' | 'admin'
): Promise<RequestTimelineResponse> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // Get request number
  const { data: request } = await supabase
    .from('requests')
    .select('request_number')
    .eq('id', requestId)
    .single();

  if (!request) {
    throw new Error('الطلب غير موجود');
  }

  // Fetch events, comments, and notifications in parallel
  const [eventsResult, commentsResult, notificationsResult] = await Promise.all([
    supabase
      .from('request_events')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false }),
    supabase
      .from('request_comments')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false }),
    scope === 'investor'
      ? supabase
          .from('notifications')
          .select('*')
          .eq('request_id', requestId)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);

  const events = (eventsResult.data as EventRow[] | null) ?? [];
  const comments = (commentsResult.data as CommentRow[] | null) ?? [];
  const notifications = (notificationsResult.data as NotificationRow[] | null) ?? [];

  // Fetch actor information
  const actorIds = [
    ...new Set([
      ...events.map((e) => e.actor_id).filter((id): id is string => id !== null),
      ...comments.map((c) => c.actor_id),
    ]),
  ];

  let actors: UserRow[] = [];
  let profiles: ProfileRow[] = [];

  if (actorIds.length > 0) {
    const [actorsResult, profilesResult] = await Promise.all([
      supabase
        .from('users')
        .select('id, email')
        .in('id', actorIds),
      supabase
        .from('investor_profiles')
        .select('user_id, full_name')
        .in('user_id', actorIds),
    ]);

    actors = (actorsResult.data as UserRow[] | null) ?? [];
    profiles = (profilesResult.data as ProfileRow[] | null) ?? [];
  }

  const actorsMap = actors.reduce(
    (acc, actor) => {
      acc[actor.id] = actor;
      return acc;
    },
    {} as Record<string, UserRow>
  );

  const profilesMap = profiles.reduce(
    (acc, profile) => {
      acc[profile.user_id] = profile.full_name;
      return acc;
    },
    {} as Record<string, string | null>
  );

  // Combine and sort all timeline entries
  const timelineEntries: RequestTimelineEntry[] = [
    ...events.map((evt) => ({
      id: evt.id,
      entryType: 'status_change' as const,
      createdAt: evt.created_at,
      visibility: 'admin' as const,
      actor: evt.actor_id
        ? {
            id: actorsMap[evt.actor_id]?.id ?? null,
            email: actorsMap[evt.actor_id]?.email ?? null,
            name: profilesMap[evt.actor_id] ?? null,
          }
        : null,
      event: {
        fromStatus: evt.from_status,
        toStatus: evt.to_status,
        note: evt.note,
      },
    })),
    ...comments.map((comm) => ({
      id: comm.id,
      entryType: 'comment' as const,
      createdAt: comm.created_at,
      visibility: 'admin' as const,
      actor: {
        id: actorsMap[comm.actor_id]?.id ?? null,
        email: actorsMap[comm.actor_id]?.email ?? null,
        name: profilesMap[comm.actor_id] ?? null,
      },
      comment: {
        comment: comm.comment,
      },
    })),
    ...notifications.map((notif) => ({
      id: notif.id,
      entryType: 'notification' as const,
      createdAt: notif.created_at,
      visibility: 'investor' as const,
      actor: null,
      notification: {
        type: notif.type as any,
        channel: notif.channel as any,
        payload: (notif.payload as Record<string, unknown>) ?? {},
        readAt: notif.read_at,
        stateRead: notif.read_at !== null,
        userId: notif.user_id,
      },
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    requestId,
    requestNumber: request.request_number,
    items: timelineEntries,
  };
}

export function useRequestTimelineDirect(
  requestId?: string | null,
  scope: 'investor' | 'admin' = 'investor'
) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const query = useQuery({
    queryKey: ['requestTimelineDirect', scope, requestId],
    queryFn: () => {
      if (!requestId) {
        throw new Error('requestId is required');
      }
      return fetchRequestTimelineDirect(requestId, scope);
    },
    enabled: Boolean(requestId),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!requestId) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    // Create a channel for timeline updates
    const channel = supabase
      .channel(`request-timeline-direct-${scope}-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'request_events',
          filter: `request_id=eq.${requestId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['requestTimelineDirect', scope, requestId],
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'request_comments',
          filter: `request_id=eq.${requestId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['requestTimelineDirect', scope, requestId],
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [requestId, scope, queryClient]);

  return query;
}
