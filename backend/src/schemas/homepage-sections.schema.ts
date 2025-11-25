import { z } from 'zod';

export const homepageSectionTypeSchema = z.enum([
  'company_profile',
  'business_model',
  'financial_resources',
  'company_strengths',
  'become_partner',
  'market_value',
  'company_goals',
]);

export type HomepageSectionType = z.infer<typeof homepageSectionTypeSchema>;

export const homepageSectionCreateSchema = z.object({
  type: homepageSectionTypeSchema,
  titleAr: z.string().min(1, 'Arabic title is required'),
  titleEn: z.string().min(1, 'English title is required'),
  contentAr: z.string().min(1, 'Arabic content is required'),
  contentEn: z.string().min(1, 'English content is required'),
  iconSvg: z.string().optional().nullable(),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type HomepageSectionCreateInput = z.infer<
  typeof homepageSectionCreateSchema
>;

export const homepageSectionUpdateSchema = homepageSectionCreateSchema
  .partial()
  .extend({
    type: homepageSectionTypeSchema.optional(),
  });

export type HomepageSectionUpdateInput = z.infer<
  typeof homepageSectionUpdateSchema
>;
