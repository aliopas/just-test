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
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
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
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    }
  };
};
