import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  createRequestSchema,
  requestAttachmentPresignSchema,
} from '../schemas/request.schema';
import { requestListQuerySchema } from '../schemas/request-list.schema';
import {
  createInvestorRequest,
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
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      // Log request body for debugging
      console.log('Request body received:', JSON.stringify(req.body, null, 2));

      const validation = createRequestSchema.safeParse(req.body);
      if (!validation.success) {
        console.error(
          'Validation failed:',
          JSON.stringify(validation.error.issues, null, 2)
        );
        console.error('Validation error details:', {
          issues: validation.error.issues,
          formatted: validation.error.format(),
        });
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
              code: issue.code,
            })),
          },
        });
        return;
      }

      console.log(
        'Validation successful, validated data:',
        JSON.stringify(validation.data, null, 2)
      );

      const { id, requestNumber } = await createInvestorRequest({
        userId,
        payload: validation.data,
      });

      res.status(201).json({
        requestId: id,
        requestNumber,
        status: 'draft',
      });
      return;
    } catch (error) {
      console.error('Failed to create request:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      // Log full error details for debugging
      console.error('Error details:', {
        message: errorMessage,
        stack: errorStack,
        body: req.body,
        userId: req.user?.id,
      });

      // Check if it's a database constraint error
      const isDatabaseError =
        errorMessage.includes('constraint') ||
        errorMessage.includes('violates') ||
        errorMessage.includes('check constraint');

      // Ensure response is sent even if headers were already sent
      if (!res.headersSent) {
        res.status(500).json({
          error: {
            code: 'INTERNAL_ERROR',
            message: isDatabaseError
              ? 'Database constraint violation. Please check your request data.'
              : 'Failed to create request',
            details:
              process.env.NODE_ENV === 'development' ? errorMessage : undefined,
          },
        });
      } else {
        // If headers were already sent, log the error but don't try to send response
        console.error('Response headers already sent, cannot send error response');
      }
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

      // Attachments are now optional - removed this check

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
};
