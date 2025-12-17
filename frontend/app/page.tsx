'use client';

import PublicLandingPage from '@/spa-pages/PublicLandingPage';

// نُبقي الصفحة ديناميكية لتجنب أي تخبئة تؤثر على بيانات Supabase
export const dynamic = 'force-dynamic';

export default function RootPage() {
  return <PublicLandingPage />;
}
