import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { rbacService } from '../services/rbac.service';

/**
 * RBAC middleware - checks if user has required permission
 */
export const requirePermission = (permissionSlug: string | string[]) => {
  const required = Array.isArray(permissionSlug)
    ? permissionSlug
    : [permissionSlug];

  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      // Early check for Supabase service key before calling RBAC service
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('SUPABASE_SERVICE_ROLE_KEY is missing - RBAC check will fail');
        return res.status(500).json({
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'Server configuration error: Missing Supabase service role key',
            details: 'SUPABASE_SERVICE_ROLE_KEY environment variable is not set. This is required for permission checks.',
          },
        });
      }

      const hasPermission =
        required.length === 1
          ? await rbacService.hasPermission(req.user.id, required[0])
          : await rbacService.hasAnyPermission(req.user.id, required);

      if (!hasPermission) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          },
        });
      }

      const permissions = await rbacService.getUserPermissionSlugs(req.user.id);
      req.user.permissions = Array.from(permissions);

      return next();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      console.error('RBAC middleware error:', {
        error: errorMessage,
        stack: errorStack,
        userId: req.user?.id,
        requiredPermission: permissionSlug,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      });
      
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          details:
            process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'production'
              ? errorMessage
              : undefined,
        },
      });
    }
  };
};

/**
 * RBAC middleware - checks if user has required role
 */
export const requireRole = (roleSlug: string | string[]) => {
  const required = Array.isArray(roleSlug) ? roleSlug : [roleSlug];

  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const userHasRole = await rbacService.getUserRoleSlugs(req.user.id);
      const hasRole = required.some(slug => userHasRole.has(slug));

      if (!hasRole) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient role',
          },
        });
      }

      req.user.roles = Array.from(userHasRole);

      return next();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      console.error('RBAC middleware error (requireRole):', {
        error: errorMessage,
        stack: errorStack,
        userId: req.user?.id,
        requiredRole: roleSlug,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      });
      
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          details:
            process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'production'
              ? errorMessage
              : undefined,
        },
      });
    }
  };
};
