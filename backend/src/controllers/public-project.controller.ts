import type { Request, Response } from 'express';
import { projectListQuerySchema } from '../schemas/projects.schema';
import { listProjects, getProjectById } from '../services/project.service';

export const publicProjectController = {
  async list(req: Request, res: Response) {
    try {
      const validation = projectListQuerySchema.safeParse({
        ...req.query,
        status: 'active', // Only show active projects to public
      });
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
      console.error('Failed to list public projects:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list projects',
        },
      });
    }
  },

  async detail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const project = await getProjectById(id);

      if (!project || project.status !== 'active') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
          },
        });
      }

      return res.status(200).json(project);
    } catch (error) {
      console.error('Failed to get public project:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get project',
        },
      });
    }
  },
};
