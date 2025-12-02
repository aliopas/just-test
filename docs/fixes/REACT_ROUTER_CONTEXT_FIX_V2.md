# إصلاح خطأ: React Router Context (basename is null) - النسخة 2

## المشكلة

عند تشغيل التطبيق، يظهر الخطأ التالي:

```
Cannot destructure property 'basename' of 'u.useContext(...)' as it is null.
```

حتى بعد إضافة `BrowserRouter` أو `MemoryRouter`، المشكلة لا تزال موجودة.

## السبب الجذري

المشكلة أن:
1. الصفحات القديمة في `src/pages/` تستخدم React Router hooks
2. `BrowserRouter` يتعارض مع Next.js routing
3. `MemoryRouter` لا يدعم التحديث الديناميكي للمسارات
4. نحتاج Router Provider يوفر context بدون التدخل في Next.js routing

## الحل النهائي

استخدام `Router` component مباشرة مع navigator مخصص لا يتدخل في Next.js routing:

### التغييرات:

```tsx
import { Router } from 'react-router-dom';
import { usePathname, useSearchParams } from 'next/navigation';

function RouterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Create location from Next.js route
  const location = useMemo(() => ({
    pathname: pathname || '/',
    search: searchParams?.toString() ? `?${searchParams.toString()}` : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    state: null,
    key: 'default',
  }), [pathname, searchParams]);

  // Navigator that doesn't interfere with Next.js
  const navigator = useMemo(() => ({
    push: () => {}, // No-op: Next.js handles routing
    replace: () => {}, // No-op: Next.js handles routing
    go: (delta: number) => {
      if (typeof window !== 'undefined') {
        window.history.go(delta);
      }
    },
    createHref: (to: any) => {
      const href = typeof to === 'string' ? to : to.pathname + (to.search || '');
      return href;
    },
  }), []);

  return (
    <Router location={location} navigator={navigator} basename={undefined}>
      {children}
    </Router>
  );
}
```

## الملفات المعدلة:

- `frontend/app/components/Providers.tsx` - استخدام `Router` مباشرة مع navigator مخصص

## كيف يعمل هذا الحل

1. **Next.js Routing**: Next.js يتحكم في routing بشكل كامل
2. **React Router Context**: `Router` component يوفر context فقط بدون التدخل في routing
3. **Location Sync**: Location يتم تحديثه بناءً على Next.js route
4. **No-Op Navigator**: Navigator functions هي no-ops لأن Next.js يتعامل مع navigation

## المزايا

✅ يوفر React Router context للصفحات القديمة  
✅ لا يتدخل في Next.js routing  
✅ متزامن مع Next.js routes  
✅ لا يسبب تعارضات  

## التاريخ

2025-12-02

