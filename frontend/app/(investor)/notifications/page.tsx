'use client';

import { NotificationsPage } from '@/spa-pages/NotificationsPage';
import { ClientOnly } from '../../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function Notifications() {
  return (
    <ClientOnly>
      <NotificationsPage />
    </ClientOnly>
  );
}

