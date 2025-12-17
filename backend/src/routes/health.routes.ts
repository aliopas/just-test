import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

const healthRouter: Router = Router();

healthRouter.get('/', healthController.getHealth);

export { healthRouter };
