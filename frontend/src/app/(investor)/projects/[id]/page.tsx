'use client';

import { InvestorProjectDetailPage } from '@/pages/InvestorProjectDetailPage';
import { ClientOnly } from '@/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function ProjectDetail() {
  return (
    <ClientOnly>
      <InvestorProjectDetailPage />
    </ClientOnly>
  );
}

