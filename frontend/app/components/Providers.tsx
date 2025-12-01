'use client';

import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
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

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply theme on client mount
    applyTheme(theme);
  }, []);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
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
    </BrowserRouter>
  );
}
