'use client';

import { AdminRequestDetailPage } from '@/pages/AdminRequestDetailPage';
import { ClientOnly } from '@/app/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminRequestDetail() {
  return (
    <ClientOnly>
      <AdminRequestDetailPage />
    </ClientOnly>
  );
}

