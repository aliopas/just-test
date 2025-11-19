import { z } from 'zod';

const isoCountryRegex = /^[A-Za-z]{2}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const isoCountrySchema = z
  .string()
  .regex(isoCountryRegex, 'Must be a valid ISO-3166 alpha-2 code')
  .transform(value => value.toUpperCase());

const nullableIsoCountrySchema = isoCountrySchema.nullable().optional();

const communicationPreferencesSchema = z
  .object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    push: z.boolean().optional(),
  })
  .refine(
    value => Object.keys(value).length > 0,
    'communicationPreferences must include at least one channel'
  );

const dateStringSchema = z
  .string()
  .regex(dateRegex, 'Date must be in YYYY-MM-DD format')
  .refine(value => !Number.isNaN(Date.parse(value)), 'Invalid date')
  .transform(value => value);

const nullableDateSchema = dateStringSchema.nullable().optional();

export const investorProfileUpdateSchema = z
  .object({
    email: z
      .string()
      .email('Email must be a valid email address')
      .optional()
      .nullable(),
    phone: z
      .string()
      .min(8, 'Phone number must be at least 8 characters')
      .max(20, 'Phone number must be less than 20 characters')
      .optional()
      .nullable(),
    fullName: z
      .string()
      .min(3, 'Full name must be at least 3 characters')
      .max(150, 'Full name must be less than 150 characters')
      .optional()
      .nullable(),
    preferredName: z
      .string()
      .min(2, 'Preferred name must be at least 2 characters')
      .max(100, 'Preferred name must be less than 100 characters')
      .optional()
      .nullable(),
    idType: z
      .enum(['national_id', 'iqama', 'passport', 'other'])
      .optional()
      .nullable(),
    idNumber: z
      .string()
      .min(4, 'ID number must be at least 4 characters')
      .max(50, 'ID number must be less than 50 characters')
      .optional()
      .nullable(),
    idExpiry: nullableDateSchema,
    nationality: nullableIsoCountrySchema,
    residencyCountry: nullableIsoCountrySchema,
    city: z
      .string()
      .min(2, 'City must be at least 2 characters')
      .max(120, 'City must be less than 120 characters')
      .optional()
      .nullable(),
    kycStatus: z
      .enum(['pending', 'in_review', 'approved', 'rejected'])
      .optional(),
    language: z.enum(['ar', 'en']).optional(),
    communicationPreferences: communicationPreferencesSchema.optional(),
    riskProfile: z
      .enum(['conservative', 'balanced', 'aggressive'])
      .optional()
      .nullable(),
    kycDocuments: z.array(z.string().min(1)).max(20).optional().nullable(),
  })
  .refine(data => Object.values(data).some(value => value !== undefined), {
    message: 'At least one field must be provided',
    path: [],
  });

export type InvestorProfileUpdateInput = z.infer<
  typeof investorProfileUpdateSchema
>;
