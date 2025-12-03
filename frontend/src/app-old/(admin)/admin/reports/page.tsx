'use client';

import React, { Suspense } from 'react';
import { AdminReportsPage } from '@/pages/AdminReportsPage';
import { ClientOnly } from '@/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminReports() {
  return (
    <ClientOnly>
      <Suspense fallback={<div>Loading...</div>}>
        <AdminReportsPage />
      </Suspense>
    </ClientOnly>
  );
}

