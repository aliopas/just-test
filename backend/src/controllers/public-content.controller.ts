import type { Request, Response } from 'express';
import {
  listCompanyProfiles,
  listCompanyPartners,
  listCompanyClients,
  listCompanyResources,
  listCompanyStrengths,
  listPartnershipInfo,
  listMarketValues,
  listCompanyGoals,
} from '../services/company-content.service';

type Language = 'ar' | 'en';

function getLanguageFromQuery(req: Request): Language {
  const lang = req.query.lang || req.query.language;
  if (lang === 'ar' || lang === 'en') {
    return lang;
  }
  return 'ar'; // Default to Arabic
}

export const publicContentController = {
  // Company Profile
  async getCompanyProfile(req: Request, res: Response) {
    try {
      const language = getLanguageFromQuery(req);
      const profiles = await listCompanyProfiles(false); // includeInactive = false (only active)
      
      const mapped = profiles.map(profile => ({
        id: profile.id,
        title: language === 'ar' ? profile.titleAr : profile.titleEn,
        content: language === 'ar' ? profile.contentAr : profile.contentEn,
        iconKey: profile.iconKey,
        displayOrder: profile.displayOrder,
      }));

      return res.status(200).json({
        profiles: mapped,
        language,
      });
    } catch (error) {
      console.error('Failed to fetch public company profile:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch company profile',
        },
      });
    }
  },

  // Company Partners
  async getCompanyPartners(req: Request, res: Response) {
    try {
      const language = getLanguageFromQuery(req);
      const partners = await listCompanyPartners();
      
      const mapped = partners.map(partner => ({
        id: partner.id,
        name: language === 'ar' ? partner.nameAr : partner.nameEn,
        logoKey: partner.logoKey,
        description: language === 'ar' ? partner.descriptionAr : partner.descriptionEn,
        websiteUrl: partner.websiteUrl,
        displayOrder: partner.displayOrder,
      }));

      return res.status(200).json({
        partners: mapped,
        language,
      });
    } catch (error) {
      console.error('Failed to fetch public company partners:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch company partners',
        },
      });
    }
  },

  // Company Clients
  async getCompanyClients(req: Request, res: Response) {
    try {
      const language = getLanguageFromQuery(req);
      const clients = await listCompanyClients();
      
      const mapped = clients.map(client => ({
        id: client.id,
        name: language === 'ar' ? client.nameAr : client.nameEn,
        logoKey: client.logoKey,
        description: language === 'ar' ? client.descriptionAr : client.descriptionEn,
        displayOrder: client.displayOrder,
      }));

      return res.status(200).json({
        clients: mapped,
        language,
      });
    } catch (error) {
      console.error('Failed to fetch public company clients:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch company clients',
        },
      });
    }
  },

  // Company Resources
  async getCompanyResources(req: Request, res: Response) {
    try {
      const language = getLanguageFromQuery(req);
      const resources = await listCompanyResources();
      
      const mapped = resources.map(resource => ({
        id: resource.id,
        title: language === 'ar' ? resource.titleAr : resource.titleEn,
        description: language === 'ar' ? resource.descriptionAr : resource.descriptionEn,
        iconKey: resource.iconKey,
        value: resource.value,
        currency: resource.currency,
        displayOrder: resource.displayOrder,
      }));

      return res.status(200).json({
        resources: mapped,
        language,
      });
    } catch (error) {
      console.error('Failed to fetch public company resources:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch company resources',
        },
      });
    }
  },

  // Company Strengths
  async getCompanyStrengths(req: Request, res: Response) {
    try {
      const language = getLanguageFromQuery(req);
      const strengths = await listCompanyStrengths();
      
      const mapped = strengths.map(strength => ({
        id: strength.id,
        title: language === 'ar' ? strength.titleAr : strength.titleEn,
        description: language === 'ar' ? strength.descriptionAr : strength.descriptionEn,
        iconKey: strength.iconKey,
        displayOrder: strength.displayOrder,
      }));

      return res.status(200).json({
        strengths: mapped,
        language,
      });
    } catch (error) {
      console.error('Failed to fetch public company strengths:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch company strengths',
        },
      });
    }
  },

  // Partnership Info
  async getPartnershipInfo(req: Request, res: Response) {
    try {
      const language = getLanguageFromQuery(req);
      const partnershipInfoList = await listPartnershipInfo();
      
      const mapped = partnershipInfoList.map(info => ({
        id: info.id,
        title: language === 'ar' ? info.titleAr : info.titleEn,
        content: language === 'ar' ? info.contentAr : info.contentEn,
        steps: language === 'ar' ? info.stepsAr : info.stepsEn,
        iconKey: info.iconKey,
        displayOrder: info.displayOrder,
      }));

      return res.status(200).json({
        partnershipInfo: mapped,
        language,
      });
    } catch (error) {
      console.error('Failed to fetch public partnership info:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch partnership info',
        },
      });
    }
  },

  // Market Value
  async getMarketValue(_req: Request, res: Response) {
    try {
      const marketValues = await listMarketValues(false); // includeUnverified = false (only verified)
      
      // Return the latest verified market value
      const latest = marketValues.length > 0 ? marketValues[0] : null;
      
      if (!latest) {
        return res.status(200).json({
          marketValue: null,
        });
      }

      return res.status(200).json({
        marketValue: {
          id: latest.id,
          value: latest.value,
          currency: latest.currency,
          valuationDate: latest.valuationDate,
          source: latest.source,
          isVerified: latest.isVerified,
          verifiedAt: latest.verifiedAt,
        },
      });
    } catch (error) {
      console.error('Failed to fetch public market value:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch market value',
        },
      });
    }
  },

  // Company Goals
  async getCompanyGoals(req: Request, res: Response) {
    try {
      const language = getLanguageFromQuery(req);
      const goals = await listCompanyGoals();
      
      const mapped = goals.map(goal => ({
        id: goal.id,
        title: language === 'ar' ? goal.titleAr : goal.titleEn,
        description: language === 'ar' ? goal.descriptionAr : goal.descriptionEn,
        targetDate: goal.targetDate,
        iconKey: goal.iconKey,
        displayOrder: goal.displayOrder,
      }));

      return res.status(200).json({
        goals: mapped,
        language,
      });
    } catch (error) {
      console.error('Failed to fetch public company goals:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch company goals',
        },
      });
    }
  },
};

