'use client';

import { RegisterPage } from '@/pages/RegisterPage';
import { ClientOnly } from '@/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function Register() {
  return (
    <ClientOnly>
      <RegisterPage />
    </ClientOnly>
  );
}

