import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const notificationRouter = Router();

notificationRouter.get(
  '/',
  authenticate,
  requirePermission('investor.notifications.read'),
  notificationController.list
);

notificationRouter.patch(
  '/:id/read',
  authenticate,
  requirePermission('investor.notifications.read'),
  notificationController.markRead
);

notificationRouter.post(
  '/mark-all-read',
  authenticate,
  requirePermission('investor.notifications.read'),
  notificationController.markAllRead
);

export { notificationRouter };
