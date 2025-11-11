import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { supabase, requireSupabaseAdmin } from '../lib/supabase';
import {
  RegisterInput,
  VerifyOTPInput,
  ResendOTPInput,
  LoginInput,
  ConfirmEmailInput,
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
      const language = req.body.language ?? 'ar';
      const request = await investorSignupRequestService.createRequest({
        email: req.body.email,
        fullName: req.body.fullName,
        phone: req.body.phone,
        company: req.body.company,
        message: req.body.message,
        language,
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
      const status =
        (error as Error & { status?: number }).status ??
        (error instanceof Error &&
        (error.message === 'REQUEST_ALREADY_PENDING' ||
          error.message === 'USER_ALREADY_EXISTS')
          ? 409
          : 500);

      return res.status(status).json({
        error: {
          code:
            error instanceof Error &&
            (error.message === 'REQUEST_ALREADY_PENDING' ||
              error.message === 'USER_ALREADY_EXISTS')
              ? error.message
              : 'INTERNAL_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to submit signup request',
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

      // Sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: error.message,
          },
        });
      }

      if (!data.user || !data.session) {
        await supabase.auth.signOut();
        return res.status(500).json({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to sign in',
          },
        });
      }

      // Check if 2FA is enabled
      const adminClient = requireSupabaseAdmin();
      const { data: userData } = await adminClient
        .from('users')
        .select('mfa_enabled, mfa_secret, status, role')
        .eq('id', data.user.id)
        .single();

      // Accounts are considered active immediately after signup.

      if (userData?.mfa_enabled && userData?.mfa_secret) {
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

      setAuthCookies(res, data.session);

      return res.status(200).json({
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
};
