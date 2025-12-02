'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { ClientOnly } from './ClientOnly';

// Dynamic import Providers to prevent SSR errors
// This ensures Providers only loads on client-side
const Providers = dynamic(
  () => import('./Providers').then((mod) => ({ default: mod.Providers })),
  {
    ssr: false, // Disable SSR completely for Providers
    loading: () => null, // Return null while loading to prevent layout shift
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

