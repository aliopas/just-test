# إصلاح خطأ البناء: styled-jsx في Server Components

## المشكلة

فشل بناء Next.js مع الخطأ التالي:

```
'client-only' cannot be imported from a Server Component module. It should only be used from a Client Component.

Import trace for requested module:
  ./..\node_modules\next\dist\compiled\client-only\error.js
  ./..\node_modules\next\dist\compiled\styled-jsx\dist\index\index.js
  ./..\node_modules\styled-jsx\style.js
  ./app\loading.tsx
```

## السبب

تم استخدام `styled-jsx` في ملفات Server Components (مثل `loading.tsx`)، لكن `styled-jsx` يتطلب Client Components. في Next.js 14 مع App Router، ملفات `loading.tsx` و `error.tsx` هي Server Components افتراضياً.

## الحل

تم إزالة جميع استخدامات `styled-jsx` ونقل الـ animations إلى ملف CSS عام.

### الملفات المعدلة:

1. **`app/globals.css`** - إضافة `@keyframes spin` animation
2. **`app/loading.tsx`** - إزالة `styled-jsx`
3. **`app/components/SuspenseBoundary.tsx`** - إزالة `styled-jsx`
4. **`app/(investor)/dashboard/loading.tsx`** - إزالة `styled-jsx`
5. **`app/(investor)/news/page.tsx`** - إزالة `styled-jsx`

### التغييرات:

#### قبل:
```tsx
<div style={{ animation: 'spin 1s linear infinite' }} />
<style jsx>{`
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`}</style>
```

#### بعد:
```css
/* في app/globals.css */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

```tsx
<div style={{ animation: 'spin 1s linear infinite' }} />
```

## النتيجة

✅ تم إصلاح خطأ البناء  
✅ جميع ملفات loading تعمل بشكل صحيح  
✅ الـ animations تعمل من CSS global  
✅ لا توجد استخدامات لـ `styled-jsx` في المشروع

## التاريخ

2025-12-02

