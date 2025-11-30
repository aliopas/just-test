import { z } from 'zod';

export const partnershipRequestSchema = z.object({
  type: z.literal('partnership'),
  companyName: z
    .string()
    .min(2, 'اسم الشركة يجب أن يكون على الأقل حرفين')
    .max(100, 'اسم الشركة يجب أن يكون 100 حرف أو أقل'),
  partnershipType: z.enum(['strategic', 'financial', 'technical', 'other']),
  investmentAmount: z.coerce
    .number()
    .positive('المبلغ يجب أن يكون أكبر من صفر')
    .min(1000, 'الحد الأدنى للمبلغ هو 1000 ريال'),
  partnershipDetails: z
    .string()
    .min(10, 'تفاصيل الشراكة يجب أن تكون على الأقل 10 أحرف')
    .max(1000, 'تفاصيل الشراكة يجب أن تكون 1000 حرف أو أقل'),
  contactPerson: z
    .string()
    .min(2, 'اسم الشخص المسؤول يجب أن يكون على الأقل حرفين')
    .max(100, 'اسم الشخص المسؤول يجب أن يكون 100 حرف أو أقل'),
  contactEmail: z.string().email('البريد الإلكتروني غير صحيح'),
  contactPhone: z
    .string()
    .regex(/^\+966[0-9]{9}$/, 'رقم الهاتف يجب أن يكون بصيغة +966xxxxxxxxx')
    .optional(),
  documents: z.array(z.instanceof(File)).optional(),
});

export type PartnershipRequestFormValues = z.infer<typeof partnershipRequestSchema>;

