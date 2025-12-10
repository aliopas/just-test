import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  companyProfileCreateSchema,
  companyProfileUpdateSchema,
  companyContentImagePresignSchema,
  companyPartnersCreateSchema,
  companyPartnersUpdateSchema,
  companyClientsCreateSchema,
  companyClientsUpdateSchema,
  companyResourcesCreateSchema,
  companyResourcesUpdateSchema,
  companyStrengthsCreateSchema,
  companyStrengthsUpdateSchema,
  partnershipInfoCreateSchema,
  partnershipInfoUpdateSchema,
  marketValueCreateSchema,
  marketValueUpdateSchema,
  companyGoalsCreateSchema,
  companyGoalsUpdateSchema,
} from '../schemas/company-content.schema';
import {
  listCompanyProfiles,
  getCompanyProfileById,
  createCompanyProfile,
  updateCompanyProfile,
  deleteCompanyProfile,
  listCompanyPartners,
  getCompanyPartnerById,
  createCompanyPartner,
  updateCompanyPartner,
  deleteCompanyPartner,
  listCompanyClients,
  getCompanyClientById,
  createCompanyClient,
  updateCompanyClient,
  deleteCompanyClient,
  listCompanyResources,
  getCompanyResourceById,
  createCompanyResource,
  updateCompanyResource,
  deleteCompanyResource,
  listCompanyStrengths,
  getCompanyStrengthById,
  createCompanyStrength,
  updateCompanyStrength,
  deleteCompanyStrength,
  listPartnershipInfo,
  getPartnershipInfoById,
  createPartnershipInfo,
  updatePartnershipInfo,
  deletePartnershipInfo,
  listMarketValues,
  getMarketValueById,
  createMarketValue,
  updateMarketValue,
  deleteMarketValue,
  listCompanyGoals,
  getCompanyGoalById,
  createCompanyGoal,
  updateCompanyGoal,
  deleteCompanyGoal,
  createCompanyContentImageUploadUrl,
} from '../services/company-content.service';

// ============================================================================
// Company Profile Controller
// ============================================================================

