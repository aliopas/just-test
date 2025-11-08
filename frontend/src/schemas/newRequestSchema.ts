import { z } from 'zod';

const currencyOptions = ['SAR', 'USD', 'EUR'] as const;

export const newRequestFormSchema = z.object({
  type: z.enum(['buy', 'sell']),
  amount: z.coerce
    .number()
    .positive('amount must be greater than zero'),
  currency: z.enum(currencyOptions).default('SAR'),
  targetPrice: z
    .union([z.coerce.number().positive().optional(), z.literal('')])
    .transform(value => (value === '' ? undefined : value))
    .optional(),
  expiryAt: z
    .string()
    .optional()
    .refine(
      value =>
        !value ||
        (Number.isFinite(Date.parse(value)) &&
          new Date(value).setHours(0, 0, 0, 0) >=
            new Date().setHours(0, 0, 0, 0)),
      'expiry date must be today or later'
    ),
  notes: z
    .string()
    .max(500, 'notes must be 500 characters or fewer')
    .optional(),
  documents: z.array(z.instanceof(File)).optional(),
});

export type NewRequestFormValues = z.infer<typeof newRequestFormSchema>;

