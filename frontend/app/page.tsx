'use client';

import PublicLandingPage from '@/spa-pages/PublicLandingPage';

// نسمح لصفحة الهبوط بالاستعلام مباشرة من Supabase عبر الـ hooks الداخلية
// بدون أي إعادة توجيه أو تحقق من الحالة من الـ backend
export const dynamic = 'force-dynamic';

export default function RootPage() {
  return <PublicLandingPage />;
}
