'use client';

import { RegisterPage } from '@/spa-pages/RegisterPage';
import { ClientOnly } from '../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function Register() {
  return (
    <ClientOnly>
      <RegisterPage />
    </ClientOnly>
  );
}
