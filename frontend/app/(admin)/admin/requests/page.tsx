'use client';

import { AdminRequestsInboxPage } from '@/pages/AdminRequestsInboxPage';
import { ClientOnly } from '../../../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminRequests() {
  return (
    <ClientOnly>
      <AdminRequestsInboxPage />
    </ClientOnly>
  );
}

