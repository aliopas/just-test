import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const chatRouter = Router();

chatRouter.get(
  '/conversations',
  authenticate,
  requirePermission(['investor.requests.read', 'admin.requests.review']),
  chatController.listConversations
);

chatRouter.get(
  '/conversations/:conversationId/messages',
  authenticate,
  requirePermission(['investor.requests.read', 'admin.requests.review']),
  chatController.listMessages
);

chatRouter.post(
  '/messages',
  authenticate,
  requirePermission(['investor.requests.read', 'admin.requests.review']),
  chatController.sendMessage
);

chatRouter.post(
  '/conversations/:conversationId/read',
  authenticate,
  requirePermission(['investor.requests.read', 'admin.requests.review']),
  chatController.markRead
);

export { chatRouter };

