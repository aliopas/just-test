import { Router } from 'express';
import { investorProfileController } from '../controllers/investor-profile.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import { investorProfileUpdateSchema } from '../schemas/investor-profile.schema';

const investorRouter = Router();

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

export { investorRouter };
