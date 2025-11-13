import { z } from 'zod';

export const NEWS_STATUSES = [
  'draft',
  'pending_review',
  'scheduled',
  'published',
  'rejected',
  'archived',
] as const;

export const newsStatusEnum = z.enum(NEWS_STATUSES);

export const NEWS_AUDIENCES = ['public', 'investor_internal'] as const;
export const newsAudienceEnum = z.enum(NEWS_AUDIENCES);

export const NEWS_ATTACHMENT_TYPES = ['document', 'image'] as const;
const newsAttachmentTypeEnum = z.enum(NEWS_ATTACHMENT_TYPES);

export const newsAttachmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(255),
  storageKey: z.string().trim().min(3).max(600),
  mimeType: z.string().trim().max(150).optional().nullable(),
  size: z.coerce.number().nonnegative().optional().nullable(),
  type: newsAttachmentTypeEnum.optional().default('document'),
});

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
    audience: newsAudienceEnum.optional().default('public'),
    attachments: z.array(newsAttachmentSchema).optional().default([]),
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
    audience: newsAudienceEnum.optional(),
    attachments: z.array(newsAttachmentSchema).optional(),
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
  audience: newsAudienceEnum.optional(),
});

export const newsImagePresignSchema = z
  .object({
    fileName: z
      .string()
      .trim()
      .min(3)
      .max(255)
      .regex(/\.[a-zA-Z0-9]+$/, 'fileName must include an extension'),
    fileType: z
      .string()
      .trim()
      .regex(/^image\/[a-z0-9.+-]+$/i, 'Only image MIME types are allowed'),
    fileSize: z.coerce
      .number()
      .int()
      .positive()
      .max(10 * 1024 * 1024, 'File size exceeds 10MB limit'),
    variant: z.enum(['cover', 'inline']).optional().default('cover'),
  })
  .refine(
    value => {
      const extension = value.fileName.split('.').pop()?.toLowerCase() ?? '';
      return ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'].includes(extension);
    },
    {
      message: 'Unsupported image extension',
      path: ['fileName'],
    }
  );

export type NewsCreateInput = z.infer<typeof newsCreateSchema>;
export type NewsUpdateInput = z.infer<typeof newsUpdateSchema>;
export type NewsListQuery = z.infer<typeof newsListQuerySchema>;
export type NewsStatus = z.infer<typeof newsStatusEnum>;
export type NewsImagePresignInput = z.infer<typeof newsImagePresignSchema>;
export type NewsAudience = z.infer<typeof newsAudienceEnum>;
export type NewsAttachment = z.infer<typeof newsAttachmentSchema>;

const ALLOWED_ATTACHMENT_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'csv',
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'bmp',
  'txt',
  'rtf',
  'zip',
] as const;

export const newsAttachmentPresignSchema = z
  .object({
    fileName: z.string().trim().min(3).max(255),
    fileType: z.string().trim().min(3).max(150),
    fileSize: z.coerce
      .number()
      .int()
      .positive()
      .max(25 * 1024 * 1024, 'File size exceeds 25MB limit'),
  })
  .refine(
    value => {
      const extension = value.fileName.split('.').pop()?.toLowerCase() ?? '';
      return ALLOWED_ATTACHMENT_EXTENSIONS.includes(extension as typeof ALLOWED_ATTACHMENT_EXTENSIONS[number]);
    },
    {
      message: 'Unsupported attachment extension',
      path: ['fileName'],
    }
  );

export type NewsAttachmentPresignInput = z.infer<typeof newsAttachmentPresignSchema>;

export const newsApproveSchema = z.object({
  comment: z
    .string()
    .trim()
    .max(2000, 'Comment must be 2000 characters or less')
    .optional(),
});

export type NewsApproveInput = z.infer<typeof newsApproveSchema>;

export const newsRejectSchema = z.object({
  comment: z
    .string()
    .trim()
    .min(3, 'Comment is required when rejecting news')
    .max(2000, 'Comment must be 2000 characters or less'),
});

export type NewsRejectInput = z.infer<typeof newsRejectSchema>;

export const newsPublishSchema = z
  .object({
    publishedAt: timestampSchema.optional(),
  })
  .superRefine((val, ctx) => {
    if (val.publishedAt) {
      const parsed = Date.parse(val.publishedAt);
      if (Number.isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'publishedAt must be a valid ISO timestamp',
          path: ['publishedAt'],
        });
      } else if (parsed > Date.now()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'publishedAt cannot be in the future',
          path: ['publishedAt'],
        });
      }
    }
  });

export type NewsPublishInput = z.infer<typeof newsPublishSchema>;
