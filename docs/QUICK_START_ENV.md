# إعداد المتغيرات البيئية - دليل سريع

## المشكلة الحالية
يظهر الخطأ: `Missing configuration: SUPABASE_URL, SUPABASE_ANON_KEY`

## الحل السريع (4 خطوات)

### الخطوة 1: إنشاء ملف `.env.local`

**في PowerShell (من مجلد المشروع الرئيسي):**
```powershell
cd frontend
Copy-Item .env.example .env.local
```

**أو يدوياً:**
1. انسخ ملف `frontend/.env.example`
2. أعد تسميته إلى `.env.local`
3. افتح الملف `frontend/.env.local`

### الخطوة 2: احصل على القيم من Supabase

1. افتح [Supabase Dashboard](https://app.supabase.com/)
2. اختر مشروعك
3. اذهب إلى **Settings** → **API**
4. انسخ القيم التالية:
   - **Project URL** (مثال: `https://abcdefgh.supabase.co`)
   - **anon public** key (مفتاح طويل يبدأ بـ `eyJ...`)

### الخطوة 3: أضف القيم في `.env.local`

استبدل القيم في الملف:

```env
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ مهم جداً:**
- لا تضع مسافات حول علامة `=`
- لا تضع علامات اقتباس حول القيم
- تأكد من أن URL يبدأ بـ `https://`

### الخطوة 4: أعد تشغيل الخادم

```bash
# أوقف الخادم (Ctrl+C)
# ثم أعد تشغيله
npm run dev
```

## التحقق من الإعداد

بعد إعادة التشغيل، افتح Console في المتصفح. يجب ألا تظهر رسائل خطأ تتعلق بـ Supabase.

## مثال كامل

```env
VITE_SUPABASE_URL=https://xyzabc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.example-key-here
```

## استكشاف الأخطاء

### الخطأ لا يزال يظهر بعد إعادة التشغيل؟

1. ✅ تأكد من حفظ الملف `.env.local`
2. ✅ تأكد من أن المتغيرات تبدأ بـ `VITE_`
3. ✅ تأكد من عدم وجود مسافات إضافية
4. ✅ أعد تشغيل الخادم بالكامل (أوقف ثم ابدأ)

### لا أعرف قيم Supabase الخاصة بي؟

1. سجّل الدخول إلى [Supabase Dashboard](https://app.supabase.com/)
2. اختر مشروعك (أو أنشئ مشروع جديد)
3. اذهب إلى **Settings** → **API**
4. انسخ القيم المطلوبة

