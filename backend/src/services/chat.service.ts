import { requireSupabaseAdmin } from '../lib/supabase';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';

export interface Conversation {
  id: string;
  investorId: string;
  adminId: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
}

export interface ConversationWithParticipant extends Conversation {
  participant?: {
    id: string;
    email: string;
    fullName?: string;
  };
  unreadCount?: number;
  lastMessage?: Message;
}

export async function getOrCreateConversation(params: {
  investorId: string;
  adminId?: string;
}): Promise<Conversation> {
  const adminClient = requireSupabaseAdmin();

  // Try to find existing conversation
  let query = adminClient
    .from('conversations')
    .select('*')
    .eq('investor_id', params.investorId);

  if (params.adminId) {
    query = query.eq('admin_id', params.adminId);
  } else {
    query = query.is('admin_id', null);
  }

  const { data: existing, error: findError } = await query.single();

  if (existing && !findError) {
    return {
      id: existing.id,
      investorId: existing.investor_id,
      adminId: existing.admin_id,
      lastMessageAt: existing.last_message_at,
      createdAt: existing.created_at,
      updatedAt: existing.updated_at,
    };
  }

  // Create new conversation
  const { data: created, error: createError } = await adminClient
    .from('conversations')
    .insert({
      investor_id: params.investorId,
      admin_id: params.adminId || null,
    })
    .select()
    .single();

  if (createError || !created) {
    throw new Error(`Failed to create conversation: ${createError?.message}`);
  }

  return {
    id: created.id,
    investorId: created.investor_id,
    adminId: created.admin_id,
    lastMessageAt: created.last_message_at,
    createdAt: created.created_at,
    updatedAt: created.updated_at,
  };
}

export async function listConversations(params: {
  userId: string;
  role: 'investor' | 'admin';
  page?: number;
  limit?: number;
}): Promise<{ conversations: ConversationWithParticipant[]; total: number }> {
  const adminClient = requireSupabaseAdmin();
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  let query = adminClient
    .from('conversations')
    .select('*', { count: 'exact' });

  if (params.role === 'investor') {
    query = query.eq('investor_id', params.userId);
  } else {
    // Admin can see all conversations
    query = query.not('admin_id', 'is', null);
  }

  query = query.order('last_message_at', { ascending: false, nullsFirst: false })
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to list conversations: ${error.message}`);
  }

  const conversations = (data || []).map(conv => ({
    id: conv.id,
    investorId: conv.investor_id,
    adminId: conv.admin_id,
    lastMessageAt: conv.last_message_at,
    createdAt: conv.created_at,
    updatedAt: conv.updated_at,
  }));

  // Fetch participant info and unread counts
  const conversationsWithParticipants: ConversationWithParticipant[] = await Promise.all(
    conversations.map(async (conv) => {
      const participantId = params.role === 'investor' ? conv.adminId : conv.investorId;
      
      let participant = null;
      if (participantId) {
        const { data: userData } = await adminClient
          .from('users')
          .select('id, email')
          .eq('id', participantId)
          .single();

        const { data: profileData } = await adminClient
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
      const { count: unreadCount } = await adminClient
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .is('read_at', null)
        .neq('sender_id', params.userId);

      // Get last message
      const { data: lastMessageData } = await adminClient
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const lastMessage = lastMessageData ? {
        id: lastMessageData.id,
        conversationId: lastMessageData.conversation_id,
        senderId: lastMessageData.sender_id,
        content: lastMessageData.content,
        readAt: lastMessageData.read_at,
        createdAt: lastMessageData.created_at,
      } : undefined;

      return {
        ...conv,
        participant,
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

export async function listMessages(params: {
  conversationId: string;
  userId: string;
  page?: number;
  limit?: number;
}): Promise<{ messages: Message[]; total: number }> {
  const adminClient = requireSupabaseAdmin();
  const page = params.page ?? 1;
  const limit = params.limit ?? 50;
  const offset = (page - 1) * limit;

  // Verify user has access to this conversation
  const { data: conv, error: convError } = await adminClient
    .from('conversations')
    .select('investor_id, admin_id')
    .eq('id', params.conversationId)
    .single();

  if (convError || !conv) {
    throw new Error('Conversation not found');
  }

  if (conv.investor_id !== params.userId && conv.admin_id !== params.userId) {
    throw new Error('Access denied');
  }

  const { data, error, count } = await adminClient
    .from('messages')
    .select('*', { count: 'exact' })
    .eq('conversation_id', params.conversationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to list messages: ${error.message}`);
  }

  const messages = (data || []).map(msg => ({
    id: msg.id,
    conversationId: msg.conversation_id,
    senderId: msg.sender_id,
    content: msg.content,
    readAt: msg.read_at,
    createdAt: msg.created_at,
  }));

  return {
    messages: messages.reverse(), // Reverse to show oldest first
    total: count ?? 0,
  };
}

