# تحليل المشكلة الحرجة على Netlify

## المشكلة

الصفحة الرئيسية لا تظهر على Netlify - يظهر خطأ 500 أو صفحة فارغة.

## الأسباب المحتملة

### 1. ⚠️ `publish` directory في `netlify.toml`

مع `@netlify/plugin-nextjs`، يجب **إزالة** `publish` directory لأن الـ plugin يتعامل مع ذلك تلقائياً.

**المشكلة الحالية:**
```toml
publish = "frontend/.next"  # ❌ قد يسبب مشاكل مع @netlify/plugin-nextjs
```

**الحل:**
- إزالة `publish` أو تركه فارغاً
- `@netlify/plugin-nextjs` يتعامل مع Next.js output تلقائياً

### 2. ⚠️ `loading: () => null` في `layout.tsx`

**المشكلة:**
- عندما يكون `loading: () => null`، الصفحة ستكون فارغة تماماً
- تم إصلاحها بإضافة `ProvidersLoadingFallback`

### 3. ⚠️ Dynamic Import في Server Component

**المشكلة:**
- استخدام dynamic import في `layout.tsx` (Server Component) قد يسبب مشاكل

## الحلول المطبقة

### ✅ 1. إضافة Loading Fallback

تم إضافة `ProvidersLoadingFallback` component لعرض loading indicator بدلاً من null.

### ⏳ 2. تصحيح `netlify.toml`

يجب إزالة أو تصحيح `publish` directory.

## الخطوات التالية

1. ✅ تم إصلاح `loading: () => null`
2. ⏳ تصحيح `publish` directory في `netlify.toml`
3. ⏳ التحقق من Build logs على Netlify
4. ⏳ التحقق من Function logs

---

**تاريخ:** تحليل المشكلة الحرج ✅

