import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { investorSignupRequestService } from '../services/investor-signup-request.service';
import {
  investorSignupDecisionSchema,
  investorSignupRequestSchema,
} from '../schemas/account-request.schema';

const toNumber = (value: unknown, fallback: number) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

export const investorSignupRequestController = {
  async createPublic(req: Request, res: Response) {
    try {
      const payload = investorSignupRequestSchema.parse(req.body);
      const request = await investorSignupRequestService.createRequest(payload);

      return res.status(202).json({
        request: {
          id: request.id,
          status: request.status,
          createdAt: request.created_at,
        },
        message:
          payload.language === 'ar'
            ? 'تم استقبال طلب إنشاء الحساب وسيتم مراجعته من قبل فريق الإدارة.'
            : 'Your signup request has been received and will be reviewed by our team.',
      });
    } catch (error) {
      const status =
        (error as Error & { status?: number }).status ??
        (error instanceof Error &&
        (error.message === 'REQUEST_ALREADY_PENDING' ||
          error.message === 'USER_ALREADY_EXISTS')
          ? 409
          : 400);

      const message =
        error instanceof Error
          ? error.message === 'REQUEST_ALREADY_PENDING'
            ? 'Signup request already pending for this email.'
            : error.message === 'USER_ALREADY_EXISTS'
            ? 'An active account already exists for this email.'
            : error.message
          : 'Failed to submit signup request.';

      return res.status(status).json({
        error: {
          code:
            error instanceof Error &&
            (error.message === 'REQUEST_ALREADY_PENDING' ||
              error.message === 'USER_ALREADY_EXISTS')
              ? error.message
              : 'VALIDATION_ERROR',
          message,
        },
      });
    }
  },

  async list(req: AuthenticatedRequest, res: Response) {
    try {
      const statusParam = req.query.status;
      const status =
        typeof statusParam === 'string' && statusParam.length > 0
          ? (statusParam as 'pending' | 'approved' | 'rejected')
          : undefined;

      const search =
        typeof req.query.search === 'string' ? req.query.search : undefined;
      const page = toNumber(req.query.page, 1);
      const limit = toNumber(req.query.limit, 20);

      const result = await investorSignupRequestService.listRequests({
        status,
        search,
        page,
        limit,
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to load signup requests.',
        },
      });
    }
  },

  async approve(req: AuthenticatedRequest, res: Response) {
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

      const decision = investorSignupDecisionSchema.parse(req.body ?? {});

      const result = await investorSignupRequestService.approveRequest({
        requestId: req.params.id,
        actorId,
        decision,
      });

      return res.status(200).json({
        request: {
          id: result.request.id,
          status: result.request.status,
          reviewedAt: result.request.reviewed_at,
          reviewerId: result.request.reviewer_id,
          decisionNote: result.request.decision_note,
          approvedUserId: result.request.approved_user_id,
        },
        user: result.user,
      });
    } catch (error) {
      const status =
        (error as Error & { status?: number }).status ??
        (error instanceof Error &&
        (error.message === 'REQUEST_NOT_FOUND' ||
          error.message === 'REQUEST_ALREADY_REVIEWED')
          ? 409
          : 500);

      return res.status(status).json({
        error: {
          code:
            error instanceof Error &&
            (error.message === 'REQUEST_NOT_FOUND' ||
              error.message === 'REQUEST_ALREADY_REVIEWED')
              ? error.message
              : 'INTERNAL_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to approve signup request.',
        },
      });
    }
  },

  async reject(req: AuthenticatedRequest, res: Response) {
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

      const note =
        typeof req.body?.note === 'string' && req.body.note.trim().length > 0
          ? req.body.note.trim()
          : undefined;

      const updated = await investorSignupRequestService.rejectRequest({
        requestId: req.params.id,
        actorId,
        note,
      });

      return res.status(200).json({
        request: {
          id: updated.id,
          status: updated.status,
          reviewedAt: updated.reviewed_at,
          reviewerId: updated.reviewer_id,
          decisionNote: updated.decision_note,
        },
      });
    } catch (error) {
      const status =
        (error as Error & { status?: number }).status ??
        (error instanceof Error && error.message === 'REQUEST_NOT_FOUND'
          ? 404
          : 500);

      return res.status(status).json({
        error: {
          code:
            error instanceof Error && error.message === 'REQUEST_NOT_FOUND'
              ? 'REQUEST_NOT_FOUND'
              : 'INTERNAL_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to reject signup request.',
        },
      });
    }
  },
};

