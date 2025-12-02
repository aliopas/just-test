'use client';

import { Suspense } from 'react';
import { InvestorDashboardPage } from '@/pages/InvestorDashboardPage';
import { ClientOnly } from '../../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  return (
    <ClientOnly>
      <Suspense fallback={<div>جاري التحميل...</div>}>
        <InvestorDashboardPage />
      </Suspense>
    </ClientOnly>
  );
}

