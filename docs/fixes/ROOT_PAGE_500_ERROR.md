# إصلاح خطأ 500 في الصفحة الرئيسية

## 🔴 **المشكلة:**

```
GET https://investor-bacura.netlify.app/ 500 (Internal Server Error)
```

الصفحة الرئيسية (`/`) تعطي خطأ 500 Internal Server Error.

---

## 🔍 **التحليل:**

### المشاكل المحتملة:

1. **React Router Context Issue:**
   - `PublicLandingPage` يستخدم `Link` من `react-router-dom`
   - قد يكون React Router context غير متاح أثناء Server-Side Rendering

2. **Missing Dependencies:**
   - `usePublicCompanyProfiles` أو hooks أخرى قد تفشل
   - Supabase client قد لا يتم تهيئته بشكل صحيح

3. **Server-Side Rendering Issues:**
   - بعض hooks تحتاج client-side فقط
   - `ClientOnly` wrapper قد لا يكون كافياً

---

## ✅ **الحلول المحتملة:**

### **1. تحسين Error Handling في الصفحة الرئيسية:**

```typescript
// frontend/app/page.tsx
'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { PublicLandingPage } from '@/pages/PublicLandingPage';
import { ClientOnly } from './components/ClientOnly';
import { useAuth } from '@/context/AuthContext';

export const dynamic = 'force-dynamic';

function RootPageContent() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/home');
      }
    }
  }, [isAuthenticated, user, router, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>; // أو Loading component
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PublicLandingPage />
    </Suspense>
  );
}

export default function RootPage() {
  return (
    <ClientOnly>
      <RootPageContent />
    </ClientOnly>
  );
}
```

### **2. إصلاح PublicLandingPage لاستخدام Next.js Link:**

```typescript
// استبدال React Router Link بـ Next.js Link
import Link from 'next/link';
// بدلاً من: import { Link } from 'react-router-dom';
```

**مشكلة:** هذا يتطلب إعادة كتابة كبيرة. الأفضل إصلاح React Router context.

### **3. التحقق من Supabase Client Initialization:**

تأكد من أن Supabase client يتم تهيئته بشكل صحيح في `Providers.tsx`.

### **4. إضافة Error Boundary:**

```typescript
// frontend/app/error-boundary.tsx
'use client';

import React from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>حدث خطأ</h1>
          <p>يرجى تحديث الصفحة</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 🚀 **خطوات الإصلاح:**

### **الخطوة 1: فحص Logs في Netlify:**

1. اذهب إلى Netlify Dashboard
2. Site settings → Functions → View logs
3. تحقق من خطأ 500 المفصل

### **الخطوة 2: إضافة Error Handling:**

أضف try-catch وerror boundaries حول المكونات الحساسة.

### **الخطوة 3: التحقق من React Router Context:**

تأكد من أن `NextRouterProvider` في `Providers.tsx` يعمل بشكل صحيح.

### **الخطوة 4: Test Locally:**

```bash
cd frontend
npm run build
npm run start
```

ثم افتح `http://localhost:3000` وتحقق من الأخطاء.

---

## 🔍 **التشخيص:**

### **1. فحص Console Logs:**
- افتح Browser DevTools → Console
- تحقق من أي أخطاء JavaScript

### **2. فحص Network Tab:**
- افتح Network tab في DevTools
- تحقق من طلب `/` وراجع response

### **3. فحص Server Logs:**
- Netlify Functions logs
- أو local terminal إذا كنت تختبر محلياً

---

## 📝 **ملاحظات:**

1. ⚠️ **React Router في Next.js**: استخدام React Router في Next.js معقد. تأكد من أن `NextRouterProvider` يعمل بشكل صحيح.

2. ⚠️ **Server-Side Rendering**: بعض hooks تحتاج client-side فقط. استخدم `ClientOnly` أو `Suspense` بعناية.

3. ⚠️ **Supabase Client**: تأكد من أن Supabase client يتم تهيئته قبل استخدام hooks.

---

**تاريخ الإنشاء:** 2025-12-02  
**الحالة:** تحتاج لفحص logs لإيجاد السبب الدقيق

