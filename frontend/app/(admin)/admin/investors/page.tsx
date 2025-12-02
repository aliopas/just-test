'use client';

import { AdminInvestorsPage } from '@/pages/AdminInvestorsPage';
import { ClientOnly } from '@/app/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminInvestors() {
  return (
    <ClientOnly>
      <AdminInvestorsPage />
    </ClientOnly>
  );
}

