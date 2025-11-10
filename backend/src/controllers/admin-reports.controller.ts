import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  adminRequestReportQuerySchema,
  getAdminRequestReport,
} from '../services/admin-reports.service';

export const adminReportsController = {
  async requests(req: AuthenticatedRequest, res: Response) {
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

      const parseResult = adminRequestReportQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid report filters',
            details: parseResult.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const report = await getAdminRequestReport(parseResult.data);

      if (report.format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${report.filename}"`
        );
        return res.status(200).send(report.content);
      }

      return res.status(200).json(report);
    } catch (error) {
      console.error('Failed to generate admin request report:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate request report',
        },
      });
    }
  },
};

