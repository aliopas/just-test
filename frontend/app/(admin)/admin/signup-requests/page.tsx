'use client';

import { AdminSignupRequestsPage } from '@/pages/AdminSignupRequestsPage';
import { ClientOnly } from '../../../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminSignupRequests() {
  return (
    <ClientOnly>
      <AdminSignupRequestsPage />
    </ClientOnly>
  );
}

