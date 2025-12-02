'use client';

import { AdminReportsPage } from '@/pages/AdminReportsPage';
import { ClientOnly } from '@/app/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminReports() {
  return (
    <ClientOnly>
      <AdminReportsPage />
    </ClientOnly>
  );
}

