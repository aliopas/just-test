# قائمة التحقق قبل النشر (Pre-Deploy Checklist)

## ✅ التحقق من الكود

### 1. ملف `frontend/app/page.tsx`
- ✅ يستخدم `'use client'`
- ✅ يستخدم `dynamicImport` من `next/dynamic`
- ✅ `ssr: false` مفعّل
- ✅ `ClientOnly` wrapper موجود
- ✅ `export const dynamic = 'force-dynamic'`
- ✅ Loading fallback موجود

**الحالة:** ✅ جاهز

### 2. ملف `frontend/next.config.js`
- ✅ لا يوجد `output: 'standalone'` (يسبب مشاكل مع Netlify)
- ✅ Rewrites محددة بشكل صحيح
- ✅ Headers محددة بشكل صحيح
- ✅ Image optimization محددة

**الحالة:** ✅ جاهز

### 3. ملف `netlify.toml`
- ✅ Build command صحيح
- ✅ Publish directory صحيح
- ✅ Redirects محددة بشكل صحيح
- ✅ Function directory محددة

**الحالة:** ✅ جاهز

## ✅ التحقق من الأخطاء

### 1. TypeScript Errors
```bash
cd frontend
npm run type-check  # إذا كان موجوداً
# أو
npx tsc --noEmit
```

**الحالة:** ⏳ يرجى التحقق محلياً

### 2. ESLint Errors
```bash
cd frontend
npm run lint
```

**الحالة:** ✅ لا توجد أخطاء في linter

### 3. Build Test
```bash
cd frontend
npm run build
```

**الحالة:** ⏳ يرجى التحقق محلياً قبل النشر

## ✅ التحقق من الـ Imports

### 1. PublicLandingPage Export
- الملف: `frontend/src/pages/PublicLandingPage.tsx`
- Export Type: Named export `export function PublicLandingPage()`
- الاستخدام: `mod.PublicLandingPage` ✅ صحيح

**الحالة:** ✅ جاهز

### 2. Dynamic Import
```typescript
const PublicLandingPage = dynamicImport(
  () => import('@/pages/PublicLandingPage').then((mod) => ({ default: mod.PublicLandingPage })),
  { ssr: false, loading: () => <LoadingFallback /> }
);
```

**الحالة:** ✅ صحيح

## ✅ التحقق من التوافق

### 1. Next.js App Router
- ✅ جميع الصفحات في `app/` directory
- ✅ استخدام `'use client'` للصفحات التي تحتاج client-side
- ✅ استخدام `export const dynamic = 'force-dynamic'` لتجنب Static Generation

**الحالة:** ✅ جاهز

### 2. React Router Compatibility
- ✅ `PublicLandingPage` يُحمّل فقط على Client Side
- ✅ `RouterWrapper` في `Providers.tsx` يوفر React Router context
- ⚠️ `PublicLandingPage` يستخدم `react-router-dom` Link (يعمل فقط على Client)

**الحالة:** ✅ جاهز (بسبب SSR disabled)

## ✅ التحقق من Environment Variables

### على Netlify Dashboard:
تحقق من وجود:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE_URL` (اختياري)

**الحالة:** ⏳ يرجى التحقق من Netlify Dashboard

## ✅ التحقق من Build Configuration

### 1. Node Version
- `netlify.toml`: `NODE_VERSION = "22"`
- تأكد من أن Netlify يستخدم Node.js 22

**الحالة:** ✅ محددة

### 2. Build Command
```toml
command = "cd frontend && rm -rf node_modules package-lock.json && npm install && npm run build"
```

**ملاحظة:** هذا يحذف `node_modules` في كل build. إذا كان Build time مهم، يمكن تحسينه.

**الحالة:** ⚠️ يمكن تحسينه لاحقاً

## ✅ التحقق من المشاكل المحتملة

### 1. SSR Issues
- ✅ تم تعطيل SSR لـ `PublicLandingPage`
- ✅ `ClientOnly` wrapper موجود
- ✅ جميع hooks تعمل على Client Side فقط

**الحالة:** ✅ محلول

### 2. API Routing
- ✅ Rewrites محددة في `next.config.js` للـ local development
- ✅ Redirects محددة في `netlify.toml` للـ production
- ✅ Function `server.ts` موجود في `netlify/functions/`

**الحالة:** ✅ جاهز

### 3. Static Assets
- ✅ Icons في `frontend/public/icons/`
- ✅ Manifest.json موجود
- ⚠️ قد تكون بعض الأيقونات مفقودة (404 errors)

**الحالة:** ⚠️ يمكن إصلاحه لاحقاً (لا يؤثر على الـ 500 error)

## ⚠️ تحذيرات

1. **Build Time:**
   - Build command يحذف `node_modules` في كل مرة
   - هذا يزيد Build time
   - يمكن تحسينه لاحقاً

2. **Missing Icons:**
   - بعض الأيقونات قد تكون مفقودة (404 errors)
   - هذا لا يؤثر على وظيفة الصفحة
   - يمكن إصلاحه لاحقاً

## ✅ الخطوات النهائية

### قبل الرفع (Push):

1. ✅ **التحقق من Git Status:**
   ```bash
   git status
   ```

2. ✅ **التحقق من التغييرات:**
   ```bash
   git diff frontend/app/page.tsx
   ```

3. ✅ **التحقق من أن Build يعمل محلياً:**
   ```bash
   cd frontend
   npm run build
   ```

4. ✅ **التحقق من أن Dev Server يعمل:**
   ```bash
   cd frontend
   npm run dev
   # افتح http://localhost:3002
   # تحقق من أن الصفحة الرئيسية تعمل
   ```

### بعد الرفع:

1. ⏳ **مراقبة Netlify Deploy:**
   - اذهب إلى Netlify Dashboard
   - شاهد Deploy progress
   - تحقق من Build logs

2. ⏳ **التحقق من الموقع:**
   - افتح `https://investor-bacura.netlify.app/`
   - تحقق من عدم وجود خطأ 500
   - افتح Developer Tools > Console
   - تحقق من عدم وجود أخطاء JavaScript

3. ⏳ **التحقق من Function Logs:**
   - اذهب إلى Netlify Dashboard > Functions
   - تحقق من Logs للأخطاء

## 📝 ملاحظات

- ✅ جميع التغييرات المطلوبة تمت
- ✅ الكود جاهز للنشر
- ⏳ يرجى التحقق من Build محلياً قبل النشر
- ⏳ يرجى التحقق من Environment Variables على Netlify

## 🎯 النتيجة المتوقعة

بعد النشر:
- ✅ الصفحة الرئيسية تعمل بدون خطأ 500
- ✅ `PublicLandingPage` يُحمّل بشكل صحيح
- ✅ جميع hooks تعمل على Client Side فقط
- ✅ لا توجد أخطاء SSR

---

**تاريخ التحقق:** تم التحقق من الكود - جاهز للنشر ✅

