# دليل نشر المشروع على Netlify
## Netlify Deployment Guide

هذا الدليل يشرح كيفية نشر مشروع باكورة الاستثمارية على Netlify.

---

## المتطلبات

1. حساب Netlify (مجاني)
2. GitHub repository للمشروع
3. متغيرات البيئة من Supabase

---

## خطوات النشر

### 1. إعداد المشروع محلياً

```bash
# تثبيت الاعتمادات
npm install

# بناء المشروع
npm run build
```

### 2. إعداد Netlify

#### الطريقة الأولى: عبر Netlify Dashboard

1. اذهب إلى [Netlify Dashboard](https://app.netlify.com)
2. اضغط على "Add new site" > "Import an existing project"
3. اختر GitHub واختر repository المشروع
4. في إعدادات البناء (Build settings):
   - **Build command:** `npm run build`
   - **Publish directory:** `.` (أو اتركه فارغاً)
   - **Functions directory:** `netlify/functions`

#### الطريقة الثانية: عبر Netlify CLI

```bash
# تثبيت Netlify CLI
npm install -g netlify-cli

# تسجيل الدخول
netlify login

# تهيئة المشروع
netlify init

# نشر المشروع
netlify deploy --prod
```

### 3. إعداد متغيرات البيئة

في Netlify Dashboard:

1. اذهب إلى Site settings > Environment variables
2. أضف المتغيرات التالية:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_ENV=production
PORT=8888
CORS_ORIGINS=https://your-site.netlify.app
```

### 4. إعدادات إضافية

#### إعدادات Build

في `netlify.toml`:
- تم تعيين `NODE_VERSION = "20"`
- تم تعيين `node_bundler = "esbuild"` للـ Functions

#### إعدادات Redirects

- جميع الطلبات إلى `/api/*` يتم توجيهها إلى `/.netlify/functions/server/*`

---

## هيكل الملفات

```
project/
├── netlify.toml              # تكوين Netlify
├── netlify/
│   └── functions/
│       └── server.ts         # Netlify Function wrapper
├── backend/
│   ├── src/                  # الكود المصدري
│   └── dist/                 # الكود المبنى (يتم إنشاؤه)
└── package.json
```

---

## اختبار النشر محلياً

```bash
# تثبيت Netlify CLI
npm install -g netlify-cli

# بناء المشروع
npm run build

# تشغيل Netlify محلياً
netlify dev
```

سيتم تشغيل المشروع على `http://localhost:8888`

---

## API Endpoints

بعد النشر، ستكون الـ endpoints متاحة على:

```
https://your-site.netlify.app/api/v1/health
https://your-site.netlify.app/api/v1/auth/register
https://your-site.netlify.app/api/v1/auth/login
... إلخ
```

---

## استكشاف الأخطاء

### المشكلة: "Page not found" (404)

**الحل:**
- تأكد من أن `netlify.toml` موجود في جذر المشروع
- تحقق من أن `netlify/functions/server.ts` موجود
- تأكد من أن redirects في `netlify.toml` صحيحة:
  ```toml
  [[redirects]]
    from = "/*"
    to = "/.netlify/functions/server/:splat"
    status = 200
    force = true
  ```
- راجع Netlify Function logs في Dashboard > Functions > server
- تأكد من أن البناء نجح (راجع Build logs)

### المشكلة: Function لا تعمل

**الحل:**
- تأكد من أن `npm run build` يعمل بنجاح
- تحقق من أن `backend/dist/app.js` موجود
- راجع Netlify Function logs في Dashboard
- تأكد من تثبيت `serverless-http`: `npm install`

### المشكلة: متغيرات البيئة غير موجودة (حتى لو كانت موجودة في Dashboard)

**الأعراض:**
- الخطأ: "Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY are required"
- المتغيرات موجودة في Netlify Dashboard لكن الخطأ ما زال يظهر

**الحلول:**

#### 1. التحقق من Scope (النطاق)

1. **في صفحة Environment Variables:**
   - اضغط على السهم ⬇️ بجانب كل متغير للتوسيع
   - تحقق من أن **"Production"** مفعّل (محدد ✓)
   - إذا لم يكن مفعّلاً:
     - اضغط على **"Edit"** (تعديل)
     - فعّل **"Production"** في قسم Scope
     - احفظ التغييرات

2. **المتغيرات المطلوبة:**
   - ✅ `SUPABASE_URL` - يجب أن يكون Scope: **Production**
   - ✅ `SUPABASE_ANON_KEY` - يجب أن يكون Scope: **Production**

#### 2. التحقق من القيم

1. **اضغط على السهم ⬇️ بجانب المتغير** للتوسيع
2. **تحقق من القيمة:**
   - `SUPABASE_URL` يجب أن يكون: `https://wtvvzthfpusnqztltkkv.supabase.co`
   - `SUPABASE_ANON_KEY` يجب أن يبدأ بـ: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **إذا كانت القيمة خاطئة:**
   - اضغط على **"Edit"** (تعديل)
   - صحح القيمة
   - احفظ التغييرات

#### 3. إعادة النشر (مهم جداً!)

**⚠️ بعد أي تعديل على المتغيرات، يجب إعادة النشر:**

1. **اذهب إلى صفحة Deploys:**
   - من القائمة الجانبية، اضغط على **"Deploys"**
2. **اضغط على "Trigger deploy":**
   - اختر **"Deploy site"** (نشر الموقع)
   - أو **"Clear cache and deploy site"** (مسح الكاش وإعادة النشر)
3. **انتظر حتى يكتمل النشر:**
   - قد يستغرق بضع دقائق
   - تحقق من أن الحالة أصبحت **"Published"** (تم النشر)

#### 4. التحقق من النجاح

بعد إعادة النشر:

1. **جرب الوصول إلى API:**
   - افتح: `https://heartfelt-moxie-dfcdb4.netlify.app/api/v1/health`
   - يجب أن يعمل بدون أخطاء
   - يجب ألا ترى خطأ "Missing Supabase environment variables"

2. **راجع Function Logs:**
   - اذهب إلى **"Functions"** → **"server"**
   - راجع السجلات (Logs) للتحقق من عدم وجود أخطاء

#### 5. إذا استمرت المشكلة

1. **احذف المتغيرات وأعد إضافتها:**
   - احذف `SUPABASE_URL` و `SUPABASE_ANON_KEY`
   - أعد إضافتها مرة أخرى مع التأكد من:
     - Scope: **Production** ✓
     - القيم صحيحة
   - أعد النشر

2. **تحقق من Build Logs:**
   - اذهب إلى **"Deploys"** → اختر آخر نشر
   - راجع **"Build logs"** للتحقق من الأخطاء

3. **تحقق من Function Logs:**
   - اذهب إلى **"Functions"** → **"server"**
   - راجع **"Logs"** للتحقق من الأخطاء في وقت التشغيل

### المشكلة: CORS errors

**الحل:**
- أضف URL الخاص بـ Netlify إلى `CORS_ORIGINS`
- مثال: `CORS_ORIGINS=https://your-site.netlify.app,http://localhost:3000`

---

## ملاحظات مهمة

1. **Netlify Functions Timeout:**
   - الـ timeout الافتراضي هو 10 ثوانٍ (Free plan)
   - للـ Pro plan: 26 ثانية
   - للعمليات الطويلة، استخدم Background Functions

2. **Cold Start:**
   - قد يستغرق أول طلب وقتاً أطول (cold start)
   - هذا طبيعي في serverless functions

3. **Environment Variables:**
   - لا تضع مفاتيح حساسة في الكود
   - استخدم دائماً Environment Variables

---

## روابط مفيدة

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Netlify CLI Documentation](https://cli.netlify.com/)
- [Serverless HTTP Documentation](https://github.com/dougmoscrop/serverless-http)

---

## الدعم

إذا واجهت مشاكل، راجع:
- Netlify Function logs في Dashboard
- Build logs في Netlify
- GitHub Issues للمشروع

