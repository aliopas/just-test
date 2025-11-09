import type { Request, Response } from 'express';
import { publicNewsListQuerySchema } from '../schemas/public-news.schema';
import {
  getPublishedNewsById,
  listPublishedNews,
} from '../services/news.service';

export const publicNewsController = {
  async list(req: Request, res: Response) {
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

      const result = await listPublishedNews(validation.data);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Failed to list published news:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list news',
        },
      });
    }
  },

  async detail(req: Request, res: Response) {
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

      const result = await getPublishedNewsById(newsId);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'NEWS_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'News item not found',
          },
        });
      }

      console.error('Failed to load published news detail:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to load news detail',
        },
      });
    }
  },
};
