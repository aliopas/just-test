'use client';

import { InvestorNewsDetailPage } from '@/pages/InvestorNewsDetailPage';
import { ClientOnly } from '@/app/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function NewsDetail() {
  return (
    <ClientOnly>
      <InvestorNewsDetailPage />
    </ClientOnly>
  );
}

