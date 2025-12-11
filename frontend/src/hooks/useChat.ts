import { useEffect, useMemo } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type {
  ConversationListResponse,
  MessageListResponse,
  SendMessageRequest,
  SendMessageResponse,
} from '../types/chat';
import { getCurrentUserIdFromToken } from '../utils/auth-token';
import { getSupabaseBrowserClient } from '../utils/supabase-client';

const CONVERSATIONS_QUERY_KEY = ['chat', 'conversations'];
const MESSAGES_QUERY_KEY = ['chat', 'messages'];

function serializeFilters(page?: number, limit?: number) {
  const params = new URLSearchParams();
  if (page && page > 1) {
    params.set('page', String(page));
  }
  if (limit) {
    params.set('limit', String(limit));
  }
  return params.toString();
}

async function fetchConversations(page?: number, limit?: number) {
  const queryString = serializeFilters(page, limit);
  const path = `/chat/conversations${queryString ? `?${queryString}` : ''}`;
  return apiClient<ConversationListResponse>(path);
}

async function fetchMessages(conversationId: string, page?: number, limit?: number) {
  const queryString = serializeFilters(page, limit);
  const path = `/chat/conversations/${conversationId}/messages${queryString ? `?${queryString}` : ''}`;
  return apiClient<MessageListResponse>(path);
}

function useMessagesRealtime(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) {
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel(`chat:messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [...MESSAGES_QUERY_KEY, conversationId] });
          queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, conversationId]);
}

function useConversationsRealtime(userId: string | undefined) {
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
      .channel(`chat:conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);
}

export function useConversations(page?: number, limit?: number) {
  const queryKey = useMemo(
    () => [...CONVERSATIONS_QUERY_KEY, page ?? 1, limit ?? 20],
    [page, limit]
  );

  const userId = getCurrentUserIdFromToken();
  useConversationsRealtime(userId);

  const query = useQuery<ConversationListResponse>({
    queryKey,
    queryFn: () => fetchConversations(page, limit),
    placeholderData: keepPreviousData,
    enabled: Boolean(userId),
  });

  return {
    conversations: query.data?.conversations ?? [],
    meta:
      query.data?.meta ?? {
        page: page ?? 1,
        limit: limit ?? 20,
        total: 0,
        pageCount: 0,
        hasNext: false,
        hasPrevious: false,
      },
    ...query,
  };
}

export function useMessages(conversationId: string | undefined, page?: number, limit?: number) {
  const queryKey = useMemo(
    () => [...MESSAGES_QUERY_KEY, conversationId, page ?? 1, limit ?? 50],
    [conversationId, page, limit]
  );

  useMessagesRealtime(conversationId);

  const query = useQuery<MessageListResponse>({
    queryKey,
    queryFn: () => fetchMessages(conversationId!, page, limit),
    placeholderData: keepPreviousData,
    enabled: Boolean(conversationId),
  });

  return {
    messages: query.data?.messages ?? [],
    meta:
      query.data?.meta ?? {
        page: page ?? 1,
        limit: limit ?? 50,
        total: 0,
        pageCount: 0,
        hasNext: false,
        hasPrevious: false,
      },
    ...query,
  };
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendMessageRequest) =>
      apiClient<SendMessageResponse>('/chat/messages', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...MESSAGES_QUERY_KEY, data.conversation.id] });
    },
  });
}

export function useMarkMessagesRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) =>
      apiClient<{ updated: number }>(`/chat/conversations/${conversationId}/read`, {
        method: 'POST',
      }),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: [...MESSAGES_QUERY_KEY, conversationId] });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });
}

