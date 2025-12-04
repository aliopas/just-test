import { z } from 'zod';

const phoneRegex = /^\+[1-9]\d{7,14}$/;

export const investorSignupRequestSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  fullName: z
    .string()
    .min(3, 'Full name must be at least 3 characters')
    .max(150, 'Full name must be 150 characters or fewer'),
  phone: z
    .string()
    .regex(
      phoneRegex,
      'Phone must be in international format, e.g. +9665xxxxxxx'
    )
    .optional()
    .or(z.literal(''))
    .transform(value => (value === '' ? undefined : value)),
  company: z
    .string()
    .max(150, 'Company name must be 150 characters or fewer')
    .optional()
    .or(z.literal(''))
    .transform(value => (value === '' ? undefined : value)),
  message: z
    .string()
    .max(1000, 'Message must be 1000 characters or fewer')
    .optional()
    .or(z.literal(''))
    .transform(value => (value === '' ? undefined : value)),
  language: z.enum(['ar', 'en']).default('ar'),
});

export type InvestorSignupRequestInput = z.infer<
  typeof investorSignupRequestSchema
>;

export const investorSignupDecisionSchema = z.object({
  note: z
    .string()
    .max(500, 'Decision note must be 500 characters or fewer')
    .optional()
    .or(z.literal(''))
    .transform(value => (value === '' ? undefined : value)),
  sendInvite: z.boolean().default(true),
  locale: z.enum(['ar', 'en']).default('ar'),
});

export type InvestorSignupDecisionInput = z.infer<
  typeof investorSignupDecisionSchema
>;
