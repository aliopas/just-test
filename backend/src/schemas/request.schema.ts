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
