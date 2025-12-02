# Next.js Features Implementation

هذا الملف يوثق جميع ميزات Next.js المستخدمة في المشروع.

## الميزات المطبقة

### 1. App Router
- استخدام App Router بدلاً من Pages Router
- هيكل المجلدات: `app/` يحتوي على جميع الصفحات والمسارات
- Route Groups: `(admin)` و `(investor)` لتنظيم الصفحات

### 2. Image Optimization
- استخدام `next/image` لتحسين الصور تلقائياً
- مكون `OptimizedImage` الذي يستخدم `next/image` داخلياً
- دعم الصور من Supabase Storage
- تحسينات تلقائية: WebP/AVIF، lazy loading، responsive images

### 3. Loading States
- `loading.tsx` في المجلدات الرئيسية
- Suspense boundaries لتحسين تجربة المستخدم
- مكون `SuspenseBoundary` قابل لإعادة الاستخدام

### 4. Error Handling
- `error.tsx` للتعامل مع الأخطاء
- Error boundaries على مستوى الصفحات
- رسائل خطأ واضحة بالعربية

### 5. Not Found Pages
- `not-found.tsx` للصفحات غير الموجودة (404)
- تصميم متسق مع باقي التطبيق

### 6. API Routes (Route Handlers)
- `/api/health` - للتحقق من حالة الخادم
- `/api/revalidate` - لإعادة التحقق من البيانات (revalidation)

### 7. Server Actions
- `app/actions/server-actions.ts` - إجراءات الخادم للمهام الشائعة
- إعادة التحقق من البيانات: `revalidateNews`, `revalidateProjects`, إلخ

### 8. Metadata API
- Metadata في `layout.tsx` الرئيسي
- SEO محسّن مع Open Graph و Twitter Cards
- Viewport configuration

### 9. Sitemap & Robots
- `sitemap.ts` - خريطة الموقع تلقائياً
- `robots.ts` - إرشادات لمحركات البحث

### 10. Manifest (PWA)
- `manifest.ts` - دعم Progressive Web App
- إعدادات PWA كاملة

### 11. Middleware
- `middleware.ts` - معالجة الطلبات قبل الوصول للصفحات
- التحقق من المصادقة
- إعادة التوجيه حسب الحالة

### 12. Font Optimization
- استخدام `next/font/google` لتحسين الخطوط
- دعم الخطوط العربية (Noto Sans Arabic)
- دعم الخطوط الإنجليزية (Inter)

### 13. Configuration Enhancements
- تحسينات في `next.config.js`:
  - Image optimization settings
  - Package import optimization
  - Server Actions configuration
  - Compiler optimizations

### 14. Utility Functions
- `app/lib/utils.ts` - دوال مساعدة:
  - `generateMetadata` - إنشاء metadata ديناميكي
  - `formatDate` - تنسيق التواريخ
  - `formatCurrency` - تنسيق العملات
  - `debounce` - تأخير تنفيذ الدوال
  - `cn` - دمج class names

## الاستخدام

### استخدام OptimizedImage
```tsx
import { OptimizedImage } from '@/app/components/OptimizedImage';

<OptimizedImage
  src={imageUrl}
  alt="وصف الصورة"
  aspectRatio={16/9}
  priority={false}
/>
```

### استخدام Suspense
```tsx
import { SuspenseBoundary } from '@/app/components/SuspenseBoundary';

<SuspenseBoundary loadingText="جاري التحميل...">
  <YourComponent />
</SuspenseBoundary>
```

### استخدام Server Actions
```tsx
'use client';

import { revalidateNews } from '@/app/actions/server-actions';

async function handleRefresh() {
  await revalidateNews();
  // البيانات ستُحدّث تلقائياً
}
```

### استخدام Route Handlers
```tsx
// في app/api/your-route/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello' });
}

export async function POST(request: Request) {
  const data = await request.json();
  return NextResponse.json({ received: data });
}
```

## أفضل الممارسات

1. **استخدم Server Components عندما يكون ذلك ممكناً** - تقلل من حجم JavaScript المرسل للعميل
2. **استخدم Suspense** - لتحسين تجربة التحميل
3. **استخدم next/image** - لتحسين الصور تلقائياً
4. **أضف Metadata** - لكل صفحة لتحسين SEO
5. **استخدم Server Actions** - للمهام التي تحتاج للخادم
6. **استخدم Route Handlers** - لإنشاء API endpoints

## الخطوات التالية

- [ ] تحويل المزيد من المكونات إلى Server Components
- [ ] إضافة Streaming SSR
- [ ] إضافة ISR (Incremental Static Regeneration) حيثما أمكن
- [ ] تحسين caching strategies
- [ ] إضافة المزيد من Server Actions

