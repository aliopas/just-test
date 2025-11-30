import type { Metadata } from 'next';
import { Providers } from './components/Providers';
import '@/styles/global.css';
import '@/styles/responsive.css';

export const metadata: Metadata = {
  title: 'شركاء باكورة',
  description: 'منصة آمنة لإدارة طلبات الاستثمار ومتابعة أداء المحفظة والاطلاع على آخر الأخبار والرؤى السوقية.',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: [
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    title: 'شركاء باكورة - Bakurah Partners',
    description: 'منصة آمنة لإدارة طلبات الاستثمار ومتابعة أداء المحفظة والاطلاع على آخر الأخبار والرؤى السوقية.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'شركاء باكورة - Bakurah Partners',
    description: 'منصة آمنة لإدارة طلبات الاستثمار ومتابعة أداء المحفظة والاطلاع على آخر الأخبار والرؤى السوقية.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__ENV__ = {
                API_BASE_URL: ${JSON.stringify(process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1')},
                SUPABASE_STORAGE_URL: ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL || '')},
                SUPABASE_URL: ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || '')},
                SUPABASE_ANON_KEY: ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')}
              };
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <div id="drawer-root"></div>
      </body>
    </html>
  );
}
