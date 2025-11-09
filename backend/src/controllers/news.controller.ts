import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  newsCreateSchema,
  newsListQuerySchema,
  newsUpdateSchema,
} from '../schemas/news.schema';
import {
  createNews,
  deleteNews,
  getNewsById,
  listNews,
  updateNews,
} from '../services/news.service';

export const newsController = {
  async list(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = newsListQuerySchema.safeParse(req.query);
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

      const result = await listNews(validation.data);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Failed to list news:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list news',
        },
      });
    }
  },

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = newsCreateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const result = await createNews({
        authorId: req.user?.id ?? null,
        input: validation.data,
      });

      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NEWS_SLUG_EXISTS') {
          return res.status(409).json({
            error: {
              code: 'SLUG_EXISTS',
              message: 'Slug already exists',
            },
          });
        }
      }

      console.error('Failed to create news:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create news',
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

      const result = await getNewsById(newsId);
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

      console.error('Failed to load news detail:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to load news detail',
        },
      });
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
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

      const validation = newsUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const result = await updateNews({
        id: newsId,
        input: validation.data,
      });

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NEWS_NOT_FOUND') {
          return res.status(404).json({
            error: {
              code: 'NOT_FOUND',
              message: 'News item not found',
            },
          });
        }

        if (error.message === 'NEWS_SLUG_EXISTS') {
          return res.status(409).json({
            error: {
              code: 'SLUG_EXISTS',
              message: 'Slug already exists',
            },
          });
        }
      }

      console.error('Failed to update news:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update news',
        },
      });
    }
  },

  async remove(req: AuthenticatedRequest, res: Response) {
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

      await deleteNews(newsId);

      return res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'NEWS_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'News item not found',
          },
        });
      }

      console.error('Failed to delete news:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete news',
        },
      });
    }
  },
};
