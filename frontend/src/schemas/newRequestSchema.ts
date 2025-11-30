import { z } from 'zod';

const SHARE_PRICE = 50000; // قيمة السهم الواحد بالريال السعودي

export const newRequestFormSchema = z.object({
  type: z.enum(['buy', 'sell', 'partnership', 'board_nomination', 'feedback']),
  numberOfShares: z.coerce
    .number()
    .int('عدد الأسهم يجب أن يكون رقماً صحيحاً')
    .positive('عدد الأسهم يجب أن يكون أكبر من صفر')
    .min(1, 'الحد الأدنى سهم واحد'),
  notes: z
    .string()
    .max(500, 'notes must be 500 characters or fewer')
    .optional(),
  documents: z.array(z.instanceof(File)).optional(),
});

// Helper function to calculate total amount
export function calculateTotalAmount(numberOfShares: number): number {
  return numberOfShares * SHARE_PRICE;
}

export { SHARE_PRICE };

export type NewRequestFormValues = z.infer<typeof newRequestFormSchema>;


