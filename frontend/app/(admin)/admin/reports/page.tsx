'use client';

import { AdminReportsPage } from '@/spa-pages/AdminReportsPage';
import { ClientOnly } from '../../../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminReports() {
  return (
    <ClientOnly>
      <AdminReportsPage />
    </ClientOnly>
  );
}

