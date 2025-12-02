# Netlify 500 Error Analysis - Root Page

## المشكلة

```
GET https://investor-bacura.netlify.app/ 500 (Internal Server Error)
```

الصفحة الرئيسية على Netlify تُعيد خطأ 500.

## التحليل

### الأسباب المحتملة:

1. **استخدام `react-router-dom` مع Next.js:**
   - `PublicLandingPage.tsx` يستخدم `Link` من `react-router-dom`
   - Next.js يستخدم نظام routing مختلف ويحتاج `next/link` أو `next/navigation`

2. **مشاكل Server-Side Rendering (SSR):**
   - `PublicLandingPage` يستخدم hooks مثل `usePublicCompanyProfiles` وغيرها
   - هذه الـ hooks تستخدم React Query التي قد تفشل في SSR
   - على Netlify، قد يحاول Next.js تصيير الصفحة على الخادم أولاً

3. **مشاكل مع ClientOnly:**
   - الكود الحالي يستخدم `ClientOnly` wrapper
   - لكن قد لا يكون كافياً لمنع SSR errors

## الحل

### الحل 1: استخدام Dynamic Import مع SSR Disabled (الأفضل)

نستخدم `next/dynamic` مع `ssr: false` لضمان أن `PublicLandingPage` لا يُصير إلا على Client Side:

```typescript
'use client';

import dynamicImport from 'next/dynamic';
import { ClientOnly } from './components/ClientOnly';

const PublicLandingPage = dynamicImport(
  () => import('@/pages/PublicLandingPage').then((mod) => ({ default: mod.PublicLandingPage })),
  {
    ssr: false, // Disable SSR completely
    loading: () => <LoadingFallback />,
  }
);
```

### الحل 2: استبدال react-router-dom بـ Next.js Navigation

إذا كان `PublicLandingPage` يحتاج إلى navigation:
- استبدال `Link` من `react-router-dom` بـ `Link` من `next/link`
- أو استخدام `useRouter` و `usePathname` من `next/navigation`

### الحل 3: التأكد من أن جميع الـ Hooks تعمل على Client Side فقط

- التأكد من أن جميع data fetching hooks (React Query) تعمل فقط على Client Side
- استخدام `ClientOnly` wrapper أو dynamic import

## الخطوات التالية

1. ✅ تحليل المشكلة
2. ⏳ تطبيق الحل 1 (Dynamic Import)
3. ⏳ اختبار على Netlify
4. ⏳ التحقق من الـ logs على Netlify

## الملفات المتأثرة

- `frontend/app/page.tsx` - الصفحة الرئيسية
- `frontend/src/pages/PublicLandingPage.tsx` - مكون Landing Page
- `frontend/app/components/ClientOnly.tsx` - Wrapper لمنع SSR

## مراجع

- [Next.js Dynamic Imports](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading#with-dynamic-imports)
- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Netlify Next.js Deployment](https://docs.netlify.com/integrations/frameworks/nextjs/)

