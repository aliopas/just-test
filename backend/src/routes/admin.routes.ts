import { Router } from 'express';
import { adminUserController } from '../controllers/admin-user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const adminRouter = Router();

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
