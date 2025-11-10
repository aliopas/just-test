import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { getInvestorDashboard } from '../services/investor-dashboard.service';

export const investorDashboardController = {
  async getDashboard(req: AuthenticatedRequest, res: Response) {
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

      const dashboard = await getInvestorDashboard({ userId });

      return res.status(200).json(dashboard);
    } catch (error) {
      console.error('Failed to load investor dashboard:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to load investor dashboard',
        },
      });
    }
  },
};
