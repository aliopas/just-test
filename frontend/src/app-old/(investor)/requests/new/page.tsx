'use client';

import { NewRequestPage } from '@/pages/NewRequestPage';
import { ClientOnly } from '@/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function NewRequest() {
  return (
    <ClientOnly>
      <NewRequestPage />
    </ClientOnly>
  );
}

