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
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

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
        actorId,
        status,
        search,
        page,
        limit,
      });

      // Ensure response is properly formatted
      return res.status(200).json(result);
    } catch (error) {
      console.error('[InvestorSignupRequestController] Error in list:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Check if it's a Supabase configuration error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Supabase service role key') || errorMessage.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        return res.status(500).json({
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'Server configuration error: Missing Supabase service role key',
            details: 'SUPABASE_SERVICE_ROLE_KEY environment variable is not set. Please add it in Netlify Dashboard.',
          },
        });
      }

      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: errorMessage || 'Failed to load signup requests.',
        },
      });
    }
  },

  async getUnreadCount(req: AuthenticatedRequest, res: Response) {
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

      const count = await investorSignupRequestService.getUnreadCount(actorId);

      return res.status(200).json({
        unreadCount: count,
      });
    } catch (error) {
      console.error('[InvestorSignupRequestController] Error in getUnreadCount:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Check if it's a Supabase configuration error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Supabase service role key') || errorMessage.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        return res.status(500).json({
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'Server configuration error: Missing Supabase service role key',
            details: 'SUPABASE_SERVICE_ROLE_KEY environment variable is not set. Please add it in Netlify Dashboard.',
          },
        });
      }

      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: errorMessage || 'Failed to get unread count.',
        },
      });
    }
  },

  async markAsRead(req: AuthenticatedRequest, res: Response) {
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

      const result = await investorSignupRequestService.markAsRead({
        signupRequestId: requestId,
        adminId: actorId,
      });

      return res.status(200).json({
        requestId,
        viewedAt: result.viewedAt,
      });
    } catch (error) {
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to mark request as read.',
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

      console.log('[InvestorSignupRequestController] Approving request:', {
        requestId: req.params.id,
        actorId,
        decision,
      });

      const result = await investorSignupRequestService.approveRequest({
        requestId: req.params.id,
        actorId,
        decision,
      });

      console.log('[InvestorSignupRequestController] Request approved successfully:', {
        requestId: result.request.id,
        userId: result.user.id,
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
      console.error('[InvestorSignupRequestController] Error in approve:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        requestId: req.params.id,
        actorId: req.user?.id,
      });

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
