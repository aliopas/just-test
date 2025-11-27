import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { adminRequestListQuerySchema } from '../schemas/admin-requests.schema';
import {
  listAdminRequests,
  getAdminRequestDetail,
  approveAdminRequest,
  rejectAdminRequest,
  requestInfoFromInvestor,
  listAdminRequestComments,
  addAdminRequestComment,
  startRequestSettlement,
  completeRequestSettlement,
  moveAdminRequestToStatus,
  type WorkflowStatus,
} from '../services/admin-request.service';
import { getAdminRequestTimeline } from '../services/request-timeline.service';

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
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorName = error instanceof Error ? error.name : 'Unknown';
      console.error('Error details:', {
        errorName,
        errorMessage,
        errorStack,
        query: req.query,
        actorId: req.user?.id,
        nodeEnv: process.env.NODE_ENV,
        hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      });
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list admin requests',
          details:
            process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production'
              ? errorMessage
              : undefined,
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

      if (
        error instanceof Error &&
        error.message.startsWith('FAILED_COMMENTS')
      ) {
        return res.status(500).json({
          error: {
            code: 'COMMENT_ERROR',
            message: 'Failed to load request comments',
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

  async getRequestTimeline(req: AuthenticatedRequest, res: Response) {
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

      const timeline = await getAdminRequestTimeline({
        requestId,
      });

      return res.status(200).json(timeline);
    } catch (error) {
      if (error instanceof Error && error.message === 'REQUEST_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Request not found',
          },
        });
      }

      console.error('Failed to load admin request timeline:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to load request timeline',
        },
      });
    }
  },

  async updateStatus(req: AuthenticatedRequest, res: Response) {
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

      const rawStatus =
        typeof req.body?.status === 'string'
          ? req.body.status.trim().toLowerCase()
          : '';

      const allowedStatuses: WorkflowStatus[] = [
        'screening',
        'compliance_review',
      ];
      const statusValue =
        allowedStatuses.find(status => status === rawStatus) ?? null;

      if (!statusValue) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Unsupported status transition',
          },
        });
      }

      const note =
        typeof req.body?.note === 'string'
          ? req.body.note.slice(0, 500)
          : undefined;

      const result = await moveAdminRequestToStatus({
        actorId,
        requestId,
        status: statusValue,
        note,
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'] ?? null,
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
              message: 'Request cannot move to the desired status',
            },
          });
        }
      }

      console.error('Failed to update admin request status:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update request status',
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
        userAgent: req.headers?.['user-agent'] ?? null,
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
        userAgent: req.headers?.['user-agent'] ?? null,
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
        userAgent: req.headers?.['user-agent'] ?? null,
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

  async listComments(req: AuthenticatedRequest, res: Response) {
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

      const comments = await listAdminRequestComments({
        actorId,
        requestId,
      });

      return res.status(200).json({ comments });
    } catch (error) {
      console.error('Failed to list request comments:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list request comments',
        },
      });
    }
  },

  async addComment(req: AuthenticatedRequest, res: Response) {
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

      const comment =
        typeof req.body?.comment === 'string' ? req.body.comment : '';

      if (!comment.trim()) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Comment is required',
          },
        });
      }

      const result = await addAdminRequestComment({
        actorId,
        requestId,
        comment,
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'] ?? null,
      });

      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'COMMENT_REQUIRED') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Comment is required',
          },
        });
      }

      console.error('Failed to add request comment:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to add request comment',
        },
      });
    }
  },

  async settleRequest(req: AuthenticatedRequest, res: Response) {
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

      const stageValue =
        typeof req.body?.stage === 'string'
          ? req.body.stage.toLowerCase()
          : null;

      if (stageValue !== 'start' && stageValue !== 'complete') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Stage must be either "start" or "complete"',
          },
        });
      }

      const reference =
        typeof req.body?.reference === 'string'
          ? req.body.reference.slice(0, 120)
          : undefined;
      const note =
        typeof req.body?.note === 'string'
          ? req.body.note.slice(0, 500)
          : undefined;

      const attachmentIds = Array.isArray(req.body?.attachmentIds)
        ? req.body.attachmentIds.filter(
            (value: unknown): value is string => typeof value === 'string'
          )
        : undefined;

      const handler =
        stageValue === 'start'
          ? startRequestSettlement
          : completeRequestSettlement;

      const result = await handler({
        actorId,
        requestId,
        reference,
        note,
        attachmentIds,
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'] ?? null,
      });

      return res.status(200).json({
        requestId,
        status: result.request.status,
        stage: stageValue,
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

        if (error.message.includes('already in the target status')) {
          return res.status(409).json({
            error: {
              code: 'INVALID_STATE',
              message: 'Request is already in the desired status',
            },
          });
        }

        if (error.message.includes('Transition')) {
          return res.status(409).json({
            error: {
              code: 'INVALID_STATE',
              message: 'Request cannot transition to the desired status',
            },
          });
        }

        if (error.message.includes('Failed to update settlement')) {
          return res.status(500).json({
            error: {
              code: 'SETTLEMENT_UPDATE_FAILED',
              message: 'Failed to update settlement details',
            },
          });
        }
      }

      console.error('Failed to settle request:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to settle request',
        },
      });
    }
  },
};
