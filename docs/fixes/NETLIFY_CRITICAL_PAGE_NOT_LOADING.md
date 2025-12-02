# إصلاح حرج: الصفحة الرئيسية لا تظهر على Netlify

## المشكلة الحرجة

الصفحة الرئيسية لا تظهر على Netlify - يظهر فقط خطأ 500 أو صفحة فارغة.

## الأسباب المحتملة

### 1. ❌ `publish` directory في `netlify.toml`

**المشكلة:**
```toml
publish = "frontend/.next"  # ❌ قد يسبب مشاكل مع @netlify/plugin-nextjs
```

مع `@netlify/plugin-nextjs`، الـ plugin يتعامل مع Next.js output تلقائياً. قد يكون تحديد `publish` يدوياً يسبب مشاكل.

### 2. ❌ `loading: () => null` في `layout.tsx`

**المشكلة:**
- عندما يكون `loading: () => null`، الصفحة ستكون فارغة تماماً
- ✅ تم إصلاحها بإضافة `ProvidersLoadingFallback`

### 3. ⚠️ Dynamic Import في Server Component

**المشكلة:**
- استخدام dynamic import في `layout.tsx` (Server Component) قد يسبب مشاكل

## الحلول المطبقة

### ✅ 1. إضافة Loading Fallback

تم إضافة `ProvidersLoadingFallback` component:
```typescript
function ProvidersLoadingFallback() {
  return (
    <div style={{...}}>
      <div className="spinner" />
      <p>جاري التحميل...</p>
    </div>
  );
}
```

### ⏳ 2. تصحيح `netlify.toml` (يحتاج مراجعة)

مع `@netlify/plugin-nextjs`:
- الـ plugin يتعامل مع Next.js تلقائياً
- قد نحتاج إلى إزالة أو تعديل `publish` directory

## التحقق من Netlify

### 1. Build Logs

التحقق من:
- ✅ Build نجح بدون أخطاء
- ✅ `frontend/.next` تم بناؤه
- ✅ لا توجد أخطاء في Next.js build

### 2. Function Logs

التحقق من:
- ✅ Function `server` موجودة
- ✅ Function logs بدون أخطاء

### 3. Environment Variables

التحقق من وجود:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE_URL`

## الخطوات التالية

1. ✅ تم إصلاح `loading: () => null`
2. ⏳ مراجعة `publish` directory في `netlify.toml`
3. ⏳ التحقق من Build logs على Netlify
4. ⏳ التحقق من Function logs

---

**تاريخ:** تم تحليل المشكلة الحرج ✅

