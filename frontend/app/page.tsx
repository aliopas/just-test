'use client';

import { useEffect } from 'react';
import nextDynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { palette } from '@/styles/theme';

// Force dynamic rendering to avoid static generation issues on Netlify
export const dynamic = 'force-dynamic';

function LoadingSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        background: palette.backgroundBase,
      }}
    >
      <div
        className="spinner"
        style={{
          width: '48px',
          height: '48px',
          border: `4px solid ${palette.neutralBorder}`,
          borderTopColor: palette.brandPrimaryStrong,
          borderRadius: '50%',
        }}
      />
    </div>
  );
}

// Public landing page (client only)
const PublicLandingPage = nextDynamic(() => import('@/spa-pages/PublicLandingPage'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

export default function RootPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // If المستخدم مسجل دخول، نعيد توجيهه مباشرة للوحة التحكم المناسبة
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  // أثناء التوجيه، نعرض سبينر بسيط
  if (isAuthenticated) {
    return <LoadingSpinner />;
  }

  // للمستخدمين غير المسجلين، نعرض صفحة الهبوط العامة
  return <PublicLandingPage />;
}
