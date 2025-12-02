'use client';

import { NewRequestPage } from '@/pages/NewRequestPage';
import { ClientOnly } from '@/app/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function NewRequest() {
  return (
    <ClientOnly>
      <NewRequestPage />
    </ClientOnly>
  );
}

