'use client';

import { InvestorDashboardPage } from '@/pages/InvestorDashboardPage';
import { ClientOnly } from '@/app/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  return (
    <ClientOnly>
      <InvestorDashboardPage />
    </ClientOnly>
  );
}

