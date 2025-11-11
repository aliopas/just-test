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

      const feed = await getBacuraStockFeed();

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

