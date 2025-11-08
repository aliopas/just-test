import { z } from 'zod';

// Phone validation: E.164 format (optional)
const phoneRegex = /^\+[1-9]\d{1,14}$/;

// Password validation: 8+ chars, uppercase, lowercase, number, optional symbol
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

export const registerSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  phone: z
    .string()
    .regex(phoneRegex, 'Phone must be in E.164 format (e.g., +9665xxxxxxx)')
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;

export const resendOTPSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
});

export type ResendOTPInput = z.infer<typeof resendOTPSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  totpToken: z
    .string()
    .length(6, 'TOTP token must be 6 digits')
    .regex(/^\d{6}$/, 'TOTP token must contain only digits')
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refresh_token: z.string().min(10, 'refresh_token is required').optional(),
});

export type RefreshInput = z.infer<typeof refreshSchema>;

export const totpVerifySchema = z.object({
  token: z
    .string()
    .length(6, 'TOTP token must be 6 digits')
    .regex(/^\d{6}$/, 'TOTP token must contain only digits'),
});

export type TOTPVerifyInput = z.infer<typeof totpVerifySchema>;
