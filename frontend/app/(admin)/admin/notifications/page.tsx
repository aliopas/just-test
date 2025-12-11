'use client';

import { NotificationsPage } from '@/spa-pages/NotificationsPage';
import { ClientOnly } from '../../../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function AdminNotifications() {
  return (
    <ClientOnly>
      <NotificationsPage />
    </ClientOnly>
  );
}

