'use client';

import { AdminInvestorsPage } from '@/spa-pages/AdminInvestorsPage';
import { ClientOnly } from '../../../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminInvestors() {
  return (
    <ClientOnly>
      <AdminInvestorsPage />
    </ClientOnly>
  );
}

