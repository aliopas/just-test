import { z } from 'zod';

// ============================================================================
// Common schemas
// ============================================================================

const iconKeySchema = z.string().trim().max(500).optional().nullable();
const displayOrderSchema = z.number().int().min(0).default(0);
const dateSchema = z.string().date().optional().nullable();

// ============================================================================
// company_profile schemas
// ============================================================================

export const companyProfileCreateSchema = z.object({
  titleAr: z.string().trim().min(1, 'Arabic title is required').max(200),
  titleEn: z.string().trim().min(1, 'English title is required').max(200),
  contentAr: z.string().trim().min(1, 'Arabic content is required'),
  contentEn: z.string().trim().min(1, 'English content is required'),
  iconKey: iconKeySchema,
  displayOrder: displayOrderSchema,
  isActive: z.boolean().default(true),
});

export type CompanyProfileCreateInput = z.infer<typeof companyProfileCreateSchema>;

export const companyProfileUpdateSchema = companyProfileCreateSchema.partial();

export type CompanyProfileUpdateInput = z.infer<typeof companyProfileUpdateSchema>;

// ============================================================================
// company_partners schemas
// ============================================================================

export const companyPartnersCreateSchema = z.object({
  nameAr: z.string().trim().min(1, 'Arabic name is required').max(200),
  nameEn: z.string().trim().min(1, 'English name is required').max(200),
  logoKey: iconKeySchema,
  descriptionAr: z.string().trim().max(2000).optional().nullable(),
  descriptionEn: z.string().trim().max(2000).optional().nullable(),
  websiteUrl: z.string().url('Invalid URL format').optional().nullable(),
  displayOrder: displayOrderSchema,
});

export type CompanyPartnersCreateInput = z.infer<typeof companyPartnersCreateSchema>;

export const companyPartnersUpdateSchema = companyPartnersCreateSchema.partial();

export type CompanyPartnersUpdateInput = z.infer<typeof companyPartnersUpdateSchema>;

// ============================================================================
// company_clients schemas
// ============================================================================

export const companyClientsCreateSchema = z.object({
  nameAr: z.string().trim().min(1, 'Arabic name is required').max(200),
  nameEn: z.string().trim().min(1, 'English name is required').max(200),
  logoKey: iconKeySchema,
  descriptionAr: z.string().trim().max(2000).optional().nullable(),
  descriptionEn: z.string().trim().max(2000).optional().nullable(),
  displayOrder: displayOrderSchema,
});

export type CompanyClientsCreateInput = z.infer<typeof companyClientsCreateSchema>;

export const companyClientsUpdateSchema = companyClientsCreateSchema.partial();

export type CompanyClientsUpdateInput = z.infer<typeof companyClientsUpdateSchema>;

// ============================================================================
// company_resources schemas
// ============================================================================

const currencySchema = z.string().length(3, 'Currency must be ISO 3-letter code').default('SAR');

export const companyResourcesCreateSchema = z.object({
  titleAr: z.string().trim().min(1, 'Arabic title is required').max(200),
  titleEn: z.string().trim().min(1, 'English title is required').max(200),
  descriptionAr: z.string().trim().max(2000).optional().nullable(),
  descriptionEn: z.string().trim().max(2000).optional().nullable(),
  iconKey: iconKeySchema,
  value: z.number().nonnegative('Value must be non-negative').optional().nullable(),
  currency: currencySchema,
  displayOrder: displayOrderSchema,
});

export type CompanyResourcesCreateInput = z.infer<typeof companyResourcesCreateSchema>;

export const companyResourcesUpdateSchema = companyResourcesCreateSchema.partial();

export type CompanyResourcesUpdateInput = z.infer<typeof companyResourcesUpdateSchema>;

// ============================================================================
// company_strengths schemas
// ============================================================================

export const companyStrengthsCreateSchema = z.object({
  titleAr: z.string().trim().min(1, 'Arabic title is required').max(200),
  titleEn: z.string().trim().min(1, 'English title is required').max(200),
  descriptionAr: z.string().trim().max(2000).optional().nullable(),
  descriptionEn: z.string().trim().max(2000).optional().nullable(),
  iconKey: iconKeySchema,
  displayOrder: displayOrderSchema,
});

