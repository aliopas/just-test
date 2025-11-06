import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import {
  RegisterInput,
  VerifyOTPInput,
  ResendOTPInput,
} from '../schemas/auth.schema';
import { otpService } from '../services/otp.service';
import { totpService } from '../services/totp.service';

export const authController = {
  register: async (req: Request<{}, {}, RegisterInput>, res: Response) => {
    try {
      const { email, password, phone } = req.body;

      // Sign up user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        phone: phone || undefined,
        options: {
          emailRedirectTo: process.env.EMAIL_REDIRECT_TO || undefined,
        },
      });

      if (error) {
        // Handle Supabase Auth errors
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          return res.status(409).json({
            error: {
              code: 'CONFLICT',
              message: 'Email already registered',
            },
          });
        }

        // Generic Supabase error
        return res.status(400).json({
          error: {
            code: 'AUTH_ERROR',
            message: error.message,
          },
        });
      }

      if (!data.user) {
        return res.status(500).json({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to create user',
          },
        });
      }

      // Create user record in users table (link Supabase Auth user with users table)
      const { error: userError } = await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email,
        phone: phone || null,
        role: 'investor',
        status: 'pending',
      });

      if (userError) {
        console.error('Failed to create user record:', userError);
        // Don't fail registration, but log the error
      }

      // Create OTP for email verification
      try {
        await otpService.createOTP(data.user.id);
        // TODO: Send OTP via email (Supabase Edge Function or email service)
      } catch (otpError) {
        // Log error but don't fail registration
        console.error('Failed to create OTP:', otpError);
      }

      // Success response
      return res.status(201).json({
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        emailConfirmationSent: !data.session, // If no session, email confirmation was sent
        otpSent: true, // OTP was created and should be sent via email
      });
    } catch (error) {
      // Unexpected error
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    }
  },

  verifyOTP: async (req: Request<{}, {}, VerifyOTPInput>, res: Response) => {
    try {
      const { email, otp } = req.body;

      // Find user by email in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      const userId = userData.id;

      // Check if max attempts exceeded
      const hasExceeded = await otpService.hasExceededMaxAttempts(userId);
      if (hasExceeded) {
        return res.status(429).json({
          error: {
            code: 'TOO_MANY_ATTEMPTS',
            message: 'Maximum OTP verification attempts exceeded',
          },
        });
      }

      // Verify OTP
      const isValid = await otpService.verifyOTP(userId, otp);

      if (!isValid) {
        // Check if OTP exists and is expired
        const activeOTP = await otpService.findActiveOTP(userId);
        if (!activeOTP) {
          return res.status(400).json({
            error: {
              code: 'INVALID_OTP',
              message: 'Invalid or expired OTP',
            },
          });
        }

        if (activeOTP.attempts >= activeOTP.max_attempts) {
          return res.status(429).json({
            error: {
              code: 'TOO_MANY_ATTEMPTS',
              message: 'Maximum OTP verification attempts exceeded',
            },
          });
        }

        return res.status(400).json({
          error: {
            code: 'INVALID_OTP',
            message: 'Invalid OTP code',
          },
        });
      }

      // Invalidate all other OTPs for this user
      await otpService.invalidateUserOTPs(userId);

      // Update user status to 'active' in users table
      const { error: updateError } = await supabase
        .from('users')
        .update({ status: 'active' })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update user status:', updateError);
        // Don't fail the request, OTP is already verified
      }

      // TODO: Send welcome notification/email

      return res.status(200).json({
        activated: true,
        message: 'Account activated successfully',
      });
    } catch (error) {
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    }
  },

  resendOTP: async (req: Request<{}, {}, ResendOTPInput>, res: Response) => {
    try {
      const { email } = req.body;

      // Find user by email in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      const userId = userData.id;

      // Invalidate existing OTPs
      await otpService.invalidateUserOTPs(userId);

      // Create new OTP
      const { expiresAt } = await otpService.createOTP(userId);

      // TODO: Send OTP via email (Supabase Edge Function or email service)

      return res.status(200).json({
        message: 'OTP resent successfully',
        expiresAt: expiresAt.toISOString(),
      });
    } catch (error) {
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password, totpToken } = req.body as {
        email: string;
        password: string;
        totpToken?: string;
      };

      // Sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: error.message,
          },
        });
      }

      if (!data.user) {
        return res.status(500).json({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to sign in',
          },
        });
      }

      // Check if 2FA is enabled
      const { data: userData } = await supabase
        .from('users')
        .select('mfa_enabled, mfa_secret')
        .eq('id', data.user.id)
        .single();

      if (userData?.mfa_enabled && userData?.mfa_secret) {
        // 2FA is enabled - require TOTP token
        if (!totpToken) {
          return res.status(200).json({
            requires2FA: true,
            message: '2FA token required',
          });
        }

        // Verify TOTP token
        const isValid = totpService.verifyToken(userData.mfa_secret, totpToken);
        if (!isValid) {
          return res.status(401).json({
            error: {
              code: 'INVALID_TOTP_TOKEN',
              message: 'Invalid 2FA token',
            },
          });
        }
      }

      return res.status(200).json({
        user: data.user,
        session: data.session,
      });
    } catch (error) {
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    }
  },

  refresh: async (req: Request, res: Response) => {
    try {
      const { refresh_token } = req.body as { refresh_token: string };
      const { data, error } = await supabase.auth.refreshSession({ refresh_token });

      if (error) {
        return res.status(401).json({
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: error.message,
          },
        });
      }

      return res.status(200).json({
        session: data.session,
        user: data.user,
      });
    } catch (error) {
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    }
  },

  logout: async (_req: Request, res: Response) => {
    // Client-managed tokens: instruct client to clear tokens
    return res.status(204).send();
  },

  setup2FA: async (req: Request, res: Response) => {
    try {
      // Get user from session (assuming middleware extracts user)
      // For now, we'll get user from request body or session
      const userId = (req as any).user?.id;
      const userEmail = (req as any).user?.email;

      if (!userId || !userEmail) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      // Check if 2FA is already enabled
      const status = await totpService.get2FAStatus(userId);
      if (status.enabled) {
        return res.status(400).json({
          error: {
            code: 'ALREADY_ENABLED',
            message: '2FA is already enabled',
          },
        });
      }

      // Generate TOTP secret and QR code
      const setup = await totpService.generateSecret(userId, userEmail);

      // Store secret temporarily (user needs to verify before enabling)
      // For now, we'll return it and user must verify in next step
      return res.status(200).json({
        secret: setup.secret,
        otpauthUrl: setup.otpauthUrl,
        qr: setup.qr,
      });
    } catch (error) {
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    }
  },

  verify2FA: async (req: Request, res: Response) => {
    try {
      const { token, secret } = req.body as { token: string; secret: string };
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      if (!secret || !token) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Secret and token are required',
          },
        });
      }

      // Verify TOTP token
      const isValid = totpService.verifyToken(secret, token);
      if (!isValid) {
        return res.status(400).json({
          error: {
            code: 'INVALID_TOTP_TOKEN',
            message: 'Invalid TOTP token',
          },
        });
      }

      // Enable 2FA
      await totpService.enable2FA(userId, secret);

      return res.status(200).json({
        enabled: true,
        message: '2FA enabled successfully',
      });
    } catch (error) {
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    }
  },

  disable2FA: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      // Check if 2FA is enabled
      const status = await totpService.get2FAStatus(userId);
      if (!status.enabled) {
        return res.status(400).json({
          error: {
            code: 'NOT_ENABLED',
            message: '2FA is not enabled',
          },
        });
      }

      // Disable 2FA
      await totpService.disable2FA(userId);

      return res.status(200).json({
        disabled: true,
        message: '2FA disabled successfully',
      });
    } catch (error) {
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    }
  },
};

