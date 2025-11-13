# Supabase Client Setup Guide

## المشكلة
إذا ظهرت رسالة الخطأ: `Supabase client not available`، فهذا يعني أن متغيرات البيئة الخاصة بـ Supabase غير معرّفة بشكل صحيح.

## الحل

### 1. إنشاء ملف `.env.local` في مجلد `frontend/`

أنشئ ملف `.env.local` في مجلد `frontend/` وأضف المتغيرات التالية:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. الحصول على القيم من Supabase Dashboard

1. افتح [Supabase Dashboard](https://app.supabase.com/)
2. اختر مشروعك
3. اذهب إلى **Settings** → **API**
4. انسخ:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 3. مثال على ملف `.env.local`

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example
```

### 4. إعادة تشغيل خادم التطوير

بعد إضافة المتغيرات البيئية، يجب إعادة تشغيل خادم التطوير:

```bash
# أوقف الخادم الحالي (Ctrl+C)
# ثم أعد تشغيله
npm run dev
```

### 5. التحقق من الإعداد

افتح Console في المتصفح وتحقق من عدم وجود رسائل خطأ تتعلق بـ Supabase.

## ملاحظات مهمة

- ⚠️ **لا ترفع ملف `.env.local` إلى Git** - تأكد من إضافته إلى `.gitignore`
- ✅ ملف `.env.local` محلي فقط ولا يؤثر على الملفات الأخرى
- 🔄 يجب إعادة تشغيل الخادم بعد أي تغيير في ملف `.env.local`

## استكشاف الأخطاء

### الخطأ: "Supabase client not available"

**الأسباب المحتملة:**
1. ملف `.env.local` غير موجود
2. المتغيرات البيئية غير معرّفة بشكل صحيح
3. الخادم لم يُعاد تشغيله بعد إضافة المتغيرات

**الحل:**
1. تحقق من وجود ملف `.env.local` في `frontend/`
2. تحقق من صحة القيم (URL يجب أن يبدأ بـ `https://`)
3. أعد تشغيل خادم التطوير

### الخطأ: "Missing configuration: SUPABASE_URL, SUPABASE_ANON_KEY"

هذا يعني أن كلا المتغيرين غير معرّفين. تأكد من:
- وجود ملف `.env.local`
- صحة أسماء المتغيرات (يجب أن تبدأ بـ `VITE_`)
- إعادة تشغيل الخادم

## للمزيد من المعلومات

راجع ملف `frontend/src/utils/supabase-client.ts` لفهم كيفية تحميل المتغيرات البيئية.

