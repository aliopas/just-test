'use client';

import { AdminProjectsPage } from '@/spa-pages/AdminProjectsPage';
import { ClientOnly } from '../../../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminProjects() {
  return (
    <ClientOnly>
      <AdminProjectsPage />
    </ClientOnly>
  );
}

