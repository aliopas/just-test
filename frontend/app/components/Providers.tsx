'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
import { Router } from 'react-router-dom';
import { usePathname, useSearchParams } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/context/LanguageContext';
import { ToastProvider } from '@/context/ToastContext';
import { ToastStack } from '@/components/ToastStack';
import { AuthProvider } from '@/context/AuthContext';
import { applyTheme, theme } from '@/styles/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

// Router wrapper that provides React Router context using Next.js routing
// Use a broad 'any' type for children here to avoid React 19 type compat issues between
// Next.js' React types and react-router-dom's React types.
function RouterWrapper({ children }: { children: any }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Create location object based on Next.js route
  const location = useMemo(() => {
    const search = searchParams?.toString() || '';
    return {
      pathname: pathname || '/',
      search: search ? `?${search}` : '',
      hash: typeof window !== 'undefined' ? window.location.hash : '',
      state: null,
      key: 'default',
    };
  }, [pathname, searchParams]);

  // Create navigator that doesn't interfere with Next.js routing
  const navigator = useMemo(
    () => ({
    push: (to: any, state?: any) => {
      // No-op: Next.js handles routing
    },
    replace: (to: any, state?: any) => {
      // No-op: Next.js handles routing
    },
    go: (delta: number) => {
      if (typeof window !== 'undefined') {
        window.history.go(delta);
      }
    },
    createHref: (to: any) => {
      const href = typeof to === 'string' ? to : to.pathname + (to.search || '');
      return href;
    },
  }),
  []);

  return (
    <Router location={location} navigator={navigator} basename={undefined}>
      {children}
    </Router>
  );
}

export function Providers({ children }: { children: any }) {
  useEffect(() => {
    // Apply theme on client mount
    applyTheme(theme);
  }, []);

  return (
    <RouterWrapper>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              {children}
              <ToastStack />
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </RouterWrapper>
  );
}
