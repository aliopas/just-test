'use client';

import { InvestorProjectsPage } from '@/spa-pages/InvestorProjectsPage';
import { ClientOnly } from '../../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function Projects() {
  return (
    <ClientOnly>
      <InvestorProjectsPage />
    </ClientOnly>
  );
}

