/**
 * ProtectedRoute Component
 * 
 * Protects routes based on authentication and role requirements
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
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
  const { user: supabaseUser, isAuthenticated: supabaseAuthenticated, isLoading: supabaseLoading } = useSupabaseAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Use Supabase auth as primary source, fallback to AuthContext
  const finalIsAuthenticated = supabaseAuthenticated || (isAuthenticated && !supabaseLoading);
  const finalUser = supabaseUser ? {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    role: (user?.role || 'investor') as 'investor' | 'admin',
  } : user;

  useEffect(() => {
    // Wait for Supabase auth to finish loading
    if (supabaseLoading) {
      return;
    }

    // Small delay to ensure session is fully initialized after login
    const checkAuth = setTimeout(() => {
      // Check authentication
      if (!finalIsAuthenticated || !finalUser) {
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
        const userRole = finalUser.role;

        if (!requiredRoles.includes(userRole)) {
          // User doesn't have required role, redirect to appropriate dashboard
          const targetPath = userRole === 'admin' ? '/admin/dashboard' : '/dashboard';
          router.push(targetPath);
          return;
        }
      }
    }, 100); // Small delay to allow session to sync

    return () => clearTimeout(checkAuth);
  }, [finalIsAuthenticated, finalUser, requiredRole, redirectTo, router, pathname, supabaseLoading]);

  // Show loading state
  if (showLoading && (supabaseLoading || !finalIsAuthenticated || !finalUser)) {
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
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `
        }} />
      </div>
    );
  }

  // Check role after authentication is confirmed
  if (finalIsAuthenticated && finalUser && requiredRole) {
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!requiredRoles.includes(finalUser.role)) {
      // Don't render children if role doesn't match
      return null;
    }
  }

  // Render children if authenticated and role matches (if required)
  if (finalIsAuthenticated && finalUser) {
    return <>{children}</>;
  }

  // Don't render anything while redirecting
  return null;
}

