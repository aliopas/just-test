'use client';

import { AdminRequestDetailPage } from '@/pages/AdminRequestDetailPage';
import { ClientOnly } from '@/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminRequestDetail() {
  return (
    <ClientOnly>
      <AdminRequestDetailPage />
    </ClientOnly>
  );
}

