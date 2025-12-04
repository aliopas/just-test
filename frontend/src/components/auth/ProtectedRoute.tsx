/**
 * ProtectedRoute Component
 * 
 * Protects routes based on authentication and role requirements
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { palette } from '@/styles/theme';

type ProtectedRouteProps = {
  children: React.ReactNode;
  /**
   * Required role(s) to access this route
   * If not specified, any authenticated user can access
   */
  requiredRole?: 'investor' | 'admin' | ('investor' | 'admin')[];
  /**
   * Redirect path if user is not authenticated
   * Default: '/login'
   */
  redirectTo?: string;
  /**
   * Show loading state while checking authentication
   */
  showLoading?: boolean;
};

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
  showLoading = true,
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
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
  }, [isAuthenticated, user, requiredRole, redirectTo, router, pathname]);

  // Show loading state
  if (showLoading && (!isAuthenticated || !user)) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: palette.backgroundSurface,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            color: palette.textSecondary,
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${palette.neutralBorderMuted}`,
              borderTopColor: palette.brandPrimaryStrong,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <p>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // Check role after authentication is confirmed
  if (isAuthenticated && user && requiredRole) {
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!requiredRoles.includes(user.role)) {
      // Don't render children if role doesn't match
      return null;
    }
  }

  // Render children if authenticated and role matches (if required)
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // Don't render anything while redirecting
  return null;
}

