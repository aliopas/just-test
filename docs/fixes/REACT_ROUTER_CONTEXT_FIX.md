# إصلاح خطأ: React Router Context (basename is null)

## المشكلة

عند تشغيل التطبيق، يظهر الخطأ التالي:

```
Cannot destructure property 'basename' of 'u.useContext(...)' as it is null.
```

## السبب

الصفحات في `src/pages/` تستخدم React Router hooks مثل:
- `Link` from `react-router-dom`
- `useNavigate` from `react-router-dom`
- `useLocation` from `react-router-dom`
- `useParams` from `react-router-dom`
- `useSearchParams` from `react-router-dom`

لكن Next.js لا يوفر React Router context تلقائياً. هذه الـ hooks تحتاج إلى `BrowserRouter` أو `Router` provider لتوفير context.

## الحل

تم إضافة `BrowserRouter` في `Providers.tsx` ليوفر React Router context لجميع الصفحات.

### التغييرات:

#### قبل:
```tsx
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* ... */}
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

#### بعد:
```tsx
import { BrowserRouter } from 'react-router-dom';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/* ... */}
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
```

## الملفات المعدلة:

- `frontend/app/components/Providers.tsx` - إضافة `BrowserRouter` wrapper

## كيف يعمل هذا الحل

1. **Next.js Routing**: Next.js يستخدم App Router الخاص به للتنقل بين الصفحات
2. **React Router Context**: `BrowserRouter` يوفر context للصفحات القديمة التي تستخدم React Router hooks
3. **التوافق**: الصفحات القديمة في `src/pages/` يمكنها استخدام React Router hooks بدون مشاكل

## ملاحظات مهمة

- هذا الحل ضروري لأن المشروع يحتوي على صفحات قديمة تستخدم React Router
- في المستقبل، يمكن استبدال React Router hooks بـ Next.js equivalents:
  - `Link` → `next/link` Link component
  - `useNavigate` → `useRouter` from `next/navigation`
  - `useParams` → `useParams` from `next/navigation`
  - `useSearchParams` → `useSearchParams` from `next/navigation`
  - `useLocation` → يمكن استخدام `usePathname` و `useSearchParams` من Next.js

## التاريخ

2025-12-02

