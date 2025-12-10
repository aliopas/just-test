import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  homepageSectionCreateSchema,
  homepageSectionUpdateSchema,
} from '../schemas/homepage-sections.schema';
import {
  listHomepageSections,
  getHomepageSectionById,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
} from '../services/homepage-sections.service';

export const homepageSectionsController = {
  async list(req: AuthenticatedRequest, res: Response) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const sections = await listHomepageSections(includeInactive);
      return res.status(200).json({ sections });
    } catch (error) {
      console.error('Failed to list homepage sections:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list homepage sections',
        },
      });
    }
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const section = await getHomepageSectionById(id);

      if (!section) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Homepage section not found',
          },
        });
      }

      return res.status(200).json(section);
    } catch (error) {
      console.error('Failed to get homepage section:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get homepage section',
        },
      });
    }
  },

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = homepageSectionCreateSchema.safeParse(req.body);
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

      const section = await createHomepageSection(validation.data);
      return res.status(201).json(section);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'HOMEPAGE_SECTION_TYPE_EXISTS') {
          return res.status(409).json({
            error: {
              code: 'TYPE_EXISTS',
              message: 'A section with this type already exists',
            },
          });
        }
      }

      console.error('Failed to create homepage section:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create homepage section',
        },
      });
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validation = homepageSectionUpdateSchema.safeParse(req.body);
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

      const section = await updateHomepageSection(id, validation.data);
      return res.status(200).json(section);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'HOMEPAGE_SECTION_NOT_FOUND') {
          return res.status(404).json({
            error: {
              code: 'NOT_FOUND',
              message: 'Homepage section not found',
            },
          });
        }
        if (error.message === 'HOMEPAGE_SECTION_TYPE_EXISTS') {
          return res.status(409).json({
            error: {
              code: 'TYPE_EXISTS',
              message: 'A section with this type already exists',
            },
          });
        }
      }

      console.error('Failed to update homepage section:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update homepage section',
        },
      });
    }
  },

  async remove(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await deleteHomepageSection(id);
      res.status(204).send();
      return;
    } catch (error) {
      console.error('Failed to delete homepage section:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete homepage section',
        },
      });
    }
  },
};
