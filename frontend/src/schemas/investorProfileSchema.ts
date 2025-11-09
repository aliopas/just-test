import { z } from 'zod';

export const isoCountrySchema = z
  .string()
  .length(2, 'ÙŠØ¬Ø¨ Ø¥Ø¯Ø®Ø§Ù„ Ø±Ù…Ø² Ø¯ÙˆÙ„Ø© Ù…ÙƒÙˆÙ‘Ù† Ù…Ù† Ø­Ø±ÙÙŠÙ†')
  .transform(value => value.toUpperCase());

export const investorProfileFormSchema = z.object({
  fullName: z
    .string()
    .min(3, 'ÙŠØ¬Ø¨ Ø£Ù† ÙŠÙƒÙˆÙ† Ø§Ù„Ø§Ø³Ù… 3 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„')
    .max(150, 'ÙŠØ¬Ø¨ Ø£Ù„Ø§ ÙŠØªØ¬Ø§ÙˆØ² Ø§Ù„Ø§Ø³Ù… 150 Ø­Ø±ÙØ§Ù‹')
    .optional()
    .nullable(),
  preferredName: z
    .string()
    .min(2, 'ÙŠØ¬Ø¨ Ø£Ù† ÙŠÙƒÙˆÙ† Ø§Ù„Ø§Ø³Ù… Ø§Ù„Ù…ÙØ¶Ù„ Ø­Ø±ÙÙŠÙ† Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„')
    .max(100, 'ÙŠØ¬Ø¨ Ø£Ù„Ø§ ÙŠØªØ¬Ø§ÙˆØ² Ø§Ù„Ø§Ø³Ù… Ø§Ù„Ù…ÙØ¶Ù„ 100 Ø­Ø±Ù')
    .optional()
    .nullable(),
  language: z.enum(['ar', 'en']),
  idType: z
    .enum(['national_id', 'iqama', 'passport', 'other'])
    .optional()
    .nullable(),
  idNumber: z
    .string()
    .min(4, 'Ø±Ù‚Ù… Ø§Ù„Ù‡ÙˆÙŠØ© ÙŠØ¬Ø¨ Ø£Ù† ÙŠÙƒÙˆÙ† 4 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„')
    .max(50, 'Ø±Ù‚Ù… Ø§Ù„Ù‡ÙˆÙŠØ© ÙŠØ¬Ø¨ Ø£Ù„Ø§ ÙŠØªØ¬Ø§ÙˆØ² 50 Ø­Ø±ÙØ§Ù‹')
    .optional()
    .nullable(),
  idExpiry: z
    .string()
    .optional()
    .nullable()
    .refine(
      value => !value || !Number.isNaN(Date.parse(value)),
      'ØµÙŠØºØ© Ø§Ù„ØªØ§Ø±ÙŠØ® ØºÙŠØ± ØµØ­ÙŠØ­Ø©'
    ),
  nationality: isoCountrySchema.optional().nullable(),
  residencyCountry: isoCountrySchema.optional().nullable(),
  city: z
    .string()
    .min(2, 'Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© ÙŠØ¬Ø¨ Ø£Ù† ØªÙƒÙˆÙ† Ø­Ø±ÙÙŠÙ† Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„')
    .max(120, 'Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© ÙŠØ¬Ø¨ Ø£Ù„Ø§ ØªØªØ¬Ø§ÙˆØ² 120 Ø­Ø±ÙØ§Ù‹')
    .optional()
    .nullable(),
  kycStatus: z
    .enum(['pending', 'in_review', 'approved', 'rejected'])
    .optional(),
  riskProfile: z
    .enum(['conservative', 'balanced', 'aggressive'])
    .optional()
    .nullable(),
  communicationPreferences: z
    .object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      push: z.boolean().optional(),
    })
    .refine(
      value => Object.values(value).some(Boolean),
      'Ø­Ø¯Ø¯ Ù‚Ù†Ø§Ø© ØªÙˆØ§ØµÙ„ ÙˆØ§Ø­Ø¯Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„'
    ),
  kycDocuments: z.array(z.string()).optional().nullable(),
});

export type InvestorProfileFormValues = z.infer<
  typeof investorProfileFormSchema
>;



