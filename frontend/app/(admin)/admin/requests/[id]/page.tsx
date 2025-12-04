'use client';

import { AdminRequestDetailPage } from '@/spa-pages/AdminRequestDetailPage';
import { ClientOnly } from '../../../../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminRequestDetail() {
  return (
    <ClientOnly>
      <AdminRequestDetailPage />
    </ClientOnly>
  );
}

