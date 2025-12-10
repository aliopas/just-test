import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  createProjectSchema,
  updateProjectSchema,
  projectListQuerySchema,
  projectImagePresignSchema,
} from '../schemas/projects.schema';
import {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  createProjectImageUploadUrl,
} from '../services/project.service';

export const projectController = {
  async list(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = projectListQuerySchema.safeParse(req.query);
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

      const result = await listProjects(validation.data);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Failed to list projects:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list projects',
        },
      });
    }
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const project = await getProjectById(id);

      if (!project) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
          },
        });
      }

      return res.status(200).json(project);
    } catch (error) {
      console.error('Failed to get project:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get project',
        },
      });
    }
  },

  async create(req: AuthenticatedRequest, res: Response) {
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

      const validation = createProjectSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid project data',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const project = await createProject(validation.data, actorId);
      return res.status(201).json(project);
    } catch (error) {
      console.error('Failed to create project:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create project',
        },
      });
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validation = updateProjectSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid project data',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const project = await updateProject(id, validation.data);
      return res.status(200).json(project);
    } catch (error) {
      console.error('Failed to update project:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update project',
        },
      });
    }
  },

  async remove(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await deleteProject(id);
      res.status(204).send();
      return;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete project',
        },
      });
    }
  },

  async presignImage(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = projectImagePresignSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid image payload',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const uploadInfo = await createProjectImageUploadUrl(validation.data);
      return res.status(201).json(uploadInfo);
    } catch (error) {
      console.error('Failed to create project image upload url:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create image upload url',
        },
      });
    }
  },
};
