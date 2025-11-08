import { Router } from 'express';
import { investorProfileController } from '../controllers/investor-profile.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import { investorProfileUpdateSchema } from '../schemas/investor-profile.schema';
import { requestController } from '../controllers/request.controller';

const investorRouter = Router();

investorRouter.get(
  '/requests',
  authenticate,
  requirePermission(['investor.requests.read', 'admin.requests.review']),
  requestController.list
);

investorRouter.post(
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

export { investorRouter };
