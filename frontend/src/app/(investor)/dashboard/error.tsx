'use client';

import React, { useEffect } from 'react';
import { palette } from '@/styles/theme';

export const dynamic = 'force-dynamic';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: '2rem',
        background: palette.backgroundBase,
      }}
    >
      <div
        style={{
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: palette.textPrimary,
            marginBottom: '1rem',
          }}
        >
          خطأ في تحميل لوحة التحكم
        </h2>
        <p
          style={{
            fontSize: '0.9rem',
            color: palette.textSecondary,
            marginBottom: '1.5rem',
          }}
        >
          {error.message || 'حدث خطأ أثناء تحميل البيانات'}
        </p>
        <button
          onClick={reset}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: palette.backgroundBase,
            background: palette.brandPrimaryStrong,
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}

