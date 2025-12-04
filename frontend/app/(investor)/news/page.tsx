'use client';

import { InvestorNewsListPage } from '@/spa-pages/InvestorNewsListPage';
import { ClientOnly } from '../../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function News() {
  return (
    <ClientOnly>
      <InvestorNewsListPage />
    </ClientOnly>
  );
}