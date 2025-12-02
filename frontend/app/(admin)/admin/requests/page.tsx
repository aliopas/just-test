'use client';

import { AdminRequestsInboxPage } from '@/pages/AdminRequestsInboxPage';
import { ClientOnly } from '@/app/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminRequests() {
  return (
    <ClientOnly>
      <AdminRequestsInboxPage />
    </ClientOnly>
  );
}

