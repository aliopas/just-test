import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { getAdminDashboardStats } from '../services/admin-dashboard.service';

export const adminDashboardController = {
  async stats(req: AuthenticatedRequest, res: Response) {
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

      const stats = await getAdminDashboardStats();

      return res.status(200).json(stats);
    } catch (error) {
      console.error('Failed to load admin dashboard stats:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to load admin dashboard stats',
        },
      });
    }
  },
};
