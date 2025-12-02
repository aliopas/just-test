'use client';

import { useEffect } from 'react';
import dynamicImport from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { palette } from '@/styles/theme';

// Dynamic import with SSR disabled
const PublicLandingPage = dynamicImport(
  () => import('@/pages/PublicLandingPage').then((mod) => ({ default: mod.PublicLandingPage })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          width: '100%',
          background: palette.backgroundBase,
        }}
      >
        <div
          className="spinner"
          style={{
            width: '48px',
            height: '48px',
            border: `4px solid ${palette.neutralBorder}`,
            borderTopColor: palette.brandPrimaryStrong,
            borderRadius: '50%',
          }}
        />
      </div>
    ),
  }
);

function LoadingSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        background: palette.backgroundBase,
      }}
    >
      <div
        className="spinner"
        style={{
          width: '48px',
          height: '48px',
          border: `4px solid ${palette.neutralBorder}`,
          borderTopColor: palette.brandPrimaryStrong,
          borderRadius: '50%',
        }}
      />
    </div>
  );
}

export function RootPageClient() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/home');
      }
    }
  }, [isAuthenticated, user, router]);

  if (isAuthenticated) {
    return <LoadingSpinner />; // Will redirect
  }

  return <PublicLandingPage />;
}

