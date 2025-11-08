import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { adminRequestListQuerySchema } from '../schemas/admin-requests.schema';
import {
  listAdminRequests,
  getAdminRequestDetail,
  approveAdminRequest,
  rejectAdminRequest,
  requestInfoFromInvestor,
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

  async approveRequest(req: AuthenticatedRequest, res: Response) {
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

      const note =
        typeof req.body?.note === 'string'
          ? req.body.note.slice(0, 500)
          : undefined;

      const result = await approveAdminRequest({
        actorId,
        requestId,
        note,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] ?? null,
      });

      return res.status(200).json({
        requestId,
        status: result.request.status,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return res.status(404).json({
            error: {
              code: 'NOT_FOUND',
              message: 'Request not found',
            },
          });
        }

        if (
          error.message.includes('Transition') ||
          error.message.includes('already in the target status')
        ) {
          return res.status(409).json({
            error: {
              code: 'INVALID_STATE',
              message: 'Request cannot be approved from its current status',
            },
          });
        }
      }

      console.error('Failed to approve admin request:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to approve request',
        },
      });
    }
  },

  async rejectRequest(req: AuthenticatedRequest, res: Response) {
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

      const note =
        typeof req.body?.note === 'string'
          ? req.body.note.slice(0, 500)
          : undefined;

      const result = await rejectAdminRequest({
        actorId,
        requestId,
        note,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] ?? null,
      });

      return res.status(200).json({
        requestId,
        status: result.request.status,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return res.status(404).json({
            error: {
              code: 'NOT_FOUND',
              message: 'Request not found',
            },
          });
        }

        if (
          error.message.includes('Transition') ||
          error.message.includes('already in the target status')
        ) {
          return res.status(409).json({
            error: {
              code: 'INVALID_STATE',
              message: 'Request cannot be rejected from its current status',
            },
          });
        }
      }

      console.error('Failed to reject admin request:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to reject request',
        },
      });
    }
  },

  async requestInfo(req: AuthenticatedRequest, res: Response) {
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

      const message =
        typeof req.body?.message === 'string' ? req.body.message.trim() : '';

      if (!message) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Message is required',
          },
        });
      }

      const result = await requestInfoFromInvestor({
        actorId,
        requestId,
        message,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] ?? null,
      });

      return res.status(200).json({
        requestId,
        status: result.request.status,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return res.status(404).json({
            error: {
              code: 'NOT_FOUND',
              message: 'Request not found',
            },
          });
        }

        if (error.message === 'INFO_MESSAGE_REQUIRED') {
          return res.status(400).json({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Message is required',
            },
          });
        }

        if (
          error.message.includes('Transition') ||
          error.message.includes('already in the target status')
        ) {
          return res.status(409).json({
            error: {
              code: 'INVALID_STATE',
              message:
                'Request cannot move to pending info from current status',
            },
          });
        }
      }

      console.error('Failed to request additional info:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to request additional info',
        },
      });
    }
  },
};
