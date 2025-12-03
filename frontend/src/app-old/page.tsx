'use client';

import { RootPageClient } from './components/RootPageClient';
import { ClientOnly } from '@/components/ClientOnly';

export default function RootPage() {
  return (
    <ClientOnly>
      <RootPageClient />
    </ClientOnly>
  );
}

