import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { getBacuraStockFeed } from '../services/investor-stocks.service';

export const investorStocksController = {
  async getStockFeed(req: AuthenticatedRequest, res: Response) {
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

      const rawLimit = req.query.limit;
      let limit: number | undefined;

      if (typeof rawLimit === 'string') {
        const parsed = Number.parseInt(rawLimit, 10);
        if (Number.isFinite(parsed)) {
          limit = parsed;
        }
      } else if (Array.isArray(rawLimit) && rawLimit[0]) {
        const parsed = Number.parseInt(String(rawLimit[0]), 10);
        if (Number.isFinite(parsed)) {
          limit = parsed;
        }
      }

      const feed = await getBacuraStockFeed({ limit });

      return res.status(200).json(feed);
    } catch (error) {
      console.error('Failed to load Bacura stock feed:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to load Bacura stock feed',
        },
      });
    }
  },
};
