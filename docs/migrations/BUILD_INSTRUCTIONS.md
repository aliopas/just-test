# تعليمات البناء

## قبل البناء

### 1. تثبيت المتطلبات

```bash
npm install
```

### 2. إعداد Environment Variables

أنشئ ملف `.env.local` في مجلد `frontend/`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_STORAGE_URL=your_supabase_storage_url
```

### 3. البناء

```bash
npm run build
```

## ملاحظات مهمة

### حالة التحويل الحالية

✅ **تم إكماله:**
- إعداد Next.js الأساسي
- هيكل App Router
- Context Providers
- تحديث Environment Variables
- الصفحات العامة (login, register, verify, reset-password)

⚠️ **قيد العمل:**
- الصفحات في `src/pages/` لا تزال تستخدم `react-router-dom`
- تم إضافة `react-router-dom` مؤقتاً إلى dependencies حتى نكمل التحويل
- يجب تحويل جميع الصفحات تدريجياً لاستخدام Next.js routing

### المشاكل المحتملة

1. **الصفحات تستخدم react-router-dom:**
   - جميع الصفحات في `src/pages/` تستخدم `Link`, `useNavigate`, `useLocation` من `react-router-dom`
   - يجب تحويلها لاستخدام Next.js `next/link` و `next/navigation`

2. **App.tsx يحتاج إلى تحويل:**
   - `src/App.tsx` يحتوي على routing logic مع React Router
   - يجب تحويله إلى layouts في Next.js

## الخطوات التالية للتحويل الكامل

1. تحويل `PublicLandingPage` لاستخدام Next.js `Link`
2. تحويل جميع الصفحات لاستخدام Next.js navigation
3. تحويل `App.tsx` routing إلى Next.js layouts
4. إزالة `react-router-dom` من dependencies بعد اكتمال التحويل

## تشغيل المشروع للتطوير

```bash
npm run dev
```

سيتم تشغيل المشروع على `http://localhost:3002`

