import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type { RequestTimelineResponse } from '../types/request';

function fetchRequestTimeline(requestId: string, scope: 'investor' | 'admin') {
  const path =
    scope === 'admin'
      ? `/admin/requests/${requestId}/timeline`
      : `/investor/requests/${requestId}/timeline`;
  return apiClient<RequestTimelineResponse>(path);
}

export function useRequestTimeline(
  requestId?: string | null,
  scope: 'investor' | 'admin' = 'investor'
) {
  const queryClient = useQueryClient();
  // Use a loose type here to avoid cross-package RealtimeChannel type mismatches in Netlify builds
  const channelRef = useRef<unknown | null>(null);

  const query = useQuery({
    queryKey: ['requestTimeline', scope, requestId],
    queryFn: () => {
      if (!requestId) {
        throw new Error('requestId is required');
      }
      return fetchRequestTimeline(requestId, scope);
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
      .channel(`request-timeline-${scope}-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'request_events',
          filter: `request_id=eq.${requestId}`,
        },
        () => {
          // Invalidate and refetch timeline when new event is added
          queryClient.invalidateQueries({
            queryKey: ['requestTimeline', scope, requestId],
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
          // Invalidate timeline when new comment is added
          queryClient.invalidateQueries({
            queryKey: ['requestTimeline', scope, requestId],
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to realtime timeline updates for request ${requestId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to realtime timeline updates for request ${requestId}`);
        }
      });

    channelRef.current = channel;

    // Cleanup: unsubscribe when component unmounts or requestId/scope changes
    return () => {
      if (channelRef.current) {
        // Type cast is safe here because channelRef is only ever assigned from supabase.channel(...)
        supabase.removeChannel(channelRef.current as any);
        channelRef.current = null;
      }
    };
  }, [requestId, scope, queryClient]);

  return query;
}

