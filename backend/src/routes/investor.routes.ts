import { Router } from 'express';
import { investorProfileController } from '../controllers/investor-profile.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import { investorProfileUpdateSchema } from '../schemas/investor-profile.schema';
import { requestController } from '../controllers/request.controller';
import { investorDashboardController } from '../controllers/investor-dashboard.controller';
import { investorStocksController } from '../controllers/investor-stocks.controller';
import { investorInternalNewsController } from '../controllers/investor-internal-news.controller';

const investorRouter = Router();

investorRouter.get(
  '/requests',
  authenticate,
  requirePermission(['investor.requests.read', 'admin.requests.review']),
  requestController.list
);

investorRouter.get(
  '/dashboard',
  authenticate,
  requirePermission(['investor.requests.read', 'admin.requests.review']),
  investorDashboardController.getDashboard
);

investorRouter.get(
  '/stocks',
  authenticate,
  requirePermission([
    'investor.market.read',
    'investor.requests.read',
    'admin.requests.review',
  ]),
  investorStocksController.getStockFeed
);

investorRouter.get(
  '/profile',
  authenticate,
  requirePermission(['investor.profile.read', 'admin.users.manage']),
  investorProfileController.getProfile
);

investorRouter.patch(
  '/profile',
  authenticate,
  requirePermission(['investor.profile.update', 'admin.users.manage']),
  validate(investorProfileUpdateSchema),
  investorProfileController.updateProfile
);

investorRouter.post(
  '/requests',
  authenticate,
  requirePermission('investor.requests.create'),
  requestController.create
);

investorRouter.post(
  '/requests/:id/submit',
  authenticate,
  requirePermission('investor.requests.submit'),
  requestController.submit
);

investorRouter.get(
  '/requests/:id',
  authenticate,
  requirePermission(['investor.requests.read', 'admin.requests.review']),
  requestController.detail
);

investorRouter.get(
  '/requests/:id/timeline',
  authenticate,
  requirePermission(['investor.requests.read', 'admin.requests.review']),
  requestController.timeline
);

investorRouter.post(
  '/requests/:id/files/presign',
  authenticate,
  requirePermission('investor.requests.create'),
  requestController.presignAttachment
);

investorRouter.get(
  '/internal-news',
  authenticate,
  requirePermission(['investor.news.read', 'admin.content.manage']),
  investorInternalNewsController.list
);

investorRouter.get(
  '/internal-news/:id',
  authenticate,
  requirePermission(['investor.news.read', 'admin.content.manage']),
  investorInternalNewsController.detail
);

export { investorRouter };
