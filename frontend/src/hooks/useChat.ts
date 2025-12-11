import { useEffect, useMemo, useRef, useState } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import { useAuth } from '../context/AuthContext';
import type {
  Conversation,
  ConversationWithParticipant,
  Message,
  SendMessageRequest,
} from '../types/chat';

const CONVERSATIONS_QUERY_KEY = ['chat', 'conversations'];
const MESSAGES_QUERY_KEY = ['chat', 'messages'];
const INVESTORS_QUERY_KEY = ['chat', 'investors'];

// Fetch conversations directly from Supabase
async function fetchConversationsFromSupabase(
  userId: string,
  role: 'investor' | 'admin',
  page: number = 1,
  limit: number = 20
): Promise<{ conversations: ConversationWithParticipant[]; total: number }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  const offset = (page - 1) * limit;

  let query = supabase
    .from('chat_conversations')
    .select('*', { count: 'exact' });

  if (role === 'investor') {
    query = query.eq('user_id', userId);
  }
  // Admin can see all conversations (no filter needed - RLS policy handles access)

  query = query
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`);
  }

  const conversations = (data || []).map(conv => ({
    id: conv.id,
    investorId: conv.user_id,
    adminId: conv.admin_id,
    lastMessageAt: conv.last_message_at,
    createdAt: conv.created_at,
    updatedAt: conv.updated_at,
  }));

  // Fetch participant info and unread counts
  const conversationsWithParticipants: ConversationWithParticipant[] = await Promise.all(
    conversations.map(async (conv) => {
      const participantId = role === 'investor' ? conv.adminId : conv.investorId;
      
      let participant = null;
      if (participantId) {
        const { data: userData } = await supabase
          .from('users')
          .select('id, email')
          .eq('id', participantId)
          .single();

        const { data: profileData } = await supabase
          .from('investor_profiles')
          .select('full_name')
          .eq('user_id', participantId)
          .single();

        if (userData) {
          participant = {
            id: userData.id,
            email: userData.email,
            fullName: profileData?.full_name || undefined,
          };
        }
      }

      // Get unread count
      const { count: unreadCount } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('is_read', false)
        .neq('sender_id', userId);

      // Get last message
      const { data: lastMessageDataArray, error: lastMessageError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const lastMessageData = lastMessageDataArray && lastMessageDataArray.length > 0 
        ? lastMessageDataArray[0] 
        : null;

      const lastMessage = lastMessageData ? {
        id: lastMessageData.id,
        conversationId: lastMessageData.conversation_id,
        senderId: lastMessageData.sender_id,
        content: lastMessageData.message,
        readAt: lastMessageData.is_read ? lastMessageData.updated_at : null,
        createdAt: lastMessageData.created_at,
      } : undefined;

      return {
        ...conv,
        participant: participant || undefined,
        unreadCount: unreadCount ?? 0,
        lastMessage,
      };
    })
  );

  return {
    conversations: conversationsWithParticipants,
    total: count ?? 0,
  };
}

// Fetch messages directly from Supabase
async function fetchMessagesFromSupabase(
  conversationId: string,
  page: number = 1,
  limit: number = 50
): Promise<{ messages: Message[]; total: number }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact' })
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  const messages = (data || []).map(msg => ({
    id: msg.id,
    conversationId: msg.conversation_id,
    senderId: msg.sender_id,
    content: msg.message,
    readAt: msg.is_read ? msg.updated_at : null,
    createdAt: msg.created_at,
  }));

  return {
    messages: messages.reverse(), // Reverse to show oldest first
    total: count ?? 0,
  };
}

function useMessagesRealtime(conversationId: string | undefined) {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

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
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [...MESSAGES_QUERY_KEY, conversationId] });
          queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to messages for conversation ${conversationId}`);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient, conversationId]);
}

