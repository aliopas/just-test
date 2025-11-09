import { Router } from 'express';
import { publicNewsController } from '../controllers/public-news.controller';

const newsRouter = Router();

newsRouter.get('/', publicNewsController.list);
newsRouter.get('/:id', publicNewsController.detail);

export { newsRouter };
