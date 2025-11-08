import type { Response } from 'express';
import { adminUserService } from '../services/admin-user.service';
import {
  adminUserListQuerySchema,
  adminUserResetSchema,
  adminCreateUserSchema,
} from '../schemas/admin-users.schema';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { adminUserStatusSchema } from '../schemas/admin-users.schema';

export const adminUserController = {
  async listUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = adminUserListQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: parsed.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const result = await adminUserService.listUsers(parsed.data);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Failed to list admin users:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to load users',
        },
      });
    }
  },

  async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = adminUserStatusSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const payload = await adminUserService.updateUserStatus({
        userId: req.params.id,
        status: validation.data.status,
        reason: validation.data.reason,
        actorId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] ?? null,
      });

      return res.status(200).json({
        message: 'User status updated successfully',
        user: payload,
      });
    } catch (error) {
      console.error('Failed to update user status:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update user status',
        },
      });
    }
  },

  async resetPassword(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = adminUserResetSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: parsed.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const result = await adminUserService.resetPassword({
        userId: req.params.id,
        actorId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] ?? null,
      });

      return res.status(200).json({
        message: 'Password reset link generated',
        email: result.email,
        resetLink: result.resetLink ?? undefined,
      });
    } catch (error) {
      console.error('Failed to reset password:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to reset password',
        },
      });
    }
  },

  async createUser(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = adminCreateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: parsed.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const payload = await adminUserService.createUser({
        actorId,
        email: parsed.data.email,
        phone: parsed.data.phone ?? null,
        fullName: parsed.data.fullName ?? null,
        role: parsed.data.role,
        status: parsed.data.status,
        locale: parsed.data.locale,
        sendInvite: parsed.data.sendInvite,
        temporaryPassword: parsed.data.temporaryPassword,
        investorProfile: parsed.data.investorProfile,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] ?? null,
      });

      return res.status(201).json({
        message: 'User created successfully',
        user: payload,
      });
    } catch (error: unknown) {
      console.error('Failed to create user:', error);
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'Failed to create user';
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message,
        },
      });
    }
  },
};
