import { Router } from 'express';
import { publicProjectController } from '../controllers/public-project.controller';
import { listHomepageSections } from '../services/homepage-sections.service';
import { publicContentController } from '../controllers/public-content.controller';

const publicRouter: Router = Router();

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

// ============================================================================
// Public Company Content Routes (Epic 9 - Story 9.3)
// No authentication required - public endpoints for landing page
// ============================================================================

// Company Profile
publicRouter.get('/company-profile', publicContentController.getCompanyProfile);

// Company Partners
publicRouter.get(
  '/company-partners',
  publicContentController.getCompanyPartners
);

// Company Clients
publicRouter.get('/company-clients', publicContentController.getCompanyClients);

// Company Resources
publicRouter.get(
  '/company-resources',
  publicContentController.getCompanyResources
);

// Company Strengths
publicRouter.get(
  '/company-strengths',
  publicContentController.getCompanyStrengths
);

// Partnership Info
publicRouter.get(
  '/partnership-info',
  publicContentController.getPartnershipInfo
);

// Market Value
publicRouter.get('/market-value', publicContentController.getMarketValue);

// Company Goals
publicRouter.get('/company-goals', publicContentController.getCompanyGoals);

export { publicRouter };