function useConversationsRealtime(userId: string | undefined) {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

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
          table: 'chat_conversations',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to conversations for user ${userId}`);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient, userId]);
}

export function useConversations(page?: number, limit?: number) {
  const queryKey = useMemo(
    () => [...CONVERSATIONS_QUERY_KEY, page ?? 1, limit ?? 20],
    [page, limit]
  );

  const { user } = useAuth();
  const role = user?.role === 'admin' ? 'admin' : 'investor';
  const supabase = getSupabaseBrowserClient();
  const [userId, setUserId] = useState<string | undefined>(user?.id);

  // Get user ID from Supabase session, fallback to AuthContext user
  useEffect(() => {
    if (!supabase) {
      // Fallback to AuthContext user if Supabase client not available
      setUserId(user?.id);
      return;
    }

    supabase.auth.getUser().then(({ data: { user: supabaseUser }, error }) => {
      if (!error && supabaseUser) {
        setUserId(supabaseUser.id);
      } else {
        // Fallback to AuthContext user if Supabase auth fails
        setUserId(user?.id);
      }
    }).catch((error) => {
      console.warn('[useConversations] Failed to get user from Supabase:', error);
      // Fallback to AuthContext user
      setUserId(user?.id);
    });
  }, [supabase, user?.id]);
  
  useConversationsRealtime(userId);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID required');
      }
      try {
        const result = await fetchConversationsFromSupabase(userId, role, page, limit);
        console.log('[useConversations] Fetched conversations:', {
          count: result.conversations.length,
          total: result.total,
          userId,
          role,
        });
        return result;
      } catch (error) {
        console.error('[useConversations] Failed to fetch conversations:', error);
        throw error;
      }
    },
    placeholderData: keepPreviousData,
    enabled: Boolean(userId),
    retry: 2,
    retryDelay: 1000,
  });

  return {
    conversations: query.data?.conversations ?? [],
    meta: {
      page: page ?? 1,
      limit: limit ?? 20,
      total: query.data?.total ?? 0,
      pageCount: Math.ceil((query.data?.total ?? 0) / (limit ?? 20)),
      hasNext: (page ?? 1) < Math.ceil((query.data?.total ?? 0) / (limit ?? 20)),
      hasPrevious: (page ?? 1) > 1,
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

  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!conversationId) {
        throw new Error('Conversation ID required');
      }
      return fetchMessagesFromSupabase(conversationId, page, limit);
    },
    placeholderData: keepPreviousData,
    enabled: Boolean(conversationId),
  });

  return {
    messages: query.data?.messages ?? [],
    meta: {
      page: page ?? 1,
      limit: limit ?? 50,
      total: query.data?.total ?? 0,
      pageCount: Math.ceil((query.data?.total ?? 0) / (limit ?? 50)),
      hasNext: (page ?? 1) < Math.ceil((query.data?.total ?? 0) / (limit ?? 50)),
      hasPrevious: (page ?? 1) > 1,
    },
    ...query,
  };
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload: SendMessageRequest) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      // Get current user from Supabase session, fallback to AuthContext user
      let userId: string | undefined;
      
      try {
        const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
        if (!userError && supabaseUser) {
          userId = supabaseUser.id;
        }
      } catch (error) {
        console.warn('[useSendMessage] Failed to get user from Supabase:', error);
      }

      // Fallback to AuthContext user if Supabase auth fails
      if (!userId && user?.id) {
        userId = user.id;
      }

      if (!userId) {
        throw new Error('User ID required');
      }

      let conversationId = payload.conversationId;

      // If no conversation ID, create or get one
      if (!conversationId) {
        const role = user?.role === 'admin' ? 'admin' : 'investor';
        const investorId = role === 'investor' ? userId : payload.investorId;
        const adminId = role === 'admin' ? userId : payload.adminId;

        if (!investorId) {
          throw new Error('investorId is required when creating a new conversation');
        }

        // Try to find existing conversation
        let query = supabase
          .from('chat_conversations')
          .select('*')
          .eq('user_id', investorId);

        if (adminId) {
          query = query.eq('admin_id', adminId);
        } else {
          query = query.is('admin_id', null);
        }

        const { data: existing, error: findError } = await query.single();

        if (existing && !findError) {
          conversationId = existing.id;
        } else {
          // Create new conversation
          const { data: created, error: createError } = await supabase
            .from('chat_conversations')
            .insert({
              user_id: investorId,
              admin_id: adminId || null,
            })
            .select()
            .single();

          if (createError || !created) {
            throw new Error(`Failed to create conversation: ${createError?.message}`);
          }

          conversationId = created.id;
        }
      }

      // Verify access to conversation
      const { data: conv, error: convError } = await supabase
        .from('chat_conversations')
        .select('user_id, admin_id')
        .eq('id', conversationId)
        .single();

      if (convError || !conv) {
        throw new Error('Conversation not found');
      }

      if (conv.user_id !== userId && conv.admin_id !== userId) {
        throw new Error('Access denied');
      }

      // Create message
      const { data: messageData, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          message: payload.content.trim(),
        })
        .select()
        .single();

      if (messageError || !messageData) {
        throw new Error(`Failed to send message: ${messageError?.message}`);
      }

      const message: Message = {
        id: messageData.id,
        conversationId: messageData.conversation_id,
        senderId: messageData.sender_id,
        content: messageData.message,
        readAt: messageData.is_read ? messageData.updated_at : null,
        createdAt: messageData.created_at,
      };

      // Get updated conversation
      const { data: updatedConv } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      const conversation: Conversation = updatedConv ? {
        id: updatedConv.id,
        investorId: updatedConv.user_id,
        adminId: updatedConv.admin_id,
        lastMessageAt: updatedConv.last_message_at,
        createdAt: updatedConv.created_at,
        updatedAt: updatedConv.updated_at,
      } : {
        id: conversationId,
        investorId: conv.user_id,
        adminId: conv.admin_id || null,
        lastMessageAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return { message, conversation };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...MESSAGES_QUERY_KEY, data.conversation.id] });
    },
  });
}

export function useMarkMessagesRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      // Get current user from Supabase session, fallback to AuthContext user
      let userId: string | undefined;
      
      try {
        const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
        if (!userError && supabaseUser) {
          userId = supabaseUser.id;
        }
      } catch (error) {
        console.warn('[useMarkMessagesRead] Failed to get user from Supabase:', error);
      }

      // Fallback to AuthContext user if Supabase auth fails
      if (!userId && user?.id) {
        userId = user.id;
      }

      if (!userId) {
        throw new Error('User ID required');
      }

      // Verify access
      const { data: conv, error: convError } = await supabase
        .from('chat_conversations')
        .select('user_id, admin_id')
        .eq('id', conversationId)
        .single();

      if (convError || !conv) {
        throw new Error('Conversation not found');
      }

      if (conv.user_id !== userId && conv.admin_id !== userId) {
        throw new Error('Access denied');
      }

      // Mark all messages from other users as read
      const { data, error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('is_read', false)
        .neq('sender_id', userId)
        .select();

      if (error) {
        throw new Error(`Failed to mark messages as read: ${error.message}`);
      }

      return { updated: data?.length ?? 0 };
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: [...MESSAGES_QUERY_KEY, conversationId] });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });
}

// Fetch all investors for admin to start new conversations
async function fetchInvestorsForChat(search?: string, limit: number = 50) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  let query = supabase
    .from('users')
    .select('id, email, created_at')
    .eq('role', 'investor')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (search && search.trim().length > 0) {
    const pattern = `%${search.trim()}%`;
    query = query.or(`email.ilike.${pattern}`);
  }

  const { data: users, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch investors: ${error.message}`);
  }

  // Get profile data for each user
  const investorsWithProfiles = await Promise.all(
    (users || []).map(async (user) => {
      const { data: profile } = await supabase
        .from('investor_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email,
        fullName: profile?.full_name || undefined,
      };
    })
  );

  return investorsWithProfiles;
}

export function useInvestorsForChat(search?: string) {
  return useQuery({
    queryKey: [...INVESTORS_QUERY_KEY, search ?? ''],
    queryFn: () => fetchInvestorsForChat(search),
    enabled: true,
    staleTime: 30000, // Cache for 30 seconds
  });
}
