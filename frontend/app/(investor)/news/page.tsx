'use client';

import { InvestorNewsListPage } from '@/pages/InvestorNewsListPage';
import { ClientOnly } from '@/app/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function News() {
  return (
    <ClientOnly>
      <InvestorNewsListPage />
    </ClientOnly>
  );
}

