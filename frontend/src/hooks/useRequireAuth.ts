/**
 * useRequireAuth Hook
 * 
 * Hook to require authentication and optionally specific role
 * Redirects to login if not authenticated
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type UseRequireAuthOptions = {
  /**
   * Required role(s) to access
   * If not specified, any authenticated user can access
   */
  requiredRole?: 'investor' | 'admin' | ('investor' | 'admin')[];
  /**
   * Redirect path if user is not authenticated
   * Default: '/login'
   */
  redirectTo?: string;
  /**
   * Whether to redirect immediately or return status
   * Default: true (redirect)
   */
  redirect?: boolean;
};

type UseRequireAuthReturn = {
  isAuthenticated: boolean;
  user: { id: string; email: string; role: 'investor' | 'admin' } | null;
  hasRequiredRole: boolean;
  isLoading: boolean;
};

export function useRequireAuth(
  options: UseRequireAuthOptions = {}
): UseRequireAuthReturn {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const {
    requiredRole,
    redirectTo = '/login',
    redirect = true,
  } = options;

  useEffect(() => {
    if (!redirect) {
      return;
    }

    // Check authentication
    if (!isAuthenticated || !user) {
      // Store the current path to redirect back after login
      if (pathname && pathname !== '/login' && pathname !== '/register') {
        sessionStorage.setItem('redirectAfterLogin', pathname);
      }
      router.push(redirectTo);
      return;
    }

    // Check role if required
    if (requiredRole) {
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      const userRole = user.role;

      if (!requiredRoles.includes(userRole)) {
        // User doesn't have required role, redirect to appropriate dashboard
        const targetPath = userRole === 'admin' ? '/admin/dashboard' : '/dashboard';
        router.push(targetPath);
        return;
      }
    }
  }, [isAuthenticated, user, requiredRole, redirectTo, redirect, router, pathname]);

  const hasRequiredRole = requiredRole
    ? Array.isArray(requiredRole)
      ? requiredRole.includes(user?.role || 'investor')
      : user?.role === requiredRole
    : true;

  return {
    isAuthenticated: Boolean(isAuthenticated && user),
    user: user || null,
    hasRequiredRole,
    isLoading: false, // Could be enhanced to check token validity
  };
}

