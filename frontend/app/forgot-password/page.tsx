'use client';

import { ForgotPasswordPage } from '@/spa-pages/ForgotPasswordPage';
import { ClientOnly } from '../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function ForgotPassword() {
  return (
    <ClientOnly>
      <ForgotPasswordPage />
    </ClientOnly>
  );
}

