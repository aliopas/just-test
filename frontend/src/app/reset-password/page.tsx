'use client';

import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { ClientOnly } from '@/components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function ResetPassword() {
  return (
    <ClientOnly>
      <ResetPasswordPage />
    </ClientOnly>
  );
}

