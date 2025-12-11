import { z } from 'zod';

const phoneRegex = /^\+[1-9]\d{1,14}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

export const adminUserListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  status: z.enum(['pending', 'active', 'suspended', 'deactivated']).optional(),
  role: z.string().trim().min(1).max(64).optional(),
  kycStatus: z
    .enum(['pending', 'in_review', 'approved', 'rejected'])
    .optional(),
  createdFrom: z
    .string()
    .optional()
    .refine(
      value => !value || !Number.isNaN(Date.parse(value)),
      'createdFrom must be a valid ISO date string'
    ),
  createdTo: z
    .string()
    .optional()
    .refine(
      value => !value || !Number.isNaN(Date.parse(value)),
      'createdTo must be a valid ISO date string'
    ),
  search: z.string().trim().min(1).max(100).optional(),
  sortBy: z.enum(['created_at', 'email', 'status']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type AdminUserListQuery = z.infer<typeof adminUserListQuerySchema>;

export const adminUserStatusSchema = z.object({
  status: z.enum(['active', 'pending', 'suspended', 'deactivated']),
  reason: z
    .string()
    .trim()
    .max(250, 'Reason must be 250 characters or fewer')
    .optional(),
});

export const adminUserResetSchema = z
  .object({
    sendEmail: z.boolean().default(true),
  })
  .default({ sendEmail: true });

const investorProfileInputSchema = z
  .object({
    language: z.enum(['ar', 'en']).optional(),
    idType: z.enum(['national_id', 'iqama', 'passport', 'other']).optional(),
    idNumber: z
      .string()
      .trim()
      .max(50, 'ID number must be 50 characters or fewer')
      .optional(),
    nationality: z
      .string()
      .trim()
      .length(2, 'Nationality must be ISO alpha-2')
      .optional(),
    residencyCountry: z
      .string()
      .trim()
      .length(2, 'Residency country must be ISO alpha-2')
      .optional(),
    city: z
      .string()
      .trim()
      .max(120, 'City must be 120 characters or fewer')
      .optional(),
    kycStatus: z
      .enum(['pending', 'in_review', 'approved', 'rejected'])
      .optional(),
    riskProfile: z
      .enum(['conservative', 'balanced', 'aggressive'])
      .optional()
      .nullable(),
  })
  .optional();

export const adminCreateUserSchema = z
  .object({
    email: z.string().email('Invalid email format'),
    phone: z
      .string()
      .regex(phoneRegex, 'Phone must be in E.164 format (e.g., +9665xxxxxxx)')
      .optional()
      .nullable(),
    fullName: z
      .string()
      .trim()
      .min(3, 'Full name must be at least 3 characters')
      .max(150, 'Full name must be 150 characters or fewer')
      .optional()
      .nullable(),
    role: z
      .string()
      .trim()
      .min(2, 'Role must be at least 2 characters')
      .max(64)
      .default('investor'),
    status: z
      .enum(['pending', 'active', 'suspended', 'deactivated'])
      .default('pending'),
    locale: z.enum(['ar', 'en']).default('ar'),
    sendInvite: z.boolean().default(true),
    temporaryPassword: z
      .string()
      .regex(
        passwordRegex,
        'Password must contain uppercase, lowercase, and a number'
      )
      .optional(),
    investorProfile: investorProfileInputSchema,
  })
  .superRefine((data, ctx) => {
    if (!data.sendInvite && !data.temporaryPassword) {
      ctx.addIssue({
        path: ['temporaryPassword'],
        code: z.ZodIssueCode.custom,
        message: 'temporaryPassword is required when sendInvite is false',
      });
    }
  });

export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;

export const adminUpdateUserSchema = z
  .object({
    email: z.string().email('Invalid email format').optional(),
    phone: z
      .string()
      .regex(phoneRegex, 'Phone must be in E.164 format (e.g., +9665xxxxxxx)')
      .optional()
      .nullable(),
    fullName: z
      .string()
      .trim()
      .min(3, 'Full name must be at least 3 characters')
      .max(150, 'Full name must be 150 characters or fewer')
      .optional()
      .nullable(),
    role: z
      .string()
      .trim()
      .min(2, 'Role must be at least 2 characters')
      .max(64)
      .optional(),
    status: z
      .enum(['pending', 'active', 'suspended', 'deactivated'])
      .optional(),
    locale: z.enum(['ar', 'en']).optional(),
    investorProfile: investorProfileInputSchema,
  })
  .refine(
    data => Object.keys(data).length > 0,
    'At least one field must be provided for update'
  );

export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
