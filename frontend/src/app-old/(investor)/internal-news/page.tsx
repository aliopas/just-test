'use client';

import { InvestorInternalNewsPage } from '@/pages/InvestorInternalNewsPage';
import { ClientOnly } from '@/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function InternalNews() {
  return (
    <ClientOnly>
      <InvestorInternalNewsPage />
    </ClientOnly>
  );
}

