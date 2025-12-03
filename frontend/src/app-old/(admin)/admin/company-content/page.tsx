'use client';

import { AdminCompanyContentPage } from '@/pages/AdminCompanyContentPage';
import { ClientOnly } from '@/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminCompanyContent() {
  return (
    <ClientOnly>
      <AdminCompanyContentPage />
    </ClientOnly>
  );
}

