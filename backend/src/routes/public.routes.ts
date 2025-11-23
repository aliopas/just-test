import { Router } from 'express';
import { publicProjectController } from '../controllers/public-project.controller';
import { listHomepageSections } from '../services/homepage-sections.service';

const publicRouter = Router();

// Public projects routes (no authentication required)
publicRouter.get('/projects', publicProjectController.list);
publicRouter.get('/projects/:id', publicProjectController.detail);

// Public homepage sections route (no authentication required)
publicRouter.get('/homepage-sections', async (_req, res) => {
  try {
    const sections = await listHomepageSections(false);
    return res.status(200).json({ sections });
  } catch (error) {
    console.error('Failed to list homepage sections:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to list homepage sections',
      },
    });
  }
});

export { publicRouter };

