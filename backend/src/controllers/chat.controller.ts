import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  getOrCreateConversation,
  listConversations,
  listMessages,
  sendMessage,
  markMessagesRead,
} from '../services/chat.service';

export const chatController = {
  async listConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
      }

      const role = req.user?.role === 'admin' ? 'admin' : 'investor';
      const page = req.query.page ? Number.parseInt(String(req.query.page), 10) : undefined;
      const limit = req.query.limit ? Number.parseInt(String(req.query.limit), 10) : undefined;

      const result = await listConversations({
        userId: actorId,
        role,
        page,
        limit,
      });

      const pageCount = limit ? Math.ceil(result.total / limit) : 1;

      return res.status(200).json({
        conversations: result.conversations,
        meta: {
          page: page ?? 1,
          limit: limit ?? 20,
          total: result.total,
          pageCount,
          hasNext: page ? page < pageCount : false,
          hasPrevious: page ? page > 1 : false,
        },
      });
    } catch (error) {
      console.error('Failed to list conversations:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list conversations',
        },
      });
    }
  },

  async listMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const actorId = req.user?.id;
      const conversationId = req.params.conversationId;

      if (!actorId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
      }

      if (!conversationId) {
        return res.status(400).json({
          error: {
            code: 'BAD_REQUEST',
            message: 'conversationId is required',
          },
        });
      }

      const page = req.query.page ? Number.parseInt(String(req.query.page), 10) : undefined;
      const limit = req.query.limit ? Number.parseInt(String(req.query.limit), 10) : undefined;

      const result = await listMessages({
        conversationId,
        userId: actorId,
        page,
        limit,
      });

      const pageCount = limit ? Math.ceil(result.total / limit) : 1;

      return res.status(200).json({
        messages: result.messages,
        meta: {
          page: page ?? 1,
          limit: limit ?? 50,
          total: result.total,
          pageCount,
          hasNext: page ? page < pageCount : false,
          hasPrevious: page ? page > 1 : false,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Conversation not found' || error.message === 'Access denied') {
          return res.status(404).json({
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          });
        }
      }

      console.error('Failed to list messages:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list messages',
        },
      });
    }
  },

  async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
      }

      const { conversationId, content, adminId } = req.body;

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({
          error: {
            code: 'BAD_REQUEST',
            message: 'content is required',
          },
        });
      }

      if (content.length > 5000) {
        return res.status(400).json({
          error: {
            code: 'BAD_REQUEST',
            message: 'content is too long (max 5000 characters)',
          },
        });
      }

      const role = req.user?.role === 'admin' ? 'admin' : 'investor';
      let investorId: string | undefined;

      if (role === 'investor') {
        investorId = actorId;
      } else if (!conversationId) {
        // Admin creating new conversation - need investorId
        if (!req.body.investorId || typeof req.body.investorId !== 'string') {
          return res.status(400).json({
            error: {
              code: 'BAD_REQUEST',
              message: 'investorId is required when creating a new conversation',
            },
          });
        }
        investorId = req.body.investorId;
      }

      const result = await sendMessage({
        conversationId: typeof conversationId === 'string' ? conversationId : undefined,
        senderId: actorId,
        content: content.trim(),
        investorId,
        adminId: typeof adminId === 'string' ? adminId : undefined,
      });

      return res.status(201).json({
        message: result.message,
        conversation: result.conversation,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Conversation not found' || error.message === 'Access denied') {
          return res.status(404).json({
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          });
        }
        if (error.message.includes('investorId is required')) {
          return res.status(400).json({
            error: {
              code: 'BAD_REQUEST',
              message: error.message,
            },
          });
        }
      }

      console.error('Failed to send message:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to send message',
        },
      });
    }
  },

  async markRead(req: AuthenticatedRequest, res: Response) {
    try {
      const actorId = req.user?.id;
      const conversationId = req.params.conversationId;

      if (!actorId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
      }

      if (!conversationId) {
        return res.status(400).json({
          error: {
            code: 'BAD_REQUEST',
            message: 'conversationId is required',
          },
        });
      }

      const updated = await markMessagesRead({
        conversationId,
        userId: actorId,
      });

      return res.status(200).json({
        updated,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Conversation not found' || error.message === 'Access denied') {
          return res.status(404).json({
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          });
        }
      }

      console.error('Failed to mark messages as read:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to mark messages as read',
        },
      });
    }
  },
};

