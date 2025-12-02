'use client';

import { useEffect } from 'react';
import dynamicImport from 'next/dynamic'; // Renamed to avoid conflict with export const dynamic
import { useRouter } from 'next/navigation';
import { ClientOnly } from './components/ClientOnly';
import { useAuth } from '@/context/AuthContext';
import { palette } from '@/styles/theme';

export const dynamic = 'force-dynamic';

// Dynamic import with SSR disabled to prevent 500 errors on Netlify
// PublicLandingPage uses react-router-dom and React Query hooks that don't work in SSR
const PublicLandingPage = dynamicImport(
  () => import('@/pages/PublicLandingPage').then((mod) => ({ default: mod.PublicLandingPage })),
  {
    ssr: false, // Disable SSR completely to prevent server-side errors
    loading: () => <LoadingFallback />,
  }
);

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

  return <PublicLandingPage />;
}

export default function RootPage() {
  return (
    <ClientOnly>
      <RootPageContent />
    </ClientOnly>
  );
}
