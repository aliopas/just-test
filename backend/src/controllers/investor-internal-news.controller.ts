import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { publicNewsListQuerySchema } from '../schemas/public-news.schema';
import {
  getInternalInvestorNewsById,
  listInternalInvestorNews,
} from '../services/news.service';
import {
  recordNewsImpressions,
  recordNewsView,
} from '../services/content-analytics.service';

export const investorInternalNewsController = {
  async list(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = publicNewsListQuerySchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const result = await listInternalInvestorNews(validation.data);

      if (result.news.length > 0) {
        void recordNewsImpressions(
          result.news.map(item => item.id),
          { context: 'investor_internal_feed' }
        ).catch(error =>
          console.error(
            'Failed to record internal news impressions:',
            error
          )
        );
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Failed to list investor internal news:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list investor internal news',
        },
      });
    }
  },

  async detail(req: AuthenticatedRequest, res: Response) {
    try {
      const newsId = req.params.id;
      if (!newsId) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'News id is required',
          },
        });
      }

      const result = await getInternalInvestorNewsById(newsId);

      void recordNewsView(result.id, {
        context: 'investor_internal_detail',
      }).catch(error =>
        console.error('Failed to record internal news view:', error)
      );

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'NEWS_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Internal news item not found',
          },
        });
      }

      console.error('Failed to load internal news detail:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to load internal news detail',
        },
      });
    }
  },
};



