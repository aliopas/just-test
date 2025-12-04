'use client';

import { VerifyOtpPage } from '@/spa-pages/VerifyOtpPage';
import { ClientOnly } from '../components/ClientOnly';

export const dynamic = 'force-dynamic';

export default function Verify() {
  return (
    <ClientOnly>
      <VerifyOtpPage />
    </ClientOnly>
  );
}
