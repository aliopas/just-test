'use client';

import { InvestorDashboardPage } from '@/spa-pages/InvestorDashboardPage';
import { ClientOnly } from '../../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  return (
    <ClientOnly>
      <InvestorDashboardPage />
    </ClientOnly>
  );
}


