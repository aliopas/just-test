# Next.js Migration Guide

تم تحويل المشروع من Vite + React Router إلى Next.js 14 مع App Router.

## التغييرات الرئيسية

### 1. هيكل المشروع

- تم إنشاء مجلد `app/` بدلاً من `src/App.tsx`
- الصفحات الآن في `app/[route]/page.tsx`
- Layouts في `app/layout.tsx` و `app/[route]/layout.tsx`

### 2. Environment Variables

تم تحديث متغيرات البيئة من `VITE_*` إلى `NEXT_PUBLIC_*`:

- `VITE_API_BASE_URL` → `NEXT_PUBLIC_API_BASE_URL`
- `VITE_SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_STORAGE_URL` → `NEXT_PUBLIC_SUPABASE_STORAGE_URL`

### 3. Routing

تم استبدال React Router بـ Next.js App Router:

- `<Route path="/login" element={<LoginPage />} />` → `app/login/page.tsx`
- `<Route path="/admin/dashboard" element={<AdminDashboardPage />} />` → `app/admin/dashboard/page.tsx`
- Dynamic routes: `/news/:id` → `app/news/[id]/page.tsx`

### 4. Navigation

- `react-router-dom`'s `Link` → Next.js `next/link`'s `Link`
- `useNavigate()` → Next.js `useRouter()` from `next/navigation`
- `useLocation()` → Next.js `usePathname()` from `next/navigation`

### 5. الإعدادات

#### package.json
- تم إزالة: `vite`, `@vitejs/plugin-react`, `react-router-dom`
- تم إضافة: `next`, `eslint-config-next`

#### next.config.js
- تم إنشاء ملف التكوين مع rewrites للـ API proxy

#### tsconfig.json
- تم تحديثه لدعم Next.js

## الخطوات التالية المطلوبة

### 1. تحديث جميع الصفحات

يجب تحويل جميع الصفحات إلى Next.js:

- ✅ الصفحات العامة (login, register, verify, reset-password)
- ⏳ صفحات المستثمر (home, requests, profile, etc.)
- ⏳ صفحات الإدارة (admin/dashboard, admin/requests, etc.)

### 2. تحديث Navigation Components

يجب تحديث:
- `App.tsx` → تحويل إلى layouts/pages في Next.js
- جميع مكونات Navigation لاستخدام `next/link`
- إزالة `BrowserRouter` و `Routes`

### 3. إنشاء Middleware

إنشاء `middleware.ts` للتعامل مع:
- Authentication checks
- Role-based routing
- Redirects

### 4. تحديث API Client

تم تحديث `api-client.ts` و `supabase-client.ts` لاستخدام Next.js env vars.

### 5. Service Worker

يجب تحديث Service Worker ليعمل مع Next.js:
- نقل `/public/sw.js` إذا لزم الأمر
- تحديث registration code

### 6. Environment Variables

تحديث ملف `.env`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_SUPABASE_STORAGE_URL=your_storage_url
```

## تشغيل المشروع

```bash
cd frontend
npm install
npm run dev
```

سيتم تشغيل Next.js على المنفذ 3002 (كما كان مع Vite).

## ملاحظات

- جميع المكونات موجودة في `src/` ولم يتم نقلها
- Contexts و Hooks تعمل كما هي
- CSS و Styles تعمل بدون تغيير
- يجب تحديث الصفحات تدريجياً لاستخدام Next.js patterns

## الملفات المطلوب تحديثها

### Pages (يجب تحويلها)
- [ ] `src/pages/HomePage.tsx` → `app/home/page.tsx`
- [ ] `src/pages/NewRequestPage.tsx` → `app/requests/new/page.tsx`
- [ ] `src/pages/ProfilePage.tsx` → `app/profile/page.tsx`
- [ ] `src/pages/MyRequestsPage.tsx` → `app/requests/page.tsx`
- [ ] `src/pages/InvestorDashboardPage.tsx` → `app/dashboard/page.tsx`
- [ ] جميع صفحات Admin → `app/admin/*/page.tsx`

### Components (يجب تحديثها)
- [ ] `src/App.tsx` → تحويل إلى layouts
- [ ] جميع مكونات Navigation → استخدام `next/link`
- [ ] أي استخدام لـ `useNavigate` أو `useLocation`

### Utils (تم تحديثها ✅)
- ✅ `src/utils/api-client.ts`
- ✅ `src/utils/supabase-client.ts`
- ✅ `src/utils/supabase-storage.ts`

