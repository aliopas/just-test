import { Router } from 'express';
import { adminRequestController } from '../controllers/admin-request.controller';
import { adminUserController } from '../controllers/admin-user.controller';
import { newsController } from '../controllers/news.controller';
import { adminDashboardController } from '../controllers/admin-dashboard.controller';
import { adminAuditLogController } from '../controllers/admin-audit-log.controller';
import { adminReportsController } from '../controllers/admin-reports.controller';
import { adminContentAnalyticsController } from '../controllers/admin-content-analytics.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const adminRouter = Router();

adminRouter.get(
  '/dashboard/stats',
  authenticate,
  requirePermission('admin.requests.review'),
  adminDashboardController.stats
);

adminRouter.get(
  '/requests',
  authenticate,
  requirePermission('admin.requests.review'),
  adminRequestController.listRequests
);

adminRouter.get(
  '/requests/:id',
  authenticate,
  requirePermission('admin.requests.review'),
  adminRequestController.getRequestDetail
);

adminRouter.get(
  '/requests/:id/timeline',
  authenticate,
  requirePermission('admin.requests.review'),
  adminRequestController.getRequestTimeline
);

adminRouter.patch(
  '/requests/:id/approve',
  authenticate,
  requirePermission('admin.requests.review'),
  adminRequestController.approveRequest
);

adminRouter.patch(
  '/requests/:id/reject',
  authenticate,
  requirePermission('admin.requests.review'),
  adminRequestController.rejectRequest
);

adminRouter.post(
  '/requests/:id/request-info',
  authenticate,
  requirePermission('admin.requests.review'),
  adminRequestController.requestInfo
);

adminRouter.patch(
  '/requests/:id/settle',
  authenticate,
  requirePermission('admin.requests.review'),
  adminRequestController.settleRequest
);

adminRouter.get(
  '/requests/:id/comments',
  authenticate,
  requirePermission('admin.requests.review'),
  adminRequestController.listComments
);

adminRouter.post(
  '/requests/:id/comments',
  authenticate,
  requirePermission('admin.requests.review'),
  adminRequestController.addComment
);

adminRouter.get(
  '/news',
  authenticate,
  requirePermission('admin.content.manage'),
  newsController.list
);

adminRouter.post(
  '/news',
  authenticate,
  requirePermission('admin.content.manage'),
  newsController.create
);

adminRouter.post(
  '/news/images/presign',
  authenticate,
  requirePermission('admin.content.manage'),
  newsController.presignImage
);

adminRouter.get(
  '/audit-logs',
  authenticate,
  requirePermission('admin.audit.read'),
  adminAuditLogController.list
);

adminRouter.get(
  '/reports/requests',
  authenticate,
  requirePermission('admin.requests.review'),
  adminReportsController.requests
);

adminRouter.get(
  '/analytics/content',
  authenticate,
  requirePermission('admin.content.manage'),
  adminContentAnalyticsController.summary
);

adminRouter.get(
  '/news/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  newsController.detail
);

adminRouter.patch(
  '/news/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  newsController.update
);

adminRouter.delete(
  '/news/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  newsController.remove
);

adminRouter.post(
  '/news/publish-scheduled',
  authenticate,
  requirePermission('admin.content.manage'),
  newsController.publishScheduled
);

adminRouter.post(
  '/news/:id/publish',
  authenticate,
  requirePermission('admin.content.manage'),
  newsController.publish
);

adminRouter.post(
  '/news/:id/approve',
  authenticate,
  requirePermission('admin.content.manage'),
  newsController.approve
);

adminRouter.post(
  '/news/:id/reject',
  authenticate,
  requirePermission('admin.content.manage'),
  newsController.reject
);

adminRouter.get(
  '/users',
  authenticate,
  requirePermission('admin.users.manage'),
  adminUserController.listUsers
);

adminRouter.patch(
  '/users/:id/status',
  authenticate,
  requirePermission('admin.users.manage'),
  adminUserController.updateStatus
);

adminRouter.post(
  '/users/:id/reset-password',
  authenticate,
  requirePermission('admin.users.manage'),
  adminUserController.resetPassword
);

adminRouter.post(
  '/users',
  authenticate,
  requirePermission('admin.users.manage'),
  adminUserController.createUser
);

export { adminRouter };
