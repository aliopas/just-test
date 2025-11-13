# إضافة متغيرات البيئة للـ Frontend على Netlify
# Adding Frontend Environment Variables to Netlify

## المشكلة
## Problem

عند الوصول إلى الموقع على Netlify (`investor-bacura.netlify.app`)، يظهر الخطأ:
```
[Supabase] Missing configuration: SUPABASE_URL, SUPABASE_ANON_KEY
```

**السبب:** متغيرات البيئة `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` غير موجودة في Netlify.

---

## الحل خطوة بخطوة
## Step-by-Step Solution

### الخطوة 1: فتح Netlify Dashboard

1. اذهب إلى [Netlify Dashboard](https://app.netlify.com)
2. ابحث عن موقعك: **investor-bacura** (أو اسم موقعك)
3. اضغط على الموقع لفتحه

### الخطوة 2: فتح صفحة Environment Variables

1. من القائمة الجانبية، اضغط على **Site settings**
2. اضغط على **Environment variables** (أو **Build & deploy** → **Environment**)

### الخطوة 3: إضافة المتغيرات

#### أ. إضافة `VITE_SUPABASE_URL`

1. اضغط على **"Add a variable"** (إضافة متغير)
2. **Key (المفتاح):** `VITE_SUPABASE_URL`
3. **Value (القيمة):**
   ```
   https://wtvvzthfpusnqztltkkv.supabase.co
   ```
4. **Scope (النطاق):**
   - ✅ فعّل **Production**
   - ✅ فعّل **Deploy previews** (اختياري)
   - ✅ فعّل **Branch deploys** (اختياري)
5. اضغط على **"Save"** (حفظ)

#### ب. إضافة `VITE_SUPABASE_ANON_KEY`

1. اضغط على **"Add a variable"** مرة أخرى
2. **Key (المفتاح):** `VITE_SUPABASE_ANON_KEY`
3. **Value (القيمة):**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dnZ6dGhmcHVzbnF6dGx0a2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzE2MDUsImV4cCI6MjA3NzgwNzYwNX0.6KttJmjGUsgp3xfGf3wBm6kPmrinXB5R6AJJsTB-LWA
   ```
4. **Scope (النطاق):**
   - ✅ فعّل **Production**
   - ✅ فعّل **Deploy previews** (اختياري)
   - ✅ فعّل **Branch deploys** (اختياري)
5. اضغط على **"Save"** (حفظ)

---

### الخطوة 4: إعادة النشر (مهم جداً!)

**⚠️ بعد إضافة المتغيرات، يجب إعادة النشر!**

#### الطريقة الأولى: من Netlify Dashboard

1. **اذهب إلى صفحة Deploys:**
   - من القائمة الجانبية، اضغط على **"Deploys"**

2. **اضغط على "Trigger deploy":**
   - في الأعلى، اضغط على **"Trigger deploy"**
   - اختر **"Clear cache and deploy site"** (مسح الكاش وإعادة النشر)
   - هذا أفضل من "Deploy site" لأنه يضمن تطبيق التغييرات

3. **انتظر حتى يكتمل النشر:**
   - قد يستغرق 2-5 دقائق
   - تحقق من أن الحالة أصبحت **"Published"** (تم النشر)

#### الطريقة الثانية: عبر GitHub

1. **اذهب إلى GitHub:**
   - افتح repository المشروع
   - قم بعمل أي تغيير بسيط (مثل تعديل README)
   - أو أنشئ commit فارغ:
     ```bash
     git commit --allow-empty -m "Trigger redeploy for frontend env vars"
     git push
     ```

2. **Netlify سيكتشف التغيير تلقائياً:**
   - سيبدأ النشر التلقائي
   - انتظر حتى يكتمل

---

## التحقق من النجاح
## Verify Success

بعد إعادة النشر:

1. **افتح الموقع:**
   - اذهب إلى: `https://investor-bacura.netlify.app`

2. **افتح Console:**
   - اضغط F12 → Console
   - يجب ألا ترى رسالة:
     - ❌ `[Supabase] Missing configuration`
   - ✅ يجب أن يعمل Supabase client بشكل صحيح

3. **اختبر Password Reset:**
   - اذهب إلى صفحة Login
   - انقر على "نسيت كلمة المرور؟"
   - يجب أن يعمل بدون أخطاء

---

## ملاحظات مهمة
## Important Notes

### 1. البادئة `VITE_` ضرورية

Vite يقرأ فقط المتغيرات التي تبدأ بـ `VITE_`:
- ✅ صحيح: `VITE_SUPABASE_URL`
- ❌ خطأ: `SUPABASE_URL`

### 2. Scope (النطاق) مهم

- **Production:** ضروري للموقع المنشور
- **Deploy previews:** للـ previews من Pull Requests
- **Branch deploys:** للـ deploys من branches

### 3. إعادة النشر ضرورية

- Vite يدمج المتغيرات في وقت البناء (build time)
- بعد إضافة المتغيرات، يجب إعادة البناء والنشر
- استخدام **"Clear cache and deploy site"** يضمن تطبيق التغييرات

### 4. القيم يجب أن تكون صحيحة

- لا تضع مسافات قبل أو بعد القيم
- انسخ القيم بالكامل بدون تعديل
- تأكد من أن URL يبدأ بـ `https://`

---

## استكشاف الأخطاء
## Troubleshooting

### المشكلة: المتغيرات موجودة لكن الخطأ ما زال يظهر

**الحل:**
1. تحقق من أن Scope هو **Production** ✓
2. أعد النشر باستخدام **"Clear cache and deploy site"**
3. انتظر حتى يكتمل النشر بالكامل

### المشكلة: Build فشل

**الحل:**
1. راجع **Build logs** في Netlify
2. تحقق من أن القيم صحيحة (لا توجد مسافات إضافية)
3. تأكد من أن البادئة `VITE_` موجودة

### المشكلة: الموقع يعمل لكن Supabase لا يعمل

**الحل:**
1. افتح Console في المتصفح
2. راجع رسائل الخطأ
3. تحقق من أن المتغيرات موجودة في Production scope
4. أعد النشر مرة أخرى

---

## قائمة التحقق
## Checklist

- [ ] ✅ تم إضافة `VITE_SUPABASE_URL` في Netlify
- [ ] ✅ تم إضافة `VITE_SUPABASE_ANON_KEY` في Netlify
- [ ] ✅ Scope هو **Production** ✓
- [ ] ✅ تم إعادة النشر باستخدام "Clear cache and deploy site"
- [ ] ✅ النشر اكتمل بنجاح (Published)
- [ ] ✅ الموقع يعمل بدون أخطاء Supabase

---

## روابط مفيدة
## Useful Links

- **Netlify Dashboard:** https://app.netlify.com
- **Environment Variables:** https://app.netlify.com/sites/[your-site]/configuration/env
- **Deploys:** https://app.netlify.com/sites/[your-site]/deploys

---

## الدعم
## Support

إذا استمرت المشكلة:
1. راجع Build Logs في Netlify
2. راجع Console في المتصفح
3. تحقق من أن المتغيرات موجودة في Production scope
4. تأكد من إعادة النشر بعد أي تعديل

