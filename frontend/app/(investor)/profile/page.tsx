'use client';

import { ProfilePage } from '@/spa-pages/ProfilePage';
import { ClientOnly } from '../../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function Profile() {
  return (
    <ClientOnly>
      <ProfilePage />
    </ClientOnly>
  );
}

