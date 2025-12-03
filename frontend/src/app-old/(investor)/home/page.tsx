'use client';

import { HomePage } from '@/pages/HomePage';
import { ClientOnly } from '@/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <ClientOnly>
      <HomePage />
    </ClientOnly>
  );
}

