import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { createRequestSchema } from '../schemas/request.schema';
import { createInvestorRequest } from '../services/request.service';
import { submitInvestorRequest } from '../services/request.service';

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
      if (
        error instanceof Error &&
        error.message === 'REQUEST_NOT_FOUND'
      ) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Request not found',
          },
        });
      }

      if (
        error instanceof Error &&
        error.message === 'REQUEST_NOT_OWNED'
      ) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this request',
          },
        });
      }

      if (
        error instanceof Error &&
        error.message === 'REQUEST_NOT_DRAFT'
      ) {
        return res.status(409).json({
          error: {
            code: 'INVALID_STATE',
            message: 'Request must be in draft status to submit',
          },
        });
      }

      if (
        error instanceof Error &&
        error.message === 'ATTACHMENTS_REQUIRED'
      ) {
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
};
