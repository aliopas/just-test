'use client';

import { AdminProjectsPage } from '@/pages/AdminProjectsPage';
import { ClientOnly } from '@/app/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminProjects() {
  return (
    <ClientOnly>
      <AdminProjectsPage />
    </ClientOnly>
  );
}

