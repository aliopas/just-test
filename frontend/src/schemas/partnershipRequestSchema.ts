import { z } from 'zod';

export const partnershipRequestSchema = z.object({
  type: z.literal('partnership'),
  companyName: z
    .string()
    .min(1, 'اسم الشركة مطلوب')
    .max(200, 'اسم الشركة يجب أن يكون 200 حرف أو أقل'),
  partnershipType: z.enum(['strategic', 'financial', 'technical', 'other']),
  investmentAmount: z.coerce
    .number()
    .positive('المبلغ يجب أن يكون أكبر من صفر')
    .min(1, 'المبلغ يجب أن يكون أكبر من صفر'),
  partnershipDetails: z
    .string()
    .min(1, 'تفاصيل الشراكة مطلوبة')
    .max(5000, 'تفاصيل الشراكة يجب أن تكون 5000 حرف أو أقل')
    .optional(),
  contactPerson: z
    .string()
    .min(1, 'اسم الشخص المسؤول مطلوب')
    .max(200, 'اسم الشخص المسؤول يجب أن يكون 200 حرف أو أقل'),
  contactEmail: z.string().email('البريد الإلكتروني غير صحيح'),
  contactPhone: z
    .string()
    .optional()
    .or(z.literal('')),
  documents: z.array(z.instanceof(File)).optional(),
});

export type PartnershipRequestFormValues = z.infer<typeof partnershipRequestSchema>;

