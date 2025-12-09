'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ClientOnly } from '../components/ClientOnly';

function AuthRedirect() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  return null;
}

export default function MiddlewareRedirect() {
  return (
    <ClientOnly>
      <AuthRedirect />
    </ClientOnly>
  );
}

