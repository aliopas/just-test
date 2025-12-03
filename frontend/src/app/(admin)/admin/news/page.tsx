'use client';

import { AdminNewsPage } from '@/pages/AdminNewsPage';
import { ClientOnly } from '@/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminNews() {
  return (
    <ClientOnly>
      <AdminNewsPage />
    </ClientOnly>
  );
}

