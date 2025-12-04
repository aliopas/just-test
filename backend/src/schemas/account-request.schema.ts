import { z } from 'zod';

const phoneRegex = /^\+[1-9]\d{7,14}$/;
// Saudi local phone format (05XXXXXXXX)
const saudiLocalPhoneRegex = /^05\d{8}$/;

// Helper function to normalize phone number
function normalizePhone(phone: string | undefined): string | undefined {
  if (!phone || phone.trim() === '') {
    return undefined;
  }
  
  const trimmed = phone.trim();
  
  // If already in international format, return as is
  if (phoneRegex.test(trimmed)) {
    return trimmed;
  }
  
  // If Saudi local format (05XXXXXXXX), convert to international
  if (saudiLocalPhoneRegex.test(trimmed)) {
    return `+966${trimmed.substring(1)}`;
  }
  
  // If starts with 966 but missing +, add it
  if (trimmed.startsWith('966') && trimmed.length >= 12) {
    return `+${trimmed}`;
  }
  
  // If starts with 0 and has 9 digits after, assume Saudi local
  if (trimmed.startsWith('0') && trimmed.length === 10) {
    return `+966${trimmed.substring(1)}`;
  }
  
  // Return as is if it doesn't match any pattern (will fail validation)
  return trimmed;
}

export const investorSignupRequestSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  fullName: z
    .string()
    .min(3, 'Full name must be at least 3 characters')
    .max(150, 'Full name must be 150 characters or fewer'),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform(value => (value === '' ? undefined : value))
    .refine(
      (value) => {
        if (!value) return true; // Optional field
        const normalized = normalizePhone(value);
        return normalized ? phoneRegex.test(normalized) : false;
      },
      {
        message: 'Phone must be in international format (e.g. +9665xxxxxxx) or Saudi local format (05XXXXXXXX)',
      }
    )
    .transform((value) => normalizePhone(value)),
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
