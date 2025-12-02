'use client';

import dynamicImport from 'next/dynamic'; // Renamed to avoid conflict with export const dynamic
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

// Dynamic import with SSR disabled - loads entire page content client-side only
// This prevents all SSR issues with hooks, contexts, and react-router-dom
const RootPageContent = dynamicImport(
  () => import('./components/RootPageContent').then((mod) => ({ default: mod.RootPageContent })),
  {
    ssr: false, // Disable SSR completely to prevent server-side errors
    loading: () => <LoadingFallback />,
  }
);

export default function RootPage() {
  return <RootPageContent />;
}
