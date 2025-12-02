'use client';

import { AdminAuditLogPage } from '@/pages/AdminAuditLogPage';
import { ClientOnly } from '@/app/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminAudit() {
  return (
    <ClientOnly>
      <AdminAuditLogPage />
    </ClientOnly>
  );
}

