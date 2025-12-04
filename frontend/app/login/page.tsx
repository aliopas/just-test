'use client';

import { LoginPage } from '@/spa-pages/LoginPage';
import { ClientOnly } from '../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function Login() {
  return (
    <ClientOnly>
      <LoginPage />
    </ClientOnly>
  );
}
