import { z } from 'zod';

export const publicNewsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type PublicNewsListQuery = z.infer<typeof publicNewsListQuerySchema>;
