import { z } from 'zod';

export const feedbackRequestSchema = z.object({
  type: z.literal('feedback'),
  feedbackType: z.enum(['suggestion', 'complaint', 'question', 'other']),
  subject: z
    .string()
    .min(1, 'الموضوع مطلوب')
    .max(500, 'الموضوع يجب أن يكون 500 حرف أو أقل'),
  message: z
    .string()
    .min(1, 'الرسالة مطلوبة')
    .max(5000, 'الرسالة يجب أن تكون 5000 حرف أو أقل'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  documents: z.array(z.instanceof(File)).optional(),
});

export type FeedbackRequestFormValues = z.infer<typeof feedbackRequestSchema>;

