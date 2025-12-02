'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { ClientOnly } from './ClientOnly';

// Loading fallback component
function ProvidersLoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        background: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }}
        />
        <p style={{ fontSize: '1rem', color: '#6b7280' }}>جاري التحميل...</p>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `,
        }}
      />
    </div>
  );
}

// Dynamic import Providers to prevent SSR errors
// This ensures Providers only loads on client-side
const Providers = dynamic(
  () => import('./Providers').then((mod) => ({ default: mod.Providers })),
  {
    ssr: false, // Disable SSR completely for Providers
    loading: () => <ProvidersLoadingFallback />, // Show loading instead of null
  }
);

export function ProvidersWrapper({ children }: { children: ReactNode }) {
  // Double protection: ClientOnly + dynamic import with ssr: false
  return (
    <ClientOnly>
      <Providers>{children}</Providers>
    </ClientOnly>
  );
}

