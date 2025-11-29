import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  createRequestSchema,
  requestAttachmentPresignSchema,
  createPartnershipRequestSchema,
  createBoardNominationRequestSchema,
  createFeedbackRequestSchema,
} from '../schemas/request.schema';
import { requestListQuerySchema } from '../schemas/request-list.schema';
import {
  createInvestorRequest,
  createPartnershipRequest,
  createBoardNominationRequest,
  createFeedbackRequest,
  submitInvestorRequest,
  listInvestorRequests,
  getInvestorRequestDetail,
  createRequestAttachmentUploadUrl,
} from '../services/request.service';
import { getInvestorRequestTimeline } from '../services/request-timeline.service';

export const requestController = {
  async create(req: AuthenticatedRequest, res: Response) {
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

      const validation = createRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const { id, requestNumber } = await createInvestorRequest({
        userId,
        payload: validation.data,
      });

      return res.status(201).json({
        requestId: id,
        requestNumber,
        status: 'draft',
      });
    } catch (error) {
      console.error('Failed to create request:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create request',
        },
      });
    }
  },

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

      const validation = requestListQuerySchema.safeParse(req.query);
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

      const result = await listInvestorRequests({
        userId,
        query: validation.data,
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error('Failed to list requests:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list requests',
        },
      });
    }
  },

  async submit(req: AuthenticatedRequest, res: Response) {
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

      const requestId = req.params.id;
      if (!requestId) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request id is required',
          },
        });
      }

      const result = await submitInvestorRequest({
        requestId,
        userId,
      });

      return res.status(200).json({
        requestId,
        status: result.status,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'REQUEST_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Request not found',
          },
        });
      }

      if (error instanceof Error && error.message === 'REQUEST_NOT_OWNED') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this request',
          },
        });
      }

      if (error instanceof Error && error.message === 'REQUEST_NOT_DRAFT') {
        return res.status(409).json({
          error: {
            code: 'INVALID_STATE',
            message: 'Request must be in draft status to submit',
          },
        });
      }

      if (error instanceof Error && error.message === 'ATTACHMENTS_REQUIRED') {
        return res.status(400).json({
          error: {
            code: 'ATTACHMENTS_REQUIRED',
            message: 'Attachments are required before submitting',
          },
        });
      }

      console.error('Failed to submit request:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to submit request',
        },
      });
    }
  },

  async detail(req: AuthenticatedRequest, res: Response) {
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

      const requestId = req.params.id;
      if (!requestId) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request id is required',
          },
        });
      }

      const detail = await getInvestorRequestDetail({
        requestId,
        userId,
      });

      return res.status(200).json(detail);
    } catch (error) {
      if (error instanceof Error && error.message === 'REQUEST_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Request not found',
          },
        });
      }

      if (error instanceof Error && error.message === 'REQUEST_NOT_OWNED') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this request',
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

      console.error('Failed to load request detail:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to load request detail',
        },
      });
    }
  },

  async timeline(req: AuthenticatedRequest, res: Response) {
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

      const requestId = req.params.id;
      if (!requestId) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request id is required',
          },
        });
      }

      const timeline = await getInvestorRequestTimeline({
        requestId,
        userId,
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

      if (error instanceof Error && error.message === 'REQUEST_NOT_OWNED') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this request',
          },
        });
      }

      console.error('Failed to load request timeline:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to load request timeline',
        },
      });
    }
  },

  async presignAttachment(req: AuthenticatedRequest, res: Response) {
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

      const requestId = req.params.id;
      if (!requestId) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request id is required',
          },
        });
      }

      const validation = requestAttachmentPresignSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const result = await createRequestAttachmentUploadUrl({
        requestId,
        userId,
        input: validation.data,
      });

      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'REQUEST_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Request not found',
          },
        });
      }

      if (error instanceof Error && error.message === 'REQUEST_NOT_OWNED') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this request',
          },
        });
      }

      if (error instanceof Error && error.message === 'REQUEST_NOT_EDITABLE') {
        return res.status(409).json({
          error: {
            code: 'INVALID_STATE',
            message:
              'Attachments can only be added to draft or submitted requests',
          },
        });
      }

      console.error('Failed to create attachment upload url:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create attachment upload url',
        },
      });
    }
  },

  async createPartnership(req: AuthenticatedRequest, res: Response) {
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

      const validation = createPartnershipRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const { id, requestNumber } = await createPartnershipRequest({
        userId,
        payload: validation.data,
      });

      return res.status(201).json({
        requestId: id,
        requestNumber,
        status: 'draft',
        type: 'partnership',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'PROJECT_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
          },
        });
      }

      console.error('Failed to create partnership request:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      
      // Check for database constraint violations
      const isConstraintError =
        errorMessage.includes('violates check constraint') ||
        errorMessage.includes('violates not-null constraint') ||
        errorMessage.includes('invalid input value for enum') ||
        errorMessage.includes('type IN');
      
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: isConstraintError
            ? 'Database schema mismatch. Please ensure all migrations have been applied.'
            : 'Failed to create partnership request',
          details:
            process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'production' ||
            isConstraintError
              ? errorMessage
              : undefined,
        },
      });
    }
  },

  async createBoardNomination(req: AuthenticatedRequest, res: Response) {
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

      const validation = createBoardNominationRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const { id, requestNumber } = await createBoardNominationRequest({
        userId,
        payload: validation.data,
      });

      return res.status(201).json({
        requestId: id,
        requestNumber,
        status: 'draft',
        type: 'board_nomination',
      });
    } catch (error) {
      console.error('Failed to create board nomination request:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const isDevelopment =
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test';
      
      // Check for common database constraint errors
      const isConstraintError =
        errorMessage.includes('violates check constraint') ||
        errorMessage.includes('violates not-null constraint') ||
        errorMessage.includes('invalid input value for enum') ||
        errorMessage.includes('type IN');

      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: isConstraintError
            ? 'Database schema mismatch. Please ensure all migrations have been applied.'
            : 'Failed to create board nomination request',
          details:
            isDevelopment || isConstraintError ? errorMessage : undefined,
        },
      });
    }
  },

  async createFeedback(req: AuthenticatedRequest, res: Response) {
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

      const validation = createFeedbackRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const { id, requestNumber } = await createFeedbackRequest({
        userId,
        payload: validation.data,
      });

      return res.status(201).json({
        requestId: id,
        requestNumber,
        status: 'draft',
        type: 'feedback',
      });
    } catch (error) {
      console.error('Failed to create feedback request:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const isDevelopment =
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test';
      
      // Check for common database constraint errors
      const isConstraintError =
        errorMessage.includes('violates check constraint') ||
        errorMessage.includes('violates not-null constraint') ||
        errorMessage.includes('invalid input value for enum') ||
        errorMessage.includes('type IN');

      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: isConstraintError
            ? 'Database schema mismatch. Please ensure all migrations have been applied.'
            : 'Failed to create feedback request',
          details:
            isDevelopment || isConstraintError ? errorMessage : undefined,
        },
      });
    }
  },
};
