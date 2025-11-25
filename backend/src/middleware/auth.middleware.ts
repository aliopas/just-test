import { Request, Response, NextFunction } from 'express';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, requireSupabaseAdmin } from '../lib/supabase';
import { getAccessToken } from '../utils/auth.util';
import { rbacService } from '../services/rbac.service';

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

    const userRecord = await ensureUserRecord(data.user);
    if (!userRecord) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found',
        },
      });
    }

    // Attach user to request
    req.user = {
      id: userRecord.id,
      email: userRecord.email,
      role: userRecord.role ?? 'investor',
      roles: userRecord.role ? [userRecord.role] : [],
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

type UserRow = {
  id: string;
  email: string;
  role: string | null;
};

async function ensureUserRecord(user: SupabaseUser): Promise<UserRow | null> {
  const adminClient = requireSupabaseAdmin();

  const { data: existingUser, error: existingError } = await adminClient
    .from('users')
    .select('id, email, role')
    .eq('id', user.id)
    .single<UserRow>();

  if (existingUser && !existingError) {
    return existingUser;
  }

  const metadataRole =
    (user.user_metadata as { role?: string } | null | undefined)?.role ??
    (user.app_metadata as { role?: string } | null | undefined)?.role ??
    undefined;

  const inferredRole =
    metadataRole && typeof metadataRole === 'string'
      ? metadataRole
      : 'investor';

  const email =
    user.email ??
    (typeof user.phone === 'string' && user.phone.length > 0
      ? user.phone
      : `user-${user.id}@generated.local`);

  const { data: insertedUser, error: insertError } = await adminClient
    .from('users')
    .upsert(
      {
        id: user.id,
        email,
        phone: user.phone ?? null,
        role: inferredRole,
        status: 'active',
      },
      {
        onConflict: 'id',
      }
    )
    .select('id, email, role')
    .single<UserRow>();

  if (insertError || !insertedUser) {
    return null;
  }

  try {
    await rbacService.assignRole(user.id, inferredRole);
  } catch (roleError) {
    void roleError;
  }

  return insertedUser;
}
