'use client';

import { MyRequestsPage } from '@/spa-pages/MyRequestsPage';
import { ClientOnly } from '../../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function Requests() {
  return (
    <ClientOnly>
      <MyRequestsPage />
    </ClientOnly>
  );
}

