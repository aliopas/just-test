'use client';

import { useEffect } from 'react';
import dynamicImport from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ClientOnly } from './components/ClientOnly';
import { useAuth } from '@/context/AuthContext';
import { palette } from '@/styles/theme';

// No SSR configuration - render only on client side

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

// Load entire page dynamically on client side only - no SSR
const RootPageClient = dynamicImport(
  () => import('./components/RootPageClient').then((mod) => ({ default: mod.RootPageClient })),
  {
    ssr: false,
    loading: () => <LoadingFallback />,
  }
);

export default function RootPage() {
  return (
    <ClientOnly>
      <RootPageClient />
    </ClientOnly>
  );
}
