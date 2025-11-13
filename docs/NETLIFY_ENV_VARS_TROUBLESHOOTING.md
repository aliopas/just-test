# استكشاف أخطاء متغيرات البيئة في Netlify
# Netlify Environment Variables Troubleshooting

## المشكلة الحالية
## Current Problem

```
[Supabase] Missing configuration: SUPABASE_URL, SUPABASE_ANON_KEY
Password reset error: Error: Supabase client is not configured
```

**الموقع:** `investor-bacura.netlify.app` (Production)

---

## الحل الشامل
## Complete Solution

### ✅ الخطوة 1: التحقق من وجود المتغيرات في Netlify

1. **اذهب إلى Netlify Dashboard:**
   - [Netlify Dashboard](https://app.netlify.com)
   - اختر موقعك: **investor-bacura**

2. **افتح Environment Variables:**
   - **Site settings** → **Environment variables**
   - أو: **Build & deploy** → **Environment**

3. **تحقق من المتغيرات التالية موجودة:**
   - ✅ `VITE_SUPABASE_URL`
   - ✅ `VITE_SUPABASE_ANON_KEY`

### ✅ الخطوة 2: التحقق من Scope (النطاق)

لكل متغير، تأكد من:

1. **اضغط على السهم ⬇️ بجانب المتغير** للتوسيع
2. **تحقق من Scope:**
   - ✅ **Production** يجب أن يكون مفعّل ✓
   - إذا لم يكن مفعّلاً:
     - اضغط على **"Edit"** (تعديل)
     - فعّل **"Production"** في قسم Scope
     - احفظ التغييرات

### ✅ الخطوة 3: التحقق من القيم

**القيم الصحيحة:**

- **VITE_SUPABASE_URL:**
  ```
  https://wtvvzthfpusnqztltkkv.supabase.co
  ```

- **VITE_SUPABASE_ANON_KEY:**
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dnZ6dGhmcHVzbnF6dGx0a2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzE2MDUsImV4cCI6MjA3NzgwNzYwNX0.6KttJmjGUsgp3xfGf3wBm6kPmrinXB5R6AJJsTB-LWA
  ```

**تحقق من:**
- لا توجد مسافات قبل أو بعد القيم
- القيم منسوخة بالكامل
- URL يبدأ بـ `https://`

### ✅ الخطوة 4: إعادة النشر (مهم جداً!)

**⚠️ بعد أي تعديل على المتغيرات، يجب إعادة النشر!**

#### الطريقة الموصى بها: Clear Cache and Deploy

1. **اذهب إلى Deploys:**
   - من القائمة الجانبية: **Deploys**

2. **اضغط على "Trigger deploy":**
   - في الأعلى، اضغط على **"Trigger deploy"**
   - اختر **"Clear cache and deploy site"**
   - ⚠️ هذا مهم جداً - يضمن مسح الكاش القديم

3. **انتظر حتى يكتمل النشر:**
   - قد يستغرق 2-5 دقائق
   - تحقق من أن الحالة أصبحت **"Published"** (تم النشر)

---

## التحقق من النجاح
## Verify Success

### 1. فحص Build Logs

1. **اذهب إلى Deploys:**
   - اختر آخر نشر
   - اضغط على **"Build logs"**

2. **ابحث عن:**
   - لا توجد أخطاء متعلقة بالمتغيرات
   - رسالة نجاح البناء

### 2. فحص الموقع

1. **افتح الموقع:**
   - اذهب إلى: `https://investor-bacura.netlify.app`

2. **افتح Console (F12):**
   - يجب ألا ترى:
     - ❌ `[Supabase] Missing configuration`
   - يجب أن ترى:
     - ✅ `[Supabase Config Debug]` مع `viteEnvUrl: 'set'` و `viteEnvKey: 'set'`

3. **اختبر Password Reset:**
   - اذهب إلى صفحة Login
   - انقر على "نسيت كلمة المرور؟"
   - يجب أن يعمل بدون أخطاء

---

## إذا استمرت المشكلة
## If Problem Persists

### الحل 1: حذف وإعادة إضافة المتغيرات

1. **احذف المتغيرات:**
   - في صفحة Environment Variables
   - اضغط على أيقونة الحذف 🗑️ بجانب `VITE_SUPABASE_URL`
   - اضغط على أيقونة الحذف 🗑️ بجانب `VITE_SUPABASE_ANON_KEY`

2. **أعد إضافتها:**
   - اضغط على **"Add a variable"**
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** `https://wtvvzthfpusnqztltkkv.supabase.co`
   - **Scope:** ✅ Production
   - احفظ
   
   - اضغط على **"Add a variable"** مرة أخرى
   - **Key:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dnZ6dGhmcHVzbnF6dGx0a2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzE2MDUsImV4cCI6MjA3NzgwNzYwNX0.6KttJmjGUsgp3xfGf3wBm6kPmrinXB5R6AJJsTB-LWA`
   - **Scope:** ✅ Production
   - احفظ

3. **أعد النشر:**
   - **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

### الحل 2: التحقق من Build Command

في `netlify.toml`، تأكد من أن Build command صحيح:

```toml
[build]
  command = "npm install && npm run build"
  publish = "frontend/dist"
```

### الحل 3: التحقق من أن البناء يعمل محلياً

```bash
cd frontend
npm run build
```

إذا فشل البناء محلياً، يجب إصلاح المشكلة أولاً.

---

## ملاحظات مهمة
## Important Notes

### 1. Vite يدمج المتغيرات في وقت البناء

- Vite يقرأ `VITE_*` variables أثناء البناء
- يدمجها في الكود المبنى
- بعد البناء، لا يمكن تغييرها بدون إعادة البناء

### 2. البادئة `VITE_` ضرورية

- ✅ صحيح: `VITE_SUPABASE_URL`
- ❌ خطأ: `SUPABASE_URL` (لن يقرأها Vite)

### 3. Scope مهم جداً

- **Production:** ضروري للموقع المنشور
- إذا لم يكن Production مفعّل، لن تكون المتغيرات متاحة أثناء البناء

### 4. Cache يجب مسحه

- استخدم **"Clear cache and deploy site"** دائماً
- هذا يضمن أن التغييرات تُطبق بشكل صحيح

---

## قائمة التحقق النهائية
## Final Checklist

- [ ] ✅ `VITE_SUPABASE_URL` موجود في Netlify Environment Variables
- [ ] ✅ `VITE_SUPABASE_ANON_KEY` موجود في Netlify Environment Variables
- [ ] ✅ Scope هو **Production** ✓ لكل متغير
- [ ] ✅ القيم صحيحة (بدون مسافات إضافية)
- [ ] ✅ تم إعادة النشر باستخدام **"Clear cache and deploy site"**
- [ ] ✅ النشر اكتمل بنجاح (Published)
- [ ] ✅ الموقع يعمل بدون أخطاء Supabase
- [ ] ✅ Password Reset يعمل بشكل صحيح

---

## روابط مفيدة
## Useful Links

- **Netlify Dashboard:** https://app.netlify.com
- **Environment Variables:** https://app.netlify.com/sites/[your-site]/configuration/env
- **Deploys:** https://app.netlify.com/sites/[your-site]/deploys
- **Build Logs:** في صفحة Deploys → اختر آخر نشر → Build logs

---

## الدعم
## Support

إذا استمرت المشكلة بعد تجربة جميع الحلول:

1. راجع Build Logs في Netlify
2. راجع Console في المتصفح
3. تحقق من أن المتغيرات موجودة في Production scope
4. تأكد من إعادة النشر بعد أي تعديل
5. جرب حذف وإعادة إضافة المتغيرات

