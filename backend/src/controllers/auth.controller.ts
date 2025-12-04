import { Request, Response } from 'express';
import { AuthenticatedRequest, ensureUserRecord } from '../middleware/auth.middleware';
import { supabase, requireSupabaseAdmin } from '../lib/supabase';
import {
  RegisterInput,
  VerifyOTPInput,
  ResendOTPInput,
  LoginInput,
  ConfirmEmailInput,
  ResetPasswordRequestInput,
  VerifyResetTokenInput,
  UpdatePasswordInput,
} from '../schemas/auth.schema';
import { otpService } from '../services/otp.service';
import { totpService } from '../services/totp.service';
import {
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  setAuthCookies,
} from '../utils/auth.util';
import { investorSignupRequestService } from '../services/investor-signup-request.service';
import { enqueueEmailNotification } from '../services/email-dispatch.service';
import type { EmailLanguage } from '../email/templates/types';

type EmptyParams = Record<string, never>;

function decodeJwtSub(token: string): string | null {
  try {
    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) {
      return null;
    }
    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '='
    );
    const decoded = Buffer.from(padded, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded) as { sub?: string };
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch (error) {
    console.error('Failed to decode JWT payload:', error);
    return null;
  }
}

export const authController = {
  register: async (
    req: Request<EmptyParams, unknown, RegisterInput>,
    res: Response
  ) => {
    try {
      console.log('[Register] Received request:', {
        email: req.body.email,
        fullName: req.body.fullName,
        hasPhone: !!req.body.phone,
        hasCompany: !!req.body.company,
        hasMessage: !!req.body.message,
        language: req.body.language ?? 'ar',
      });

      const language = req.body.language ?? 'ar';
      const request = await investorSignupRequestService.createRequest({
        email: req.body.email,
        fullName: req.body.fullName,
        phone: req.body.phone,
        company: req.body.company,
        message: req.body.message,
        language,
      });

      console.log('[Register] Request created successfully:', {
        id: request.id,
        status: request.status,
      });

      return res.status(202).json({
        request: {
          id: request.id,
          status: request.status,
          createdAt: request.created_at,
        },
        message:
          language === 'ar'
            ? 'تم استقبال طلب إنشاء الحساب وسيتم مراجعة الطلب من قبل فريق الإدارة.'
            : 'Your investor signup request has been received and will be reviewed by the admin team.',
      });
    } catch (error) {
      console.error('[Register] Error occurred:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        status: (error as Error & { status?: number }).status,
      });

      const status =
        (error as Error & { status?: number }).status ??
        (error instanceof Error &&
        (error.message === 'REQUEST_ALREADY_PENDING' ||
          error.message === 'USER_ALREADY_EXISTS')
          ? 409
          : 500);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to submit signup request';

      // Log additional details for 500 errors
      if (status === 500) {
        console.error('[Register] Internal server error details:', {
          errorType: error?.constructor?.name,
          errorMessage,
          body: req.body,
        });
      }

      return res.status(status).json({
        error: {
          code:
            error instanceof Error &&
            (error.message === 'REQUEST_ALREADY_PENDING' ||
              error.message === 'USER_ALREADY_EXISTS')
              ? error.message
              : 'INTERNAL_ERROR',
          message: errorMessage,
        },
      });
    }
  },

  verifyOTP: async (
    req: Request<EmptyParams, unknown, VerifyOTPInput>,
    res: Response
  ) => {
    try {
      const { email, otp } = req.body;

      // Find user by email in users table
      const adminClient = requireSupabaseAdmin();
      const { data: userData, error: userError } = await adminClient
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
      const { error: updateError } = await adminClient
        .from('users')
        .update({ status: 'active' })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update user status:', updateError);
        // Don't fail the request, OTP is already verified
      }

      // Send welcome email
      try {
        const { data: authUser } =
          await adminClient.auth.admin.getUserById(userId);
        const userEmail = email ?? authUser?.user?.email;

        if (userEmail) {
          // Get user profile for name and language
          const { data: profile } = await adminClient
            .from('investor_profiles')
            .select('full_name, preferred_name, language')
            .eq('user_id', userId)
            .maybeSingle();

          const userName =
            profile?.preferred_name ??
            profile?.full_name ??
            authUser?.user?.user_metadata?.full_name ??
            userEmail.split('@')[0];

          const language: EmailLanguage =
            (profile?.language as EmailLanguage) ??
            (authUser?.user?.user_metadata?.locale as EmailLanguage) ??
            'ar';

          const frontendUrl =
            process.env.FRONTEND_URL ?? 'http://localhost:5173';
          const loginLink = `${frontendUrl}/login`;

          await enqueueEmailNotification({
            userId,
            templateId: 'welcome',
            language,
            recipientEmail: userEmail,
            context: {
              userName,
              loginLink,
            },
          });
        }
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the request if email fails
      }

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

  resendOTP: async (
    req: Request<EmptyParams, unknown, ResendOTPInput>,
    res: Response
  ) => {
    try {
      const { email } = req.body;

      // Find user by email in users table
      const adminClient = requireSupabaseAdmin();
      const { data: userData, error: userError } = await adminClient
        .from('users')
        .select('id, email')
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
      const { code, expiresAt } = await otpService.createOTP(userId);

      // Get user details for email
      const { data: authUser } =
        await adminClient.auth.admin.getUserById(userId);
      const userEmail = userData.email ?? authUser?.user?.email;
      if (!userEmail) {
        return res.status(400).json({
          error: {
            code: 'EMAIL_NOT_FOUND',
            message: 'User email not found',
          },
        });
      }

      // Get user profile for name and language
      const { data: profile } = await adminClient
        .from('investor_profiles')
        .select('full_name, preferred_name, language')
        .eq('user_id', userId)
        .maybeSingle();

      const userName =
        profile?.preferred_name ??
        profile?.full_name ??
        authUser?.user?.user_metadata?.full_name ??
        userEmail.split('@')[0];

      const language: EmailLanguage =
        (profile?.language as EmailLanguage) ??
        (authUser?.user?.user_metadata?.locale as EmailLanguage) ??
        'ar';

      // Send OTP via email
      try {
        await enqueueEmailNotification({
          userId,
          templateId: 'otp_verification',
          language,
          recipientEmail: userEmail,
          context: {
            userName,
            otpCode: code,
            expiresInMinutes: 10,
          },
        });
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        // Don't fail the request if email fails
      }

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

  confirmEmail: async (
    req: Request<EmptyParams, unknown, ConfirmEmailInput>,
    res: Response
  ) => {
    try {
      const { email, token, token_hash, access_token } = req.body;
      const adminClient = requireSupabaseAdmin();

      if (access_token) {
        const userId = decodeJwtSub(access_token);

        if (!userId) {
          return res.status(400).json({
            error: {
              code: 'INVALID_TOKEN',
              message: 'Unable to extract user from access token',
            },
          });
        }

        const { data: userData, error: userError } =
          await adminClient.auth.admin.getUserById(userId);

        if (userError || !userData?.user) {
          return res.status(404).json({
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found',
            },
          });
        }

        const { error: updateError } = await adminClient
          .from('users')
          .update({ status: 'active' })
          .eq('id', userId);

        if (updateError) {
          console.error(
            'Failed to update user status during email confirmation:',
            updateError
          );
        }

        return res.status(200).json({
          verified: true,
          user: {
            id: userId,
            email: userData.user.email,
          },
        });
      }

      const verifyParams: Parameters<typeof supabase.auth.verifyOtp>[0] =
        token_hash
          ? {
              email: email as string,
              type: 'signup',
              token_hash,
            }
          : {
              email: email as string,
              type: 'signup',
              token: token as string,
            };

      const { data, error } = await supabase.auth.verifyOtp(verifyParams);

      if (error) {
        return res.status(400).json({
          error: {
            code: 'VERIFY_EMAIL_FAILED',
            message: error.message,
          },
        });
      }

      const { error: updateError } = await adminClient
        .from('users')
        .update({ status: 'active' })
        .eq('email', email);

      if (updateError) {
        console.error(
          'Failed to update user status during email confirmation:',
          updateError
        );
      }

      return res.status(200).json({
        verified: true,
        user: data.user
          ? {
              id: data.user.id,
              email: data.user.email,
            }
          : undefined,
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

  login: async (
    req: Request<EmptyParams, unknown, LoginInput>,
    res: Response
  ) => {
    try {
      const { email, password, totpToken } = req.body;

      console.log('[Login] Attempting login:', {
        email,
        hasPassword: !!password,
        hasTotpToken: !!totpToken,
      });

      // Sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[Login] Supabase auth error:', {
          message: error.message,
          status: error.status,
        });
        return res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: error.message,
          },
        });
      }

      if (!data.user || !data.session) {
        console.error('[Login] Missing user or session after successful auth');
        await supabase.auth.signOut();
        return res.status(500).json({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to sign in',
          },
        });
      }

      console.log('[Login] Supabase auth successful:', {
        userId: data.user.id,
        email: data.user.email,
      });

      // Ensure user exists in users table
      const userRecord = await ensureUserRecord(data.user);
      
      if (!userRecord) {
        console.error('[Login] Failed to ensure user record:', {
          userId: data.user.id,
          email: data.user.email,
        });
        await supabase.auth.signOut();
        return res.status(403).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User account not found. Please contact support.',
          },
        });
      }

      console.log('[Login] User record ensured:', {
        userId: userRecord.id,
        email: userRecord.email,
        role: userRecord.role,
      });

      // Check if 2FA is enabled and get user status
      const adminClient = requireSupabaseAdmin();
      const { data: userData, error: userDataError } = await adminClient
        .from('users')
        .select('mfa_enabled, mfa_secret, status, role')
        .eq('id', data.user.id)
        .single();

      if (userDataError) {
        console.error('[Login] Error fetching user data:', {
          error: userDataError.message,
          code: userDataError.code,
          details: userDataError.details,
        });
        await supabase.auth.signOut();
        return res.status(403).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User account not found in database',
          },
        });
      }

      if (!userData) {
        console.error('[Login] User data not found:', {
          userId: data.user.id,
        });
        await supabase.auth.signOut();
        return res.status(403).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User account not found in database',
          },
        });
      }

      console.log('[Login] User data retrieved:', {
        userId: data.user.id,
        status: userData.status,
        role: userData.role,
        mfaEnabled: userData.mfa_enabled,
      });

      // Check user status - only allow active users to login
      if (userData.status !== 'active') {
        console.warn('[Login] User account not active:', {
          userId: data.user.id,
          status: userData.status,
        });
        await supabase.auth.signOut();
        return res.status(403).json({
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: userData.status === 'pending'
              ? 'Your account is pending activation. Please check your email.'
              : userData.status === 'suspended'
              ? 'Your account has been suspended. Please contact support.'
              : 'Your account is not active. Please contact support.',
          },
        });
      }

      // Check if 2FA is enabled
      if (userData.mfa_enabled && userData.mfa_secret) {
        // 2FA is enabled - require TOTP token
        if (!totpToken) {
          await supabase.auth.signOut();
          return res.status(200).json({
            requires2FA: true,
            message: '2FA token required',
          });
        }

        // Verify TOTP token
        const isValid = totpService.verifyToken(userData.mfa_secret, totpToken);
        if (!isValid) {
          await supabase.auth.signOut();
          return res.status(401).json({
            error: {
              code: 'INVALID_TOTP_TOKEN',
              message: 'Invalid 2FA token',
            },
          });
        }
      }

      const metadataRole = (
        data.user.user_metadata as { role?: string } | null | undefined
      )?.role;
      const role =
        (userData?.role as string | null | undefined) ??
        metadataRole ??
        'investor';

      console.log('[Login] Final role determination:', {
        userId: data.user.id,
        dbRole: userData?.role,
        metadataRole,
        finalRole: role,
      });

      setAuthCookies(res, data.session);

      const response = {
        user: {
          id: data.user.id,
          email: data.user.email,
          role,
        },
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token ?? undefined,
          expiresIn: data.session.expires_in ?? 3600,
          expiresAt: data.session.expires_at ?? null,
          tokenType: data.session.token_type ?? 'bearer',
        },
        expiresIn: data.session.expires_in ?? 3600,
        tokenType: 'Bearer',
      };

      console.log('[Login] Login successful:', {
        userId: response.user.id,
        email: response.user.email,
        role: response.user.role,
      });

      return res.status(200).json(response);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Log full error details for debugging
      console.error('Login error details:', {
        message: errorMessage,
        stack: errorStack,
        error: error,
      });
      
      return res.status(500).json({
        error: {
          code: 'LOGIN_FAILED',
          message: errorMessage || 'An unexpected error occurred during login',
          details: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        },
      });
    }
  },

  refresh: async (req: Request, res: Response) => {
    try {
      const refreshToken = getRefreshToken(req);

      if (!refreshToken) {
        return res.status(401).json({
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Refresh token is missing',
          },
        });
      }

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        return res.status(401).json({
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: error.message,
          },
        });
      }

      if (!data.session || !data.user) {
        return res.status(401).json({
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Failed to refresh session',
          },
        });
      }

      setAuthCookies(res, data.session);

      return res.status(200).json({
        refreshed: true,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token ?? undefined,
          expiresIn: data.session.expires_in ?? 3600,
          expiresAt: data.session.expires_at ?? null,
          tokenType: data.session.token_type ?? 'bearer',
        },
        expiresIn: data.session.expires_in ?? 3600,
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

  logout: async (req: Request, res: Response) => {
    try {
      const accessToken = getAccessToken(req);
      const refreshToken = getRefreshToken(req);

      if (accessToken) {
        const userId = decodeJwtSub(accessToken);
        if (userId) {
          try {
            const adminClient = requireSupabaseAdmin();
            await adminClient.auth.admin.signOut(userId);
          } catch (adminError) {
            console.error('Failed to revoke user sessions:', adminError);
          }
        }
      }

      if (accessToken && refreshToken) {
        try {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          await supabase.auth.signOut({ scope: 'local' });
        } catch (signOutError) {
          console.error('Failed to sign out current session:', signOutError);
        }
      }

      clearAuthCookies(res);

      return res.status(200).json({
        loggedOut: true,
        message: 'Session terminated successfully',
      });
    } catch (error) {
      clearAuthCookies(res);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    }
  },

  setup2FA: async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Get user from authenticated request
      const userId = req.user?.id;
      const userEmail = req.user?.email;

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

  verify2FA: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { token, secret } = req.body as { token: string; secret: string };
      const userId = req.user?.id;

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

  disable2FA: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

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

  // Password Reset Endpoints
  resetPasswordRequest: async (
    req: Request<EmptyParams, unknown, ResetPasswordRequestInput>,
    res: Response
  ) => {
    try {
      const { email } = req.body;

      // Use Supabase to send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${process.env.FRONTEND_URL || 'https://investor-bacura.netlify.app'}/reset-password`,
        }
      );

      if (error) {
        // Don't reveal if user exists or not for security
        if (
          error.message.includes('rate limit') ||
          error.message.includes('too many')
        ) {
          return res.status(429).json({
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message:
                'Too many requests. Please wait a few minutes before trying again.',
            },
          });
        }

        // For security, always return success even if user doesn't exist
        return res.status(200).json({
          message:
            'If an account exists with this email, a password reset link has been sent.',
        });
      }

      return res.status(200).json({
        message:
          'If an account exists with this email, a password reset link has been sent.',
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    }
  },

  verifyResetToken: async (
    req: Request<EmptyParams, unknown, VerifyResetTokenInput>,
    res: Response
  ) => {
    try {
      const { token_hash, email } = req.body;

      // Verify the recovery token with Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        email: email || undefined,
        token_hash,
        type: 'recovery',
      });

      if (error || !data.session) {
        return res.status(400).json({
          error: {
            code: 'INVALID_OR_EXPIRED_TOKEN',
            message:
              'Invalid or expired reset token. Please request a new link.',
          },
        });
      }

      // Return session tokens for client to use
      if (!data.user) {
        return res.status(400).json({
          error: {
            code: 'INVALID_OR_EXPIRED_TOKEN',
            message:
              'Invalid or expired reset token. Please request a new link.',
          },
        });
      }

      return res.status(200).json({
        verified: true,
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      });
    } catch (error) {
      console.error('Verify reset token error:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    }
  },

  updatePassword: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { password } = req.body as UpdatePasswordInput;

      if (!req.user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
      }

      // Use admin client to update password (most reliable method)
      const adminClient = requireSupabaseAdmin();
      const { error: updateError } =
        await adminClient.auth.admin.updateUserById(req.user.id, {
          password: password,
        });

      if (updateError) {
        return res.status(400).json({
          error: {
            code: 'PASSWORD_UPDATE_FAILED',
            message: updateError.message || 'Failed to update password',
          },
        });
      }

      return res.status(200).json({
        updated: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      console.error('Update password error:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    }
  },
};
