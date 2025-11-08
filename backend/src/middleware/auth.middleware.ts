import { Request, Response, NextFunction } from 'express';
import { supabase, requireSupabaseAdmin } from '../lib/supabase';
import { getAccessToken } from '../utils/auth.util';

export type AuthenticatedUser = {
  id: string;
  email: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
};

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Authentication middleware - extracts user from JWT token
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const token = getAccessToken(req);
    if (!token) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid access token',
        },
      });
    }

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        },
      });
    }

    // Get user from users table
    const adminClient = requireSupabaseAdmin();
    const { data: userData, error: userError } = await adminClient
      .from('users')
      .select('id, email, role')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found',
        },
      });
    }

    // Attach user to request
    req.user = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      roles: userData.role ? [userData.role] : [],
      permissions: [],
    };

    return next();
  } catch (error) {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
};
