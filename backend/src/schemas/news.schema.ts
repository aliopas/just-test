import { z } from 'zod';

export const newsStatusEnum = z.enum(['draft', 'scheduled', 'published']);

const slugSchema = z
  .string()
  .trim()
  .min(3)
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug may only contain lowercase letters, numbers, and hyphens'
  );

const timestampSchema = z.string().datetime({ offset: true });

export const newsCreateSchema = z
  .object({
    title: z.string().trim().min(3).max(200),
    slug: slugSchema,
    bodyMd: z.string().trim().min(1),
    coverKey: z.string().trim().max(255).optional().nullable(),
    categoryId: z.string().uuid().optional().nullable(),
    status: newsStatusEnum.optional(),
    scheduledAt: timestampSchema.optional().nullable(),
    publishedAt: timestampSchema.optional().nullable(),
  })
  .superRefine((val, ctx) => {
    const status = val.status ?? 'draft';

    if (status === 'scheduled' && !val.scheduledAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'scheduledAt is required when status is scheduled',
        path: ['scheduledAt'],
      });
    }

    if (status === 'published' && !val.publishedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'publishedAt is required when status is published',
        path: ['publishedAt'],
      });
    }
  });

export const newsUpdateSchema = z
  .object({
    title: z.string().trim().min(3).max(200).optional(),
    slug: slugSchema.optional(),
    bodyMd: z.string().trim().min(1).optional(),
    coverKey: z.string().trim().max(255).optional().nullable(),
    categoryId: z.string().uuid().optional().nullable(),
    status: newsStatusEnum.optional(),
    scheduledAt: timestampSchema.optional().nullable(),
    publishedAt: timestampSchema.optional().nullable(),
  })
  .superRefine((val, ctx) => {
    if (val.status === 'scheduled' && !val.scheduledAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'scheduledAt is required when status is scheduled',
        path: ['scheduledAt'],
      });
    }

    if (val.status === 'published' && !val.publishedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'publishedAt is required when status is published',
        path: ['publishedAt'],
      });
    }
  })
  .refine(
    data => Object.keys(data).length > 0,
    'At least one field must be provided for update'
  );

export const newsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: newsStatusEnum.optional(),
  search: z.string().trim().max(200).optional(),
  categoryId: z.string().uuid().optional(),
  sortBy: z.enum(['created_at', 'published_at', 'scheduled_at']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type NewsCreateInput = z.infer<typeof newsCreateSchema>;
export type NewsUpdateInput = z.infer<typeof newsUpdateSchema>;
export type NewsListQuery = z.infer<typeof newsListQuerySchema>;
export type NewsStatus = z.infer<typeof newsStatusEnum>;
