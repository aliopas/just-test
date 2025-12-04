'use client';

import { InvestorNewsDetailPage } from '@/spa-pages/InvestorNewsDetailPage';
import { ClientOnly } from '../../../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function NewsDetail() {
  return (
    <ClientOnly>
      <InvestorNewsDetailPage />
    </ClientOnly>
  );
}

