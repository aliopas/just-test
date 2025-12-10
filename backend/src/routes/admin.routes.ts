import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { adminRequestController } from '../controllers/admin-request.controller';
import { adminUserController } from '../controllers/admin-user.controller';
import { newsController } from '../controllers/news.controller';
import { adminDashboardController } from '../controllers/admin-dashboard.controller';
import { adminAuditLogController } from '../controllers/admin-audit-log.controller';
import { adminReportsController } from '../controllers/admin-reports.controller';
import { adminContentAnalyticsController } from '../controllers/admin-content-analytics.controller';
import { investorSignupRequestController } from '../controllers/investor-signup-request.controller';
import { projectController } from '../controllers/project.controller';
import { homepageSectionsController } from '../controllers/homepage-sections.controller';
import { companyContentController } from '../controllers/company-content.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const adminRouter = Router();

// Async error wrapper to catch errors from async route handlers
// This ensures all unhandled promise rejections are caught and passed to Express error handler
const asyncHandler = (
  fn: (req: Request, res: Response, next?: NextFunction) => Promise<any> | any
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as any, res, next)).catch(next);
  };
};

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
  '/requests/:id/status',
  authenticate,
  requirePermission('admin.requests.review'),
  adminRequestController.updateStatus
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

adminRouter.post(
  '/news/attachments/presign',
  authenticate,
  requirePermission('admin.content.manage'),
  newsController.presignAttachment
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

adminRouter.get(
  '/account-requests',
  authenticate,
  requirePermission('admin.users.manage'),
  asyncHandler(investorSignupRequestController.list as any)
);

adminRouter.get(
  '/account-requests/unread-count',
  authenticate,
  requirePermission('admin.users.manage'),
  asyncHandler(investorSignupRequestController.getUnreadCount as any)
);

adminRouter.post(
  '/account-requests/:id/mark-read',
  authenticate,
  requirePermission('admin.users.manage'),
  asyncHandler(investorSignupRequestController.markAsRead as any)
);

adminRouter.post(
  '/account-requests/:id/approve',
  authenticate,
  requirePermission('admin.users.manage'),
  asyncHandler(investorSignupRequestController.approve as any)
);

adminRouter.post(
  '/account-requests/:id/reject',
  authenticate,
  requirePermission('admin.users.manage'),
  asyncHandler(investorSignupRequestController.reject as any)
);

// Projects routes
adminRouter.get(
  '/projects',
  authenticate,
  requirePermission('admin.content.manage'),
  projectController.list
);

adminRouter.get(
  '/projects/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  projectController.getById
);

adminRouter.post(
  '/projects',
  authenticate,
  requirePermission('admin.content.manage'),
  projectController.create
);

adminRouter.post(
  '/projects/images/presign',
  authenticate,
  requirePermission('admin.content.manage'),
  projectController.presignImage
);

adminRouter.patch(
  '/projects/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  projectController.update
);

adminRouter.delete(
  '/projects/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  projectController.remove
);

// Homepage sections routes
adminRouter.get(
  '/homepage-sections',
  authenticate,
  requirePermission('admin.content.manage'),
  homepageSectionsController.list
);

adminRouter.get(
  '/homepage-sections/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  homepageSectionsController.getById
);

adminRouter.post(
  '/homepage-sections',
  authenticate,
  requirePermission('admin.content.manage'),
  homepageSectionsController.create
);

adminRouter.patch(
  '/homepage-sections/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  homepageSectionsController.update
);

adminRouter.delete(
  '/homepage-sections/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  homepageSectionsController.remove
);

// ============================================================================
// Company Content Routes (Epic 9 - Story 9.2)
// ============================================================================

// Company Profile routes
adminRouter.get(
  '/company-profile',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.listProfiles as any)
);

adminRouter.get(
  '/company-profile/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.getProfileById as any)
);

adminRouter.post(
  '/company-profile',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.createProfile as any)
);

adminRouter.patch(
  '/company-profile/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.updateProfile as any)
);

adminRouter.delete(
  '/company-profile/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.deleteProfile as any)
);

// Company Partners routes
adminRouter.get(
  '/company-partners',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.listPartners as any)
);

adminRouter.get(
  '/company-partners/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.getPartnerById as any)
);

adminRouter.post(
  '/company-partners',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.createPartner as any)
);

adminRouter.patch(
  '/company-partners/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.updatePartner as any)
);

adminRouter.delete(
  '/company-partners/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.deletePartner as any)
);

// Company Clients routes
adminRouter.get(
  '/company-clients',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.listClients as any)
);

adminRouter.get(
  '/company-clients/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.getClientById as any)
);

adminRouter.post(
  '/company-clients',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.createClient as any)
);

adminRouter.patch(
  '/company-clients/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.updateClient as any)
);

adminRouter.delete(
  '/company-clients/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.deleteClient as any)
);

// Company Resources routes
adminRouter.get(
  '/company-resources',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.listResources as any)
);

adminRouter.get(
  '/company-resources/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.getResourceById as any)
);

adminRouter.post(
  '/company-resources',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.createResource as any)
);

adminRouter.patch(
  '/company-resources/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.updateResource as any)
);

adminRouter.delete(
  '/company-resources/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.deleteResource as any)
);

// Company Strengths routes
adminRouter.get(
  '/company-strengths',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.listStrengths as any)
);

adminRouter.get(
  '/company-strengths/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.getStrengthById as any)
);

adminRouter.post(
  '/company-strengths',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.createStrength as any)
);

adminRouter.patch(
  '/company-strengths/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.updateStrength as any)
);

adminRouter.delete(
  '/company-strengths/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.deleteStrength as any)
);

// Partnership Info routes
adminRouter.get(
  '/partnership-info',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.listPartnershipInfo as any)
);

adminRouter.get(
  '/partnership-info/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.getPartnershipInfoById as any)
);

adminRouter.post(
  '/partnership-info',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.createPartnershipInfo as any)
);

adminRouter.patch(
  '/partnership-info/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.updatePartnershipInfo as any)
);

adminRouter.delete(
  '/partnership-info/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.deletePartnershipInfo as any)
);

// Market Value routes
adminRouter.get(
  '/market-value',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.listMarketValues as any)
);

adminRouter.get(
  '/market-value/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.getMarketValueById as any)
);

adminRouter.post(
  '/market-value',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.createMarketValue as any)
);

adminRouter.patch(
  '/market-value/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.updateMarketValue as any)
);

adminRouter.delete(
  '/market-value/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.deleteMarketValue as any)
);

// Company Goals routes
adminRouter.get(
  '/company-goals',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.listGoals as any)
);

adminRouter.get(
  '/company-goals/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.getGoalById as any)
);

adminRouter.post(
  '/company-goals',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.createGoal as any)
);

adminRouter.patch(
  '/company-goals/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.updateGoal as any)
);

adminRouter.delete(
  '/company-goals/:id',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.deleteGoal as any)
);

// Presigned URL for company content images/icons
adminRouter.post(
  '/company-content/images/presign',
  authenticate,
  requirePermission('admin.content.manage'),
  asyncHandler(companyContentController.presignImage as any)
);

export { adminRouter };
