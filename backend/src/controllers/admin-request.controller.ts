import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { adminRequestListQuerySchema } from '../schemas/admin-requests.schema';
import {
  listAdminRequests,
  getAdminRequestDetail,
} from '../services/admin-request.service';

export const adminRequestController = {
  async listRequests(req: AuthenticatedRequest, res: Response) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const validation = adminRequestListQuerySchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const result = await listAdminRequests({
        actorId,
        query: validation.data,
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error('Failed to list admin requests:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list admin requests',
        },
      });
    }
  },

  async getRequestDetail(req: AuthenticatedRequest, res: Response) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const requestId = req.params.id;
      if (!requestId) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request id is required',
          },
        });
      }

      const result = await getAdminRequestDetail({
        actorId,
        requestId,
      });

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'REQUEST_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Request not found',
          },
        });
      }

      if (
        error instanceof Error &&
        error.message.startsWith('FAILED_ATTACHMENTS')
      ) {
        return res.status(500).json({
          error: {
            code: 'ATTACHMENT_ERROR',
            message: 'Failed to load attachments',
          },
        });
      }

      if (error instanceof Error && error.message.startsWith('FAILED_EVENTS')) {
        return res.status(500).json({
          error: {
            code: 'EVENT_ERROR',
            message: 'Failed to load request events',
          },
        });
      }

      console.error('Failed to load admin request detail:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to load admin request detail',
        },
      });
    }
  },
};
