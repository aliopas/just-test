'use client';

import { PublicLandingPage } from '@/pages/PublicLandingPage';
import { ClientOnly } from './components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function RootPage() {
  return (
    <ClientOnly>
      <PublicLandingPage />
    </ClientOnly>
  );
}
