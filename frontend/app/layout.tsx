import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Arabic } from 'next/font/google';
import { ClientProviders } from './components/ClientProviders';
import '@/styles/global.css';
import '@/styles/responsive.css';

// Safely construct metadataBase URL to avoid runtime errors if env is misconfigured
function getMetadataBase(): URL | undefined {
  const fallback = 'https://investor-bacura.netlify.app';
  const rawBase = process.env.NEXT_PUBLIC_SITE_URL || fallback;

  try {
    return new URL(rawBase);
  } catch (error) {
    console.error('[metadataBase] Invalid NEXT_PUBLIC_SITE_URL value:', rawBase);
    try {
      return new URL(fallback);
    } catch {
      // As a last resort, skip metadataBase to prevent crashing the app
      return undefined;
    }
  }
}

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
  // If getMetadataBase returns undefined, Next.js will omit metadataBase instead of throwing
  ...(getMetadataBase() && { metadataBase: getMetadataBase() }),
  title: 'شركاء باكورة',
  description: 'منصة آمنة لإدارة طلبات الاستثمار ومتابعة أداء المحفظة والاطلاع على آخر الأخبار والرؤى السوقية.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: 'any', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    title: 'شركاء باكورة - Bakurah Partners',
    description: 'منصة آمنة لإدارة طلبات الاستثمار ومتابعة أداء المحفظة والاطلاع على آخر الأخبار والرؤى السوقية.',
    images: [
      {
        url: '/og-image.png', // Logo image for social media sharing
        width: 1200,
        height: 630,
        alt: 'باكورة التقنيات - BACURA / TEC',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'شركاء باكورة - Bakurah Partners',
    description: 'منصة آمنة لإدارة طلبات الاستثمار ومتابعة أداء المحفظة والاطلاع على آخر الأخبار والرؤى السوقية.',
    images: ['/og-image.png'], // Logo image for Twitter sharing
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

export default function RootLayout({ children }: any) {
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
