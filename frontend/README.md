# Invastors Frontend - Next.js

تم تحويل المشروع إلى Next.js 14 مع App Router.

## الإعداد

### تثبيت المتطلبات

```bash
npm install
```

### متغيرات البيئة

أنشئ ملف `.env.local` في مجلد `frontend/`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_STORAGE_URL=your_supabase_storage_url
```

### تشغيل المشروع

```bash
npm run dev
```

سيتم تشغيل المشروع على `http://localhost:3002`

### البناء للإنتاج

```bash
npm run build
npm start
```

## البنية

- `app/` - Next.js App Router pages و layouts
- `src/` - المكونات، hooks، contexts، utils (تم الحفاظ عليها كما هي)
- `public/` - الملفات الثابتة

## الصفحات المتاحة

### الصفحات العامة
- `/` - Landing Page
- `/login` - تسجيل الدخول
- `/register` - التسجيل
- `/verify` - التحقق من OTP
- `/reset-password` - إعادة تعيين كلمة المرور

### صفحات المستثمر (قيد التطوير)
- `/home` - الصفحة الرئيسية
- `/requests` - قائمة الطلبات
- `/requests/new` - طلب جديد
- `/profile` - الملف الشخصي

### صفحات الإدارة (قيد التطوير)
- `/admin/dashboard` - لوحة التحكم
- `/admin/requests` - إدارة الطلبات
- `/admin/news` - إدارة الأخبار

## التغييرات من Vite

- ✅ تم تحديث package.json
- ✅ تم إنشاء next.config.js
- ✅ تم تحديث tsconfig.json
- ✅ تم تحديث utils لاستخدام Next.js env vars
- ✅ تم إنشاء App Router structure
- ⏳ تحتاج إلى تحويل الصفحات من React Router إلى Next.js routes

## ملاحظات

- جميع المكونات في `src/` تعمل بدون تغيير
- Contexts و Hooks تعمل كما هي
- CSS و Styles لا تحتاج إلى تغيير

راجع `NEXTJS_MIGRATION.md` لمزيد من التفاصيل.

