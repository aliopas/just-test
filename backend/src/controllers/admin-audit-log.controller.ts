import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  adminAuditLogQuerySchema,
  listAdminAuditLogs,
} from '../services/admin-audit-log.service';

export const adminAuditLogController = {
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

      const validation = adminAuditLogQuerySchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid audit log filters',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const result = await listAdminAuditLogs(validation.data);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Failed to load admin audit logs:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to load audit logs',
        },
      });
    }
  },
};
