'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ClientOnly } from '../components/ClientOnly';

export const dynamic = 'force-dynamic';

function RedirectComponent() {
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (user?.role === 'admin') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/dashboard');
    }
  }, [user, router]);
  
  return null;
}

export default function InvestorRoot() {
  return (
    <ClientOnly>
      <RedirectComponent />
    </ClientOnly>
  );
}

