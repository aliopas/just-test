'use client';

import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { ClientOnly } from '@/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  return (
    <ClientOnly>
      <AdminDashboardPage />
    </ClientOnly>
  );
}

