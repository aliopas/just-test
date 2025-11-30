import { z } from 'zod';

const validCurrencies = ['SAR', 'USD', 'EUR'] as const;

export const createRequestSchema = z.object({
  type: z.enum(['buy', 'sell', 'partnership', 'board_nomination', 'feedback']),
  amount: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === '') return undefined;
      const num = typeof val === 'number' ? val : Number(val);
      return Number.isNaN(num) ? undefined : num;
    },
    z.number().positive('Amount must be greater than zero')
  ),
  currency: z.enum(validCurrencies),
  targetPrice: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === '') return undefined;
      const num = typeof val === 'number' ? val : Number(val);
      return Number.isNaN(num) ? undefined : num;
    },
    z.number().positive('Target price must be positive').optional()
  ),
  expiryAt: z
    .string()
    .optional()
    .refine(
      value =>
        !value ||
        (Number.isFinite(Date.parse(value)) &&
          new Date(value).getTime() >= new Date().setHours(0, 0, 0, 0)),
      'Expiry date must be today or in the future'
    ),
  notes: z
    .string()
    .max(500, 'Notes must be 500 characters or fewer')
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;

// Schema for request attachment presign
// Allow all image types and PDF

export const requestAttachmentPresignSchema = z
  .object({
    fileName: z
      .string()
      .trim()
      .min(3, 'File name must be at least 3 characters')
      .max(255, 'File name must be 255 characters or fewer')
      .regex(/\.[a-zA-Z0-9]+$/, 'File name must include an extension'),
    fileType: z
      .string()
      .trim()
      .refine(
        value => {
          // Allow all image types or PDF
          const isImage = value.startsWith('image/');
          const isPdf = value === 'application/pdf';
          return isImage || isPdf;
        },
        'Only images and PDF files are allowed'
      ),
    fileSize: z.coerce
      .number()
      .int()
      .positive('File size must be greater than zero')
      .max(25 * 1024 * 1024, 'File size must not exceed 25MB'),
  })
  .refine(
    value => {
      const extension = value.fileName.split('.').pop()?.toLowerCase() ?? '';
      // Allow common image extensions and PDF
      const allowedExtensions = [
        'pdf',
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'tiff', 'ico',
      ];
      return allowedExtensions.includes(extension);
    },
    {
      message: 'Only image files and PDF are allowed',
      path: ['fileName'],
    }
  );

export type RequestAttachmentPresignInput = z.infer<
  typeof requestAttachmentPresignSchema
>;

