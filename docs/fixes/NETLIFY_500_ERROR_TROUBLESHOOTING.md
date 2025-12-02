# استكشاف أخطاء خطأ 500 على Netlify - دليل شامل

## الوضع الحالي

تم تطبيق الحل التالي في `frontend/app/page.tsx`:
- ✅ Dynamic import مع `ssr: false`
- ✅ `ClientOnly` wrapper
- ✅ `force-dynamic` export

## إذا كانت المشكلة لا تزال موجودة

### 1. التحقق من أن التغييرات نُشرت

```bash
# تحقق من أن التغييرات موجودة في Git
git status
git log --oneline -5

# تأكد من أن Netlify نشر آخر commit
```

### 2. التحقق من Build Logs على Netlify

1. اذهب إلى [Netlify Dashboard](https://app.netlify.com)
2. افتح مشروع `investor-bacura`
3. اذهب إلى **Deploys** > **Latest Deploy**
4. افتح **Build log**
5. ابحث عن أخطاء في:
   - Next.js build
   - TypeScript errors
   - Import errors

### 3. التحقق من Function Logs

1. اذهب إلى **Functions** في Netlify Dashboard
2. افتح function `server`
3. تحقق من **Logs** للأخطاء

### 4. المشاكل المحتملة الإضافية

#### أ. مشكلة في `AuthContext` على SSR

إذا كان `useAuth()` يحاول الوصول إلى localStorage في SSR:

**الحل:** تأكد من أن `AuthContext` يعمل فقط على Client Side:

```typescript
// في AuthContext.tsx
if (typeof window === 'undefined') {
  // Return default values on server
  return { isAuthenticated: false, user: null };
}
```

#### ب. مشكلة في `useRouter` من Next.js

`useRouter` من `next/navigation` يجب أن يعمل في Client Components فقط.

**التحقق:** تأكد من أن `'use client'` موجود في بداية الملف.

#### ج. مشكلة في Environment Variables

تحقق من أن جميع Environment Variables موجودة على Netlify:

1. اذهب إلى **Site settings** > **Environment variables**
2. تأكد من وجود:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_BASE_URL` (اختياري - سيستخدم `/api/v1` كافتراضي)

#### د. مشكلة في Next.js Build

تحقق من أن البناء نجح:

```bash
# محلياً
cd frontend
npm run build

# ابحث عن أخطاء
```

### 5. حلول إضافية

#### الحل 1: إضافة Error Boundary

```typescript
// frontend/app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

#### الحل 2: تبسيط Root Page

إذا استمرت المشكلة، يمكن تبسيط الصفحة الرئيسية:

```typescript
'use client';

import dynamicImport from 'next/dynamic';
import { ClientOnly } from './components/ClientOnly';

const PublicLandingPage = dynamicImport(
  () => import('@/pages/PublicLandingPage').then((mod) => ({ default: mod.PublicLandingPage })),
  { ssr: false, loading: () => <div>Loading...</div> }
);

export default function RootPage() {
  return (
    <ClientOnly>
      <PublicLandingPage />
    </ClientOnly>
  );
}
```

#### الحل 3: استخدام Static Export (إذا لم يكن SSR مطلوباً)

في `next.config.js`:

```javascript
module.exports = {
  output: 'export', // Static export only
  // ...
};
```

## خطوات التشخيص

1. ✅ **التحقق من Build Logs**
   - ابحث عن أخطاء TypeScript
   - ابحث عن أخطاء Import
   - ابحث عن أخطاء Build

2. ✅ **التحقق من Function Logs**
   - ابحث عن أخطاء runtime
   - ابحث عن أخطاء في API calls

3. ✅ **التحقق من Browser Console**
   - افتح Developer Tools
   - تحقق من Console للأخطاء
   - تحقق من Network للأخطاء

4. ✅ **التحقق من Network Tab**
   - افتح Network tab
   - ابحث عن طلبات فاشلة
   - تحقق من Status codes

## سجلات للتحقق منها

### على Netlify Dashboard:

1. **Deploy Logs:**
   - Build errors
   - TypeScript errors
   - Missing dependencies

2. **Function Logs:**
   - Runtime errors
   - API errors
   - Database connection errors

3. **Site Logs:**
   - Request logs
   - Error logs

### في Browser:

1. **Console:**
   - JavaScript errors
   - React errors
   - Import errors

2. **Network:**
   - Failed requests
   - 500 errors
   - CORS errors

## التحقق من الإصلاح

بعد تطبيق أي حل:

1. ✅ انتظر حتى يكتمل Deploy على Netlify
2. ✅ افتح `https://investor-bacura.netlify.app/`
3. ✅ تحقق من عدم وجود خطأ 500
4. ✅ افتح Developer Tools > Console
5. ✅ تحقق من عدم وجود أخطاء JavaScript

## إذا استمرت المشكلة

1. **شارك معلومات:**
   - Build logs من Netlify
   - Function logs من Netlify
   - Console errors من Browser
   - Network errors من Browser

2. **تحقق من:**
   - Next.js version compatibility
   - Node.js version على Netlify
   - Package dependencies

## الملفات المرجعية

- `frontend/app/page.tsx` - الصفحة الرئيسية
- `frontend/app/components/ClientOnly.tsx` - Client-only wrapper
- `frontend/app/components/Providers.tsx` - Context providers
- `docs/fixes/NETLIFY_500_ERROR_FIX.md` - الحل المطبق

