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
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
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
  const { userRecord, isLoading: userRecordLoading } = useSupabaseUser(supabaseUser?.id);
  const router = useRouter();
  const pathname = usePathname();

  // Use Supabase auth as primary source, fallback to AuthContext
  const finalIsAuthenticated = supabaseAuthenticated || (isAuthenticated && !supabaseLoading);
  
  // Determine user role: prioritize database record, then AuthContext, then default to investor
  const userRole: 'investor' | 'admin' = userRecord?.role === 'admin' 
    ? 'admin' 
    : (user?.role || 'investor');
  
  const finalUser = supabaseUser ? {
    id: supabaseUser.id,
    email: supabaseUser.email || userRecord?.email || '',
    role: userRole,
  } : user;

  useEffect(() => {
    // Wait for Supabase auth and user record to finish loading
    if (supabaseLoading || userRecordLoading) {
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

      // Check role if required - use database role as source of truth
      if (requiredRole) {
        const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        
        // Always use database role if available, otherwise fallback to AuthContext
        const currentRole = userRecord?.role === 'admin' 
          ? 'admin' 
          : (userRecord?.role === 'investor' ? 'investor' : finalUser.role);

        console.log('[ProtectedRoute] Role check:', {
          pathname,
          requiredRoles,
          currentRole,
          userRecordRole: userRecord?.role,
          finalUserRole: finalUser.role,
        });

        if (!requiredRoles.includes(currentRole)) {
          // User doesn't have required role, redirect to appropriate dashboard
          const targetPath = currentRole === 'admin' ? '/admin/dashboard' : '/dashboard';
          console.log('[ProtectedRoute] Redirecting due to role mismatch:', {
            from: pathname,
            to: targetPath,
            currentRole,
            requiredRoles,
          });
          router.push(targetPath);
          return;
        }
      }
    }, 200); // Increased delay to allow session and user record to sync

    return () => clearTimeout(checkAuth);
  }, [finalIsAuthenticated, finalUser, requiredRole, redirectTo, router, pathname, supabaseLoading, userRecordLoading, userRecord]);

  // Show loading state
  if (showLoading && (supabaseLoading || userRecordLoading || !finalIsAuthenticated || !finalUser)) {
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

  // Check role after authentication is confirmed - use database role if available
  // Wait for user record to load before checking role
  if (finalIsAuthenticated && finalUser && requiredRole && !userRecordLoading) {
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    // Always use the role from database if available, otherwise fallback to AuthContext
    const currentRole = userRecord?.role === 'admin' 
      ? 'admin' 
      : (userRecord?.role === 'investor' ? 'investor' : finalUser.role);
    
    if (!requiredRoles.includes(currentRole)) {
      // Don't render children if role doesn't match
      console.log('[ProtectedRoute] Blocking render - role mismatch:', {
        currentRole,
        requiredRoles,
        pathname,
      });
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

