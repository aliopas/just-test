import { z } from 'zod';

export const isoCountrySchema = z
  .string()
  .length(2, 'يجب إدخال رمز دولة مكوّن من حرفين')
  .transform(value => value.toUpperCase());

export const investorProfileFormSchema = z.object({
  fullName: z
    .string()
    .min(3, 'يجب أن يكون الاسم 3 أحرف على الأقل')
    .max(150, 'يجب ألا يتجاوز الاسم 150 حرفاً')
    .optional()
    .nullable(),
  preferredName: z
    .string()
    .min(2, 'يجب أن يكون الاسم المفضل حرفين على الأقل')
    .max(100, 'يجب ألا يتجاوز الاسم المفضل 100 حرف')
    .optional()
    .nullable(),
  language: z.enum(['ar', 'en']),
  idType: z
    .enum(['national_id', 'iqama', 'passport', 'other'])
    .optional()
    .nullable(),
  idNumber: z
    .string()
    .min(4, 'رقم الهوية يجب أن يكون 4 أحرف على الأقل')
    .max(50, 'رقم الهوية يجب ألا يتجاوز 50 حرفاً')
    .optional()
    .nullable(),
  idExpiry: z
    .string()
    .optional()
    .nullable()
    .refine(
      value => !value || !Number.isNaN(Date.parse(value)),
      'صيغة التاريخ غير صحيحة'
    ),
  nationality: isoCountrySchema.optional().nullable(),
  residencyCountry: isoCountrySchema.optional().nullable(),
  city: z
    .string()
    .min(2, 'المدينة يجب أن تكون حرفين على الأقل')
    .max(120, 'المدينة يجب ألا تتجاوز 120 حرفاً')
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
      'حدد قناة تواصل واحدة على الأقل'
    ),
  kycDocuments: z.array(z.string()).optional().nullable(),
});

export type InvestorProfileFormValues = z.infer<
  typeof investorProfileFormSchema
>;


