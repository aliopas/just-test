export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  investorId: string;
  adminId: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
  lastMessage?: Message;
}

export interface ConversationWithParticipant extends Conversation {
  participant?: {
    id: string;
    email: string;
    fullName?: string;
  };
}

export interface MessageListResponse {
  messages: Message[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ConversationListResponse {
  conversations: ConversationWithParticipant[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface SendMessageRequest {
  conversationId?: string;
  content: string;
  adminId?: string;
}

export interface SendMessageResponse {
  message: Message;
  conversation: Conversation;
}

