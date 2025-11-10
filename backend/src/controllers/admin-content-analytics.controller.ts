import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { contentAnalyticsQuerySchema } from '../schemas/content-analytics.schema';
import { getContentAnalytics } from '../services/content-analytics.service';

export const adminContentAnalyticsController = {
  async summary(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = contentAnalyticsQuerySchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid analytics parameters',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const result = await getContentAnalytics(validation.data);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Failed to load content analytics:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to load content analytics',
        },
      });
    }
  },
};
