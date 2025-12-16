'use client';

import { InvestorSidebarNav } from '@/components/navigation/InvestorSidebarNav';
import { AppFooter } from '@/components/AppFooter';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { palette } from '@/styles/theme';

export const dynamic = 'force-dynamic';

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="investor">
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: palette.backgroundBase,
        }}
      >
        <InvestorSidebarNav />
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          <main
            id="main-content"
            style={{
              flex: 1,
              padding: '2rem',
              minWidth: 0,
            }}
          >
            {children}
          </main>
          <AppFooter />
        </div>
      </div>
    </ProtectedRoute>
  );
}