export type CompanyStrengthsCreateInput = z.infer<typeof companyStrengthsCreateSchema>;

export const companyStrengthsUpdateSchema = companyStrengthsCreateSchema.partial();

export type CompanyStrengthsUpdateInput = z.infer<typeof companyStrengthsUpdateSchema>;

// ============================================================================
// partnership_info schemas
// ============================================================================

const stepsArraySchema = z
  .array(z.string().trim().min(1).max(500))
  .optional()
  .nullable();

export const partnershipInfoCreateSchema = z.object({
  titleAr: z.string().trim().min(1, 'Arabic title is required').max(200),
  titleEn: z.string().trim().min(1, 'English title is required').max(200),
  contentAr: z.string().trim().min(1, 'Arabic content is required'),
  contentEn: z.string().trim().min(1, 'English content is required'),
  stepsAr: stepsArraySchema,
  stepsEn: stepsArraySchema,
  iconKey: iconKeySchema,
  displayOrder: displayOrderSchema,
});

export type PartnershipInfoCreateInput = z.infer<typeof partnershipInfoCreateSchema>;

export const partnershipInfoUpdateSchema = partnershipInfoCreateSchema.partial();

export type PartnershipInfoUpdateInput = z.infer<typeof partnershipInfoUpdateSchema>;

// ============================================================================
// market_value schemas
// ============================================================================

export const marketValueCreateSchema = z.object({
  value: z.number().positive('Value must be positive'),
  currency: currencySchema,
  valuationDate: z.string().date('Invalid date format'),
  source: z.string().trim().max(500).optional().nullable(),
  isVerified: z.boolean().default(false),
  verifiedAt: z.string().datetime({ offset: true }).optional().nullable(),
});

export type MarketValueCreateInput = z.infer<typeof marketValueCreateSchema>;

export const marketValueUpdateSchema = marketValueCreateSchema.partial();

export type MarketValueUpdateInput = z.infer<typeof marketValueUpdateSchema>;

// ============================================================================
// company_goals schemas
// ============================================================================

export const companyGoalsCreateSchema = z.object({
  titleAr: z.string().trim().min(1, 'Arabic title is required').max(200),
  titleEn: z.string().trim().min(1, 'English title is required').max(200),
  descriptionAr: z.string().trim().max(2000).optional().nullable(),
  descriptionEn: z.string().trim().max(2000).optional().nullable(),
  targetDate: dateSchema,
  iconKey: iconKeySchema,
  displayOrder: displayOrderSchema,
});

export type CompanyGoalsCreateInput = z.infer<typeof companyGoalsCreateSchema>;

export const companyGoalsUpdateSchema = companyGoalsCreateSchema.partial();

export type CompanyGoalsUpdateInput = z.infer<typeof companyGoalsUpdateSchema>;

// ============================================================================
// Presigned URL schemas for file uploads
// ============================================================================

const ALLOWED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'] as const;
const ALLOWED_LOGO_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'svg'] as const;

export const companyContentImagePresignSchema = z
  .object({
    fileName: z.string().trim().min(3).max(255),
    fileType: z.string().trim().min(3).max(150),
    fileSize: z.coerce
      .number()
      .int()
      .positive()
      .max(10 * 1024 * 1024, 'File size exceeds 10MB limit'),
    purpose: z.enum(['icon', 'logo']).default('icon'),
  })
  .refine(
    value => {
      const extension = value.fileName.split('.').pop()?.toLowerCase() ?? '';
      const allowedExtensions =
        value.purpose === 'logo' ? ALLOWED_LOGO_EXTENSIONS : ALLOWED_IMAGE_EXTENSIONS;
      return allowedExtensions.includes(extension as typeof allowedExtensions[number]);
    },
    {
      message: 'Unsupported image extension for the specified purpose',
      path: ['fileName'],
    }
  );

export type CompanyContentImagePresignInput = z.infer<
  typeof companyContentImagePresignSchema
>;

