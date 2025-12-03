'use client';

import React, { Suspense } from 'react';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { ClientOnly } from '@/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  return (
    <ClientOnly>
      <Suspense fallback={<div>Loading...</div>}>
        <AdminDashboardPage />
      </Suspense>
    </ClientOnly>
  );
}

