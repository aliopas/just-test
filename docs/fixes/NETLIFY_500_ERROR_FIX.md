# إصلاح خطأ 500 على Netlify - الصفحة الرئيسية

## المشكلة

```
GET https://investor-bacura.netlify.app/ 500 (Internal Server Error)
```

الصفحة الرئيسية على Netlify تُعيد خطأ 500 Internal Server Error.

## السبب

1. **مشاكل Server-Side Rendering (SSR):**
   - `PublicLandingPage` يستخدم hooks مثل `usePublicCompanyProfiles` وغيرها التي تستخدم React Query
   - هذه الـ hooks لا تعمل بشكل صحيح في SSR على Netlify
   - على Netlify، يحاول Next.js تصيير الصفحة على الخادم أولاً، مما يسبب خطأ

2. **استخدام `react-router-dom` مع Next.js:**
   - `PublicLandingPage.tsx` يستخدم `Link` من `react-router-dom`
   - Next.js يستخدم نظام routing مختلف (`next/link`)

## الحل المطبق

تم استخدام **Dynamic Import** مع **SSR Disabled** في `frontend/app/page.tsx`:

```typescript
import dynamicImport from 'next/dynamic';

const PublicLandingPage = dynamicImport(
  () => import('@/pages/PublicLandingPage').then((mod) => ({ default: mod.PublicLandingPage })),
  {
    ssr: false, // Disable SSR completely to prevent server-side errors
    loading: () => <LoadingFallback />,
  }
);
```

### التغييرات في `frontend/app/page.tsx`:

1. ✅ استخدام `dynamicImport` بدلاً من import عادي
2. ✅ تعطيل SSR تماماً (`ssr: false`)
3. ✅ إضافة `loading` fallback للعرض أثناء التحميل
4. ✅ الحفاظ على `ClientOnly` wrapper كطبقة حماية إضافية

## النتيجة المتوقعة

بعد النشر على Netlify:
- ✅ الصفحة الرئيسية ستُصير فقط على Client Side
- ✅ لن تحدث أخطاء SSR على Netlify
- ✅ `PublicLandingPage` سيعمل بشكل صحيح مع React Query hooks

## ملاحظات

1. **الأداء:**
   - Dynamic import يعني أن `PublicLandingPage` سيُحمّل فقط عند الحاجة
   - هذا قد يقلل حجم الـ bundle الأولي

2. **SEO:**
   - تعطيل SSR يعني أن محتوى الصفحة لن يكون متاحاً في الـ HTML الأولي
   - إذا كان SEO مهم، قد نحتاج إلى حلول أخرى (مثل Static Site Generation مع data fetching على Client)

3. **مستقبلاً:**
   - قد نحتاج إلى استبدال `react-router-dom` بـ Next.js navigation
   - هذا سيحسن التوافق مع Next.js

## التحقق من الإصلاح

بعد النشر:
1. افتح `https://investor-bacura.netlify.app/`
2. تحقق من عدم وجود خطأ 500
3. تحقق من أن الصفحة تُحمّل بشكل صحيح
4. افتح Developer Tools > Network وتحقق من أن الطلبات تعمل

## الملفات المعدلة

- ✅ `frontend/app/page.tsx` - إضافة dynamic import مع ssr: false

## المراجع

- [Next.js Dynamic Imports](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading#with-dynamic-imports)
- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Netlify Next.js Deployment](https://docs.netlify.com/integrations/frameworks/nextjs/)

