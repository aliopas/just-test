import { z } from 'zod';

export const projectStatusSchema = z.enum(['active', 'inactive', 'archived']);

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  nameAr: z.string().trim().max(255).optional(),
  description: z.string().trim().optional(),
  descriptionAr: z.string().trim().optional(),
  coverKey: z.string().trim().max(500).optional().nullable(),
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
  status: projectStatusSchema.or(z.literal('all')).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  sortBy: z.enum(['created_at', 'name', 'status']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;

export const projectImagePresignSchema = z
  .object({
    fileName: z
      .string()
      .trim()
      .min(3)
      .max(255)
      .regex(/\.[a-zA-Z0-9]+$/, 'fileName must include an extension'),
    fileType: z
      .string()
      .trim()
      .regex(/^image\/[a-z0-9.+-]+$/i, 'Only image MIME types are allowed'),
    fileSize: z.coerce
      .number()
      .int()
      .positive()
      .max(8 * 1024 * 1024, 'File size exceeds 8MB limit'),
  })
  .refine(
    value => {
      const extension = value.fileName.split('.').pop()?.toLowerCase() ?? '';
      return ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'].includes(extension);
    },
    {
      message: 'Unsupported image extension',
      path: ['fileName'],
    }
  );

export type ProjectImagePresignInput = z.infer<typeof projectImagePresignSchema>;

