# حل سريع لمشكلة متغيرات البيئة
# Quick Fix for Environment Variables

## المشكلة
## Problem

```
[Supabase] Missing configuration: SUPABASE_URL, SUPABASE_ANON_KEY
```

## الحل السريع (3 خطوات)
## Quick Solution (3 Steps)

### الخطوة 1: تأكد من وجود الملف
### Step 1: Verify File Exists

الملف يجب أن يكون موجود في: `frontend/.env.local`

```env
VITE_SUPABASE_URL=https://wtvvzthfpusnqztltkkv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dnZ6dGhmcHVzbnF6dGx0a2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzE2MDUsImV4cCI6MjA3NzgwNzYwNX0.6KttJmjGUsgp3xfGf3wBm6kPmrinXB5R6AJJsTB-LWA
```

### الخطوة 2: أوقف خادم التطوير
### Step 2: Stop Dev Server

في Terminal حيث يعمل `npm run dev`:
- اضغط `Ctrl + C` لإيقاف الخادم

### الخطوة 3: أعد تشغيل الخادم
### Step 3: Restart Dev Server

```bash
cd frontend
npm run dev
```

أو من جذر المشروع:
```bash
npm run dev --workspace frontend
```

---

## لماذا يحدث هذا؟
## Why This Happens?

Vite يقرأ ملفات `.env.local` **فقط عند بدء التشغيل**. إذا أضفت أو عدّلت الملف أثناء تشغيل الخادم، لن يتم تحميل التغييرات حتى تعيد تشغيله.

---

## التحقق من النجاح
## Verify Success

بعد إعادة التشغيل:
1. افتح Console في المتصفح
2. يجب ألا ترى رسالة خطأ `[Supabase] Missing configuration`
3. جرب استخدام وظيفة Password Reset - يجب أن تعمل

---

## إذا استمرت المشكلة
## If Problem Persists

### 1. تحقق من اسم الملف
- يجب أن يكون: `.env.local` (وليس `.env` أو `.env.development`)
- يجب أن يكون في مجلد `frontend/` (وليس في جذر المشروع)

### 2. تحقق من البادئة
- يجب أن تبدأ المتغيرات بـ `VITE_`
- ✅ صحيح: `VITE_SUPABASE_URL`
- ❌ خطأ: `SUPABASE_URL`

### 3. تحقق من عدم وجود مسافات
```env
# ✅ صحيح
VITE_SUPABASE_URL=https://wtvvzthfpusnqztltkkv.supabase.co

# ❌ خطأ (مسافة قبل =)
VITE_SUPABASE_URL =https://wtvvzthfpusnqztltkkv.supabase.co
```

### 4. امسح الكاش وأعد التشغيل
```bash
# أوقف الخادم
# ثم:
cd frontend
rm -rf node_modules/.vite  # Linux/Mac
# أو
Remove-Item -Recurse -Force node_modules\.vite  # Windows PowerShell

# أعد تشغيل الخادم
npm run dev
```

---

## ملاحظات
## Notes

- ملف `.env.local` غير مرفوع على Git (موجود في `.gitignore`)
- هذا طبيعي - كل مطور لديه نسخته الخاصة
- للإنتاج على Netlify، يجب إضافة المتغيرات في Netlify Dashboard

