# إصلاح مشكلة import.meta في Next.js

## المشكلة

Next.js لا يدعم `import.meta` مثل Vite. تم إصلاح:
1. ✅ `src/utils/analytics.ts` - تم تغيير `import.meta.env.MODE` إلى `process.env.NODE_ENV`
2. ⏳ `src/components/Logo.tsx` - يحتاج إلى نقل الصور إلى `public/` أو استخدام Next.js Image

## الحل المطبق

### 1. analytics.ts
تم تغيير:
```typescript
if (import.meta.env.MODE === 'test') {
```
إلى:
```typescript
if (process.env.NODE_ENV === 'test') {
```

### 2. Logo.tsx
تم استخدام `require()` كحل مؤقت، لكن الحل الأفضل هو:
- نقل الصور من `src/assets/` إلى `public/`
- أو استخدام Next.js `Image` component مع مسارات من `public/`

## الخطوات المطلوبة

### نقل الصور إلى public/

```bash
# في مجلد frontend/
cp src/assets/logo.png public/logo.png
cp src/assets/logo.jpg public/logo.jpg
```

ثم تحديث `Logo.tsx`:
```typescript
const primaryLogoSrc = '/logo.png';
const legacyLogoSrc = '/logo.jpg';
```

## ملاحظات

- `main.tsx` غير مستخدم في Next.js (خاص بـ Vite فقط)
- الصور في `public/` متاحة مباشرة من الجذر `/`

