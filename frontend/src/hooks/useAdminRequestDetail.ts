import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type { AdminRequestDetail } from '../types/admin';
import type { RealtimeChannel } from '@supabase/supabase-js';

async function fetchAdminRequestDetail(requestId: string) {
  return apiClient<AdminRequestDetail>(`/admin/requests/${requestId}`);
}

export function useAdminRequestDetail(requestId?: string | null) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const query = useQuery({
    queryKey: ['adminRequestDetail', requestId],
    queryFn: () => {
      if (!requestId) {
        throw new Error('requestId is required');
      }
      return fetchAdminRequestDetail(requestId);
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

    // Create a channel for this request
    const channel = supabase
      .channel(`admin-request-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'requests',
          filter: `id=eq.${requestId}`,
        },
        () => {
          // Invalidate and refetch when request is updated
          queryClient.invalidateQueries({
            queryKey: ['adminRequestDetail', requestId],
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'request_events',
          filter: `request_id=eq.${requestId}`,
        },
        () => {
          // Invalidate timeline when new event is added
          queryClient.invalidateQueries({
            queryKey: ['requestTimeline', 'admin', requestId],
          });
          // Also refetch request detail to get updated status
          queryClient.invalidateQueries({
            queryKey: ['adminRequestDetail', requestId],
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
          // Invalidate request detail when new comment is added
          queryClient.invalidateQueries({
            queryKey: ['adminRequestDetail', requestId],
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to realtime updates for request ${requestId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to realtime updates for request ${requestId}`);
        }
      });

    channelRef.current = channel;

    // Cleanup: unsubscribe when component unmounts or requestId changes
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [requestId, queryClient]);

  return query;
}


