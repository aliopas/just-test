'use client';

import { InvestorRequestDetailPage } from '@/spa-pages/InvestorRequestDetailPage';
import { ClientOnly } from '../../../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function RequestDetail() {
  return (
    <ClientOnly>
      <InvestorRequestDetailPage />
    </ClientOnly>
  );
}

