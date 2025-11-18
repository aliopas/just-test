import { Router } from 'express';
import { publicProjectController } from '../controllers/public-project.controller';

const publicRouter = Router();

// Public projects routes (no authentication required)
publicRouter.get('/projects', publicProjectController.list);
publicRouter.get('/projects/:id', publicProjectController.detail);

export { publicRouter };