export async function sendMessage(params: {
  conversationId?: string;
  senderId: string;
  content: string;
  investorId?: string;
  adminId?: string;
}): Promise<{ message: Message; conversation: Conversation }> {
  const adminClient = requireSupabaseAdmin();

  let conversation: Conversation;

  if (params.conversationId) {
    // Use existing conversation
    const { data: conv, error: convError } = await adminClient
      .from('conversations')
      .select('*')
      .eq('id', params.conversationId)
      .single();

    if (convError || !conv) {
      throw new Error('Conversation not found');
    }

    // Verify access
    if (conv.investor_id !== params.senderId && conv.admin_id !== params.senderId) {
      throw new Error('Access denied');
    }

    conversation = {
      id: conv.id,
      investorId: conv.investor_id,
      adminId: conv.admin_id,
      lastMessageAt: conv.last_message_at,
      createdAt: conv.created_at,
      updatedAt: conv.updated_at,
    };
  } else {
    // Create or get conversation
    if (!params.investorId) {
      throw new Error('investorId is required when creating a new conversation');
    }

    conversation = await getOrCreateConversation({
      investorId: params.investorId,
      adminId: params.adminId,
    });
  }

  // Create message
  const { data: messageData, error: messageError } = await adminClient
    .from('messages')
    .insert({
      conversation_id: conversation.id,
      sender_id: params.senderId,
      content: params.content,
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
    content: messageData.content,
    readAt: messageData.read_at,
    createdAt: messageData.created_at,
  };

  // Update conversation (trigger will handle last_message_at)
  const { data: updatedConv } = await adminClient
    .from('conversations')
    .select('*')
    .eq('id', conversation.id)
    .single();

  return {
    message,
    conversation: updatedConv ? {
      id: updatedConv.id,
      investorId: updatedConv.investor_id,
      adminId: updatedConv.admin_id,
      lastMessageAt: updatedConv.last_message_at,
      createdAt: updatedConv.created_at,
      updatedAt: updatedConv.updated_at,
    } : conversation,
  };
}

export async function markMessagesRead(params: {
  conversationId: string;
  userId: string;
}): Promise<number> {
  const adminClient = requireSupabaseAdmin();

  // Verify access
  const { data: conv, error: convError } = await adminClient
    .from('conversations')
    .select('investor_id, admin_id')
    .eq('id', params.conversationId)
    .single();

  if (convError || !conv) {
    throw new Error('Conversation not found');
  }

  if (conv.investor_id !== params.userId && conv.admin_id !== params.userId) {
    throw new Error('Access denied');
  }

  // Mark all messages from other users as read
  const { data, error } = await adminClient
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', params.conversationId)
    .is('read_at', null)
    .neq('sender_id', params.userId)
    .select();

  if (error) {
    throw new Error(`Failed to mark messages as read: ${error.message}`);
  }

  return data?.length ?? 0;
}

