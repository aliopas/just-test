import { z } from 'zod';

export const boardNominationRequestSchema = z.object({
  type: z.literal('board_nomination'),
  nomineeName: z
    .string()
    .min(1, 'اسم المرشح مطلوب')
    .max(200, 'اسم المرشح يجب أن يكون 200 حرف أو أقل'),
  nomineePosition: z
    .string()
    .min(1, 'المنصب المقترح مطلوب')
    .max(200, 'المنصب المقترح يجب أن يكون 200 حرف أو أقل'),
  nomineeQualifications: z
    .string()
    .min(1, 'المؤهلات مطلوبة')
    .max(5000, 'المؤهلات يجب أن تكون 5000 حرف أو أقل')
    .optional(),
  nominationReason: z
    .string()
    .min(1, 'سبب الترشيح مطلوب')
    .max(5000, 'سبب الترشيح يجب أن يكون 5000 حرف أو أقل')
    .optional(),
  nomineeEmail: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  nomineePhone: z
    .string()
    .optional()
    .or(z.literal('')),
  documents: z.array(z.instanceof(File)).optional(),
});

export type BoardNominationRequestFormValues = z.infer<typeof boardNominationRequestSchema>;

