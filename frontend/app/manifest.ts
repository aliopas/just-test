import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'شركاء باكورة - Bakurah Partners',
    short_name: 'باكورة',
    description: 'منصة آمنة لإدارة طلبات الاستثمار ومتابعة أداء المحفظة',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    lang: 'ar',
    dir: 'rtl',
  };
}