export const companyContentController = {
  // Company Profile endpoints
  async listProfiles(req: AuthenticatedRequest, res: Response) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const profiles = await listCompanyProfiles(includeInactive);
      res.status(200).json({ profiles });
      return;
    } catch (error) {
      console.error('Failed to list company profiles:', error);
      
      // Ensure we always send a valid JSON response
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = error instanceof Error && error.message.includes('service role key') 
        ? 'CONFIGURATION_ERROR' 
        : 'INTERNAL_ERROR';
      
      res.status(500).json({
        error: {
          code: errorCode,
          message: 'Failed to list company profiles',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        },
      });
      return;
    }
  },

  async getProfileById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid profile ID',
          },
        });
        return;
      }

      const profile = await getCompanyProfileById(id);

      if (!profile) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Company profile not found',
          },
        });
        return;
      }

      res.status(200).json(profile);
      return;
    } catch (error) {
      console.error('Failed to get company profile:', error);
      
      // Ensure we always send a valid JSON response
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = error instanceof Error && error.message.includes('service role key') 
        ? 'CONFIGURATION_ERROR' 
        : 'INTERNAL_ERROR';
      
      res.status(500).json({
        error: {
          code: errorCode,
          message: 'Failed to get company profile',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        },
      });
      return;
    }
  },

  async createProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = companyProfileCreateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
        return;
      }

      const profile = await createCompanyProfile(validation.data);
      res.status(201).json(profile);
      return;
    } catch (error) {
      console.error('Failed to create company profile:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create company profile',
        },
      });
      return;
    }
  },

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        const response = res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid profile ID',
          },
        });
        return response;
      }
      
      const validation = companyProfileUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        const response = res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
        return response;
      }

      const profile = await updateCompanyProfile(id, validation.data);
      const response = res.status(200).json(profile);
      return response;
    } catch (error) {
      // Ensure response hasn't been sent yet
      if (res.headersSent) {
        console.error('Response already sent, cannot send error response');
        return;
      }
      
      if (
        error instanceof Error &&
        error.message === 'COMPANY_PROFILE_NOT_FOUND'
      ) {
        const response = res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Company profile not found',
          },
        });
        return response;
      }
      
      // Handle Supabase connection errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (
          errorMessage.includes('service role key') ||
          errorMessage.includes('supabase') ||
          errorMessage.includes('connection') ||
          errorMessage.includes('network') ||
          errorMessage.includes('database')
        ) {
          console.error('Supabase connection error:', error);
          const response = res.status(503).json({
            error: {
              code: 'SERVICE_UNAVAILABLE',
              message: 'Database service is temporarily unavailable',
              details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
          });
          return response;
        }
      }
      
      console.error('Failed to update company profile:', error);
      const response = res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update company profile',
          details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
        },
      });
      return response;
    }
  },

  async deleteProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await deleteCompanyProfile(id);
      res.status(204).end();
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'COMPANY_PROFILE_NOT_FOUND'
      ) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Company profile not found',
          },
        });
        return;
      }
      console.error('Failed to delete company profile:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete company profile',
        },
      });
      return;
    }
  },

  // Company Partners endpoints
  async listPartners(_req: AuthenticatedRequest, res: Response) {
    try {
      const partners = await listCompanyPartners();
      res.status(200).json({ partners });
      return;
    } catch (error) {
      console.error('Failed to list company partners:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list company partners',
        },
      });
      return;
    }
  },

  async getPartnerById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const partner = await getCompanyPartnerById(id);

      if (!partner) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Company partner not found',
          },
        });
        return;
      }

      res.status(200).json(partner);
      return;
    } catch (error) {
      console.error('Failed to get company partner:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get company partner',
        },
      });
      return;
    }
  },

  async createPartner(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = companyPartnersCreateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      const partner = await createCompanyPartner(validation.data);
      res.status(201).json(partner);
      return;
    } catch (error) {
      console.error('Failed to create company partner:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create company partner',
        },
      });
      return;
    }
  },

  async updatePartner(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validation = companyPartnersUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      const partner = await updateCompanyPartner(id, validation.data);
      res.status(200).json(partner);
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'COMPANY_PARTNER_NOT_FOUND'
      ) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Company partner not found',
          },
        });
        return;
      }
      console.error('Failed to update company partner:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update company partner',
        },
      });
      return;
    }
  },

  async deletePartner(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await deleteCompanyPartner(id);
      res.status(204).end();
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'COMPANY_PARTNER_NOT_FOUND'
      ) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Company partner not found',
          },
        });
        return;
      }
      console.error('Failed to delete company partner:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete company partner',
        },
      });
      return;
    }
  },

  // Company Clients endpoints
  async listClients(_req: AuthenticatedRequest, res: Response) {
    try {
      const clients = await listCompanyClients();
      res.status(200).json({ clients });
      return;
    } catch (error) {
      console.error('Failed to list company clients:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list company clients',
        },
      });
      return;
    }
  },

  async getClientById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const client = await getCompanyClientById(id);

      if (!client) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Company client not found',
          },
        });
        return;
      }

      res.status(200).json(client);
      return;
    } catch (error) {
      console.error('Failed to get company client:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get company client',
        },
      });
      return;
    }
  },

  async createClient(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = companyClientsCreateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      const client = await createCompanyClient(validation.data);
      res.status(201).json(client);
      return;
    } catch (error) {
      console.error('Failed to create company client:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create company client',
        },
      });
      return;
    }
  },

  async updateClient(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validation = companyClientsUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      const client = await updateCompanyClient(id, validation.data);
      res.status(200).json(client);
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'COMPANY_CLIENT_NOT_FOUND'
      ) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Company client not found',
          },
        });
        return;
      }
      console.error('Failed to update company client:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update company client',
        },
      });
      return;
    }
  },

  async deleteClient(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await deleteCompanyClient(id);
      res.status(204).end();
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'COMPANY_CLIENT_NOT_FOUND'
      ) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Company client not found',
          },
        });
      }
      console.error('Failed to delete company client:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete company client',
        },
      });
    }
  },

  // Company Resources endpoints
  async listResources(_req: AuthenticatedRequest, res: Response) {
    try {
      const resources = await listCompanyResources();
      return res.status(200).json({ resources });
    } catch (error) {
      console.error('Failed to list company resources:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list company resources',
        },
      });
    }
  },

  async getResourceById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const resource = await getCompanyResourceById(id);

      if (!resource) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Company resource not found',
          },
        });
      }

      return res.status(200).json(resource);
    } catch (error) {
      console.error('Failed to get company resource:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get company resource',
        },
      });
    }
  },

  async createResource(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = companyResourcesCreateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      const resource = await createCompanyResource(validation.data);
      res.status(201).json(resource);
      return;
    } catch (error) {
      console.error('Failed to create company resource:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create company resource',
        },
      });
      return;
    }
  },

  async updateResource(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validation = companyResourcesUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      const resource = await updateCompanyResource(id, validation.data);
      res.status(200).json(resource);
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'COMPANY_RESOURCE_NOT_FOUND'
      ) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Company resource not found',
          },
        });
        return;
      }
      console.error('Failed to update company resource:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update company resource',
        },
      });
      return;
    }
  },

  async deleteResource(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await deleteCompanyResource(id);
      res.status(204).end();
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'COMPANY_RESOURCE_NOT_FOUND'
      ) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Company resource not found',
          },
        });
      }
      console.error('Failed to delete company resource:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete company resource',
        },
      });
    }
  },

  // Company Strengths endpoints
  async listStrengths(_req: AuthenticatedRequest, res: Response) {
    try {
      const strengths = await listCompanyStrengths();
      return res.status(200).json({ strengths });
    } catch (error) {
      console.error('Failed to list company strengths:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list company strengths',
        },
      });
    }
  },

  async getStrengthById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const strength = await getCompanyStrengthById(id);

      if (!strength) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Company strength not found',
          },
        });
      }

      return res.status(200).json(strength);
    } catch (error) {
      console.error('Failed to get company strength:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get company strength',
        },
      });
    }
  },

  async createStrength(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = companyStrengthsCreateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      const strength = await createCompanyStrength(validation.data);
      res.status(201).json(strength);
      return;
    } catch (error) {
      console.error('Failed to create company strength:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create company strength',
        },
      });
      return;
    }
  },

  async updateStrength(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validation = companyStrengthsUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      const strength = await updateCompanyStrength(id, validation.data);
      res.status(200).json(strength);
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'COMPANY_STRENGTH_NOT_FOUND'
      ) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Company strength not found',
          },
        });
        return;
      }
      console.error('Failed to update company strength:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update company strength',
        },
      });
      return;
    }
  },

  async deleteStrength(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await deleteCompanyStrength(id);
      res.status(204).end();
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'COMPANY_STRENGTH_NOT_FOUND'
      ) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Company strength not found',
          },
        });
      }
      console.error('Failed to delete company strength:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete company strength',
        },
      });
    }
  },

  // Partnership Info endpoints
  async listPartnershipInfo(_req: AuthenticatedRequest, res: Response) {
    try {
      const partnershipInfo = await listPartnershipInfo();
      return res.status(200).json({ partnershipInfo });
    } catch (error) {
      console.error('Failed to list partnership info:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list partnership info',
        },
      });
    }
  },

  async getPartnershipInfoById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const info = await getPartnershipInfoById(id);

      if (!info) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Partnership info not found',
          },
        });
      }

      return res.status(200).json(info);
    } catch (error) {
      console.error('Failed to get partnership info:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get partnership info',
        },
      });
    }
  },

  async createPartnershipInfo(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = partnershipInfoCreateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      const info = await createPartnershipInfo(validation.data);
      res.status(201).json(info);
      return;
    } catch (error) {
      console.error('Failed to create partnership info:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create partnership info',
        },
      });
      return;
    }
  },

  async updatePartnershipInfo(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validation = partnershipInfoUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      const info = await updatePartnershipInfo(id, validation.data);
      res.status(200).json(info);
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'PARTNERSHIP_INFO_NOT_FOUND'
      ) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Partnership info not found',
          },
        });
        return;
      }
      console.error('Failed to update partnership info:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update partnership info',
        },
      });
      return;
    }
  },

  async deletePartnershipInfo(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await deletePartnershipInfo(id);
      res.status(204).end();
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'PARTNERSHIP_INFO_NOT_FOUND'
      ) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Partnership info not found',
          },
        });
      }
      console.error('Failed to delete partnership info:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete partnership info',
        },
      });
    }
  },

  // Market Value endpoints
  async listMarketValues(req: AuthenticatedRequest, res: Response) {
    try {
      const includeUnverified = req.query.includeUnverified === 'true';
      const marketValues = await listMarketValues(includeUnverified);
      return res.status(200).json({ marketValues });
    } catch (error) {
      console.error('Failed to list market values:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list market values',
        },
      });
    }
  },

  async getMarketValueById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const marketValue = await getMarketValueById(id);

      if (!marketValue) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Market value not found',
          },
        });
      }

      return res.status(200).json(marketValue);
    } catch (error) {
      console.error('Failed to get market value:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get market value',
        },
      });
    }
  },

  async createMarketValue(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = marketValueCreateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      const marketValue = await createMarketValue(validation.data);
      res.status(201).json(marketValue);
      return;
    } catch (error) {
      console.error('Failed to create market value:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create market value',
        },
      });
      return;
    }
  },

  async updateMarketValue(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validation = marketValueUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      const marketValue = await updateMarketValue(id, validation.data);
      res.status(200).json(marketValue);
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'MARKET_VALUE_NOT_FOUND'
      ) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Market value not found',
          },
        });
        return;
      }
      console.error('Failed to update market value:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update market value',
        },
      });
      return;
    }
  },

  async deleteMarketValue(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await deleteMarketValue(id);
      res.status(204).end();
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'MARKET_VALUE_NOT_FOUND'
      ) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Market value not found',
          },
        });
      }
      console.error('Failed to delete market value:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete market value',
        },
      });
    }
  },

  // Company Goals endpoints
  async listGoals(_req: AuthenticatedRequest, res: Response) {
    try {
      const goals = await listCompanyGoals();
      return res.status(200).json({ goals });
    } catch (error) {
      console.error('Failed to list company goals:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list company goals',
        },
      });
    }
  },

  async getGoalById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const goal = await getCompanyGoalById(id);

      if (!goal) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Company goal not found',
          },
        });
      }

      return res.status(200).json(goal);
    } catch (error) {
      console.error('Failed to get company goal:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get company goal',
        },
      });
    }
  },

  async createGoal(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = companyGoalsCreateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      const goal = await createCompanyGoal(validation.data);
      res.status(201).json(goal);
      return;
    } catch (error) {
      console.error('Failed to create company goal:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create company goal',
        },
      });
      return;
    }
  },

  async updateGoal(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validation = companyGoalsUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      const goal = await updateCompanyGoal(id, validation.data);
      res.status(200).json(goal);
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'COMPANY_GOAL_NOT_FOUND'
      ) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Company goal not found',
          },
        });
        return;
      }
      console.error('Failed to update company goal:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update company goal',
        },
      });
      return;
    }
  },

  async deleteGoal(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await deleteCompanyGoal(id);
      res.status(204).end();
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'COMPANY_GOAL_NOT_FOUND'
      ) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Company goal not found',
          },
        });
      }
      console.error('Failed to delete company goal:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete company goal',
        },
      });
    }
  },

  // Presigned URL for image/icon uploads
  async presignImage(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = companyContentImagePresignSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload',
            details: validation.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }

      const result = await createCompanyContentImageUploadUrl({
        fileName: validation.data.fileName,
        fileType: validation.data.fileType,
        purpose: validation.data.purpose,
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error('Failed to create image upload url:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create image upload url',
        },
      });
    }
  },
};
