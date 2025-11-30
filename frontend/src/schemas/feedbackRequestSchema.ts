import { z } from 'zod';

export const feedbackRequestSchema = z.object({
  type: z.literal('feedback'),
  feedbackType: z.enum(['suggestion', 'complaint', 'question', 'other'], {
    errorMap: () => ({ message: 'يجب اختيار نوع الملاحظة' }),
  }),
  subject: z
    .string()
    .min(5, 'الموضوع يجب أن يكون على الأقل 5 أحرف')
    .max(200, 'الموضوع يجب أن يكون 200 حرف أو أقل'),
  message: z
    .string()
    .min(20, 'الرسالة يجب أن تكون على الأقل 20 حرف')
    .max(2000, 'الرسالة يجب أن تكون 2000 حرف أو أقل'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  documents: z.array(z.instanceof(File)).optional(),
});

export type FeedbackRequestFormValues = z.infer<typeof feedbackRequestSchema>;

