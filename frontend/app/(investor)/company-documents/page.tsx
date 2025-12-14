'use client';

import { InvestorCompanyDocumentsPage } from '@/spa-pages/InvestorCompanyDocumentsPage';
import { ClientOnly } from '../../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function CompanyDocuments() {
  return (
    <ClientOnly>
      <InvestorCompanyDocumentsPage />
    </ClientOnly>
  );
}

