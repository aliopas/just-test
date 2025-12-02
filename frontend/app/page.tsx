'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PublicLandingPage } from '@/pages/PublicLandingPage';
import { ClientOnly } from './components/ClientOnly';
import { useAuth } from '@/context/AuthContext';

export const dynamic = 'force-dynamic';

function RootPageContent() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/home');
      }
    }
  }, [isAuthenticated, user, router]);

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return <PublicLandingPage />;
}

export default function RootPage() {
  return (
    <ClientOnly>
      <RootPageContent />
    </ClientOnly>
  );
}
