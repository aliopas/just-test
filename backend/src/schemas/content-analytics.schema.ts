import { z } from 'zod';

export const contentAnalyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(180).optional(),
  limitTop: z.coerce.number().int().min(1).max(20).optional(),
});

export type ContentAnalyticsQuery = z.infer<typeof contentAnalyticsQuerySchema>;
