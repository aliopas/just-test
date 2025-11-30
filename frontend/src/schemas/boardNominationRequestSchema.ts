import { z } from 'zod';

export const boardNominationRequestSchema = z.object({
  type: z.literal('board_nomination'),
  nomineeName: z
    .string()
    .min(2, 'اسم المرشح يجب أن يكون على الأقل حرفين')
    .max(100, 'اسم المرشح يجب أن يكون 100 حرف أو أقل'),
  nomineePosition: z
    .string()
    .min(2, 'المنصب المقترح يجب أن يكون على الأقل حرفين')
    .max(100, 'المنصب المقترح يجب أن يكون 100 حرف أو أقل'),
  nomineeQualifications: z
    .string()
    .min(20, 'المؤهلات يجب أن تكون على الأقل 20 حرف')
    .max(2000, 'المؤهلات يجب أن تكون 2000 حرف أو أقل'),
  nominationReason: z
    .string()
    .min(20, 'سبب الترشيح يجب أن يكون على الأقل 20 حرف')
    .max(1000, 'سبب الترشيح يجب أن يكون 1000 حرف أو أقل'),
  nomineeEmail: z.string().email('البريد الإلكتروني غير صحيح').optional(),
  nomineePhone: z
    .string()
    .regex(/^\+966[0-9]{9}$/, 'رقم الهاتف يجب أن يكون بصيغة +966xxxxxxxxx')
    .optional(),
  documents: z.array(z.instanceof(File)).optional(),
});

export type BoardNominationRequestFormValues = z.infer<typeof boardNominationRequestSchema>;

