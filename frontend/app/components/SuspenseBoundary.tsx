'use client';

import { Suspense, ReactNode } from 'react';
import { palette } from '@/styles/theme';

interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingText?: string;
}

export function SuspenseBoundary({
  children,
  fallback,
  loadingText = 'جاري التحميل...',
}: SuspenseBoundaryProps) {
  const defaultFallback = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        padding: '2rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: `3px solid ${palette.neutralBorder}`,
            borderTopColor: palette.brandPrimaryStrong,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p
          style={{
            color: palette.textSecondary,
            fontSize: '0.9rem',
          }}
        >
          {loadingText}
        </p>
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

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}

