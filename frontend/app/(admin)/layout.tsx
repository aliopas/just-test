'use client';

import { AdminSidebarNav } from '@/components/navigation/AdminSidebarNav';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { palette } from '@/styles/theme';

export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: palette.backgroundBase,
        }}
      >
        <AdminSidebarNav />
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
        </div>
      </div>
    </ProtectedRoute>
  );
}


