import { z } from 'zod';

export const projectStatusSchema = z.enum(['active', 'inactive', 'archived']);

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  nameAr: z.string().trim().max(255).optional(),
  description: z.string().trim().optional(),
  descriptionAr: z.string().trim().optional(),
  operatingCosts: z.number().min(0, 'Operating costs must be positive'),
  annualBenefits: z.number().min(0, 'Annual benefits must be positive'),
  totalShares: z.number().int().min(1, 'Total shares must be at least 1'),
  sharePrice: z.number().min(1, 'Share price must be positive').default(50000),
  status: projectStatusSchema.default('active'),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  status: projectStatusSchema.optional(),
  search: z.string().trim().min(1).max(100).optional(),
  sortBy: z.enum(['created_at', 'name', 'status']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;

