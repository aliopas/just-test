'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { PublicLandingPage } from '@/pages/PublicLandingPage';
import { ClientOnly } from './components/ClientOnly';
import { useAuth } from '@/context/AuthContext';
import { palette } from '@/styles/theme';

export const dynamic = 'force-dynamic';

function LoadingFallback() {
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

function RootPageContent() {
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
    return <LoadingFallback />; // Will redirect
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <PublicLandingPage />
    </Suspense>
  );
}

export default function RootPage() {
  return (
    <ClientOnly>
      <RootPageContent />
    </ClientOnly>
  );
}
