import type { Response } from 'express';
import type { ZodIssue } from 'zod';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  notificationListQuerySchema,
  notificationPreferenceListSchema,
  type NotificationListQueryInput,
  type NotificationPreferenceListInput,
} from '../schemas/notification.schema';
import {
  getUnreadNotificationCount,
  listUserNotifications,
  getNotificationPreferences,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
} from '../services/notification.service';

function handleValidationError(res: Response, issues: ZodIssue[]) {
  return res.status(400).json({
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid query parameters',
      details: issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    },
  });
}

async function parseListQuery(
  query: unknown,
  res: Response
): Promise<NotificationListQueryInput | null> {
  const validation = notificationListQuerySchema.safeParse(query);
  if (!validation.success) {
    handleValidationError(res, validation.error.issues);
    return null;
  }
  return validation.data;
}

export const notificationController = {
  async list(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const query = await parseListQuery(req.query, res);
      if (!query) {
        return;
      }

      const [result, unreadCount] = await Promise.all([
        listUserNotifications({
          userId,
          page: query.page,
          limit: query.limit,
          status: query.status,
        }),
        getUnreadNotificationCount(userId),
      ]);

      return res.status(200).json({
        notifications: result.notifications,
        meta: {
          ...result.meta,
          unreadCount,
        },
      });
    } catch (error) {
      console.error('Failed to list notifications:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to load notifications',
        },
      });
    }
  },

  async markRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const notificationId = req.params.id;
      if (!notificationId) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Notification id is required',
          },
        });
      }

      const result = await markNotificationRead({
        userId,
        notificationId,
      });

      if (!result.updated) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Notification not found',
          },
        });
      }

      const unreadCount = await getUnreadNotificationCount(userId);

      return res.status(200).json({
        notificationId,
        readAt: result.readAt,
        meta: {
          unreadCount,
        },
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update notification',
        },
      });
    }
  },

  async markAllRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const result = await markAllNotificationsRead(userId);
      const unreadCount = await getUnreadNotificationCount(userId);

      return res.status(200).json({
        updated: result.updated,
        meta: {
          unreadCount,
        },
      });
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update notifications',
        },
      });
    }
  },
};
