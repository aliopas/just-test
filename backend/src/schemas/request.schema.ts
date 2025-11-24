import { z } from 'zod';

const validCurrencies = ['SAR', 'USD', 'EUR'] as const;

export const createRequestSchema = z.object({
  type: z.enum(['buy', 'sell']),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  currency: z.enum(validCurrencies).default('SAR'),
  targetPrice: z.number().positive('Target price must be positive').optional(),
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
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;

// Schema for request attachment presign
const ALLOWED_ATTACHMENT_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'] as const;
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
] as const;

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
        value => ALLOWED_MIME_TYPES.includes(value as typeof ALLOWED_MIME_TYPES[number]),
        'Only PDF, JPG, or PNG files are allowed'
      ),
    fileSize: z.coerce
      .number()
      .int()
      .positive('File size must be greater than zero')
      .max(10 * 1024 * 1024, 'File size must not exceed 10MB'),
  })
  .refine(
    value => {
      const extension = value.fileName.split('.').pop()?.toLowerCase() ?? '';
      return ALLOWED_ATTACHMENT_EXTENSIONS.includes(
        extension as typeof ALLOWED_ATTACHMENT_EXTENSIONS[number]
      );
    },
    {
      message: 'Only PDF, JPG, JPEG, or PNG file extensions are allowed',
      path: ['fileName'],
    }
  );

export type RequestAttachmentPresignInput = z.infer<
  typeof requestAttachmentPresignSchema
>;

// Schema for partnership request
export const createPartnershipRequestSchema = z.object({
  projectId: z.string().uuid('Invalid project ID format').optional(),
  proposedAmount: z.coerce
    .number()
    .positive('Proposed amount must be greater than zero')
    .optional(),
  partnershipPlan: z
    .string()
    .trim()
    .min(50, 'Partnership plan must be at least 50 characters')
    .max(5000, 'Partnership plan must be 5000 characters or fewer'),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or fewer')
    .optional(),
});

export type CreatePartnershipRequestInput = z.infer<
  typeof createPartnershipRequestSchema
>;

// Schema for board nomination request
export const createBoardNominationRequestSchema = z.object({
  cvSummary: z
    .string()
    .trim()
    .min(100, 'CV summary must be at least 100 characters')
    .max(2000, 'CV summary must be 2000 characters or fewer'),
  experience: z
    .string()
    .trim()
    .min(100, 'Experience must be at least 100 characters')
    .max(3000, 'Experience must be 3000 characters or fewer'),
  motivations: z
    .string()
    .trim()
    .min(100, 'Motivations must be at least 100 characters')
    .max(2000, 'Motivations must be 2000 characters or fewer'),
  qualifications: z
    .string()
    .trim()
    .min(50, 'Qualifications must be at least 50 characters')
    .max(2000, 'Qualifications must be 2000 characters or fewer'),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or fewer')
    .optional(),
});

export type CreateBoardNominationRequestInput = z.infer<
  typeof createBoardNominationRequestSchema
>;

// Schema for feedback request
export const createFeedbackRequestSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be 200 characters or fewer'),
  category: z.enum(['suggestion', 'complaint', 'question', 'other'], {
    errorMap: () => ({ message: 'Category must be suggestion, complaint, question, or other' }),
  }),
  description: z
    .string()
    .trim()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description must be 5000 characters or fewer'),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Priority must be low, medium, or high' }),
  }),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or fewer')
    .optional(),
});

export type CreateFeedbackRequestInput = z.infer<
  typeof createFeedbackRequestSchema
>;