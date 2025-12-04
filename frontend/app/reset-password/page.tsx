'use client';

import { ResetPasswordPage } from '@/spa-pages/ResetPasswordPage';
import { ClientOnly } from '../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function ResetPassword() {
  return (
    <ClientOnly>
      <ResetPasswordPage />
    </ClientOnly>
  );
}
