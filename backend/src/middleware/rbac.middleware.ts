import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { rbacService } from '../services/rbac.service';

/**
 * RBAC middleware - checks if user has required permission
 */
export const requirePermission = (permissionName: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const hasPermission = await rbacService.hasPermission(req.user.id, permissionName);

      if (!hasPermission) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          },
        });
      }

      next();
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
export const requireRole = (roleName: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const hasRole = await rbacService.hasRole(req.user.id, roleName);

      if (!hasRole) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient role',
          },
        });
      }

      next();
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

