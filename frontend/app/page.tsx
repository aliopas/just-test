'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PublicLandingPage from '@/spa-pages/PublicLandingPage';
import { ClientOnly } from './components/ClientOnly';
import { useAuth } from '@/context/AuthContext';

// Keep page dynamic to avoid caching auth state
export const dynamic = 'force-dynamic';

function HomePageContent() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is logged in, redirect to dashboard automatically (Feature from the conflicting page)
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  // While checking or if not logged in, show the Landing Page
  // We don't want to show a blank screen while redirecting, so showing the LP is fine
  return <PublicLandingPage />;
}

export default function RootPage() {
  return (
    <ClientOnly>
      <HomePageContent />
    </ClientOnly>
  );
}

