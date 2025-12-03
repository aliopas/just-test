import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Arabic } from 'next/font/google';
import { ClientProviders } from './components/ClientProviders';
import '@/styles/global.css';
import '@/styles/responsive.css';

// Optimize font loading - disable preload to prevent warnings
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-arabic',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: 'شركاء باكورة',
  description: 'منصة آمنة لإدارة طلبات الاستثمار ومتابعة أداء المحفظة والاطلاع على آخر الأخبار والرؤى السوقية.',
  manifest: '/manifest.json',
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563eb',
};

// Prevent static generation - force dynamic rendering
export const dynamic = 'force-dynamic';

// No SSR - all rendering happens on client side

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${inter.variable} ${notoSansArabic.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__ENV__ = {
                API_BASE_URL: ${JSON.stringify(process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1')},
                SUPABASE_STORAGE_URL: ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL || '')},
                SUPABASE_URL: ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || '')},
                SUPABASE_ANON_KEY: ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')},
                SUPABASE_PUBLISHABLE_DEFAULT_KEY: ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '')}
              };
            `,
          }}
        />
      </head>
      <body>
        {React.createElement(ClientProviders, null, children)}
        <div id="drawer-root"></div>
      </body>
    </html>
  );
}
