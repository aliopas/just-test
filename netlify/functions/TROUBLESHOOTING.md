# استكشاف الأخطاء - Netlify Function 502 Error

## المشكلة
حصول خطأ `502 Bad Gateway` عند استدعاء `/api/v1/*` endpoints.

## الأسباب المحتملة

### 1. Environment Variables غير موجودة في Netlify Dashboard

**المشكلة:** الـ backend يحتاج إلى environment variables للاتصال بـ Supabase.

**الحل:**
1. اذهب إلى Netlify Dashboard
2. اختر موقعك
3. اذهب إلى **Site settings** > **Environment variables**
4. تأكد من إضافة المتغيرات التالية:
   - `SUPABASE_URL` - رابط Supabase project
   - `SUPABASE_ANON_KEY` - Anonymous key من Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (اختياري، لكن مطلوب لبعض العمليات)

**للحصول على Supabase Keys:**
1. اذهب إلى Supabase Dashboard
2. اختر project
3. اذهب إلى **Settings** > **API**
4. انسخ:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. الـ Function تفشل في التحميل

**التحقق:**
1. اذهب إلى Netlify Dashboard > **Functions** > **server**
2. اذهب إلى **Logs**
3. ابحث عن أخطاء مثل:
   - "Missing Supabase environment variables"
   - "Failed to initialize serverless handler"
   - أي أخطاء أخرى

### 3. Build Failed

**التحقق:**
1. اذهب إلى Netlify Dashboard > **Deploys**
2. اختر آخر deploy
3. تحقق من Build logs
4. ابحث عن أخطاء في البناء

## خطوات التشخيص

### 1. تحقق من Function Logs

```bash
# في Netlify Dashboard:
# Functions > server > Logs
```

ابحث عن:
- `[Server Function] Environment check:` - يجب أن يظهر `hasSupabaseUrl: true` و `hasSupabaseAnonKey: true`
- أي أخطاء في تحميل الـ backend

### 2. تحقق من Build Logs

```bash
# في Netlify Dashboard:
# Deploys > [Latest Deploy] > Build log
```

تأكد من:
- البناء نجح بدون أخطاء
- الـ Function تم بناؤها بنجاح

### 3. تحقق من Environment Variables

في Netlify Dashboard:
- **Site settings** > **Environment variables**

تأكد من وجود:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (اختياري)

### 4. تحقق من Health Check

بعد إصلاح المشاكل، جرب:
```bash
curl https://investor-bacura.netlify.app/api/v1/health
```

يجب أن ترى response مثل:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...
}
```

## الحلول المقترحة

### الحل 1: إضافة Environment Variables في Netlify

1. اذهب إلى Netlify Dashboard
2. **Site settings** > **Environment variables**
3. أضف:
   - `SUPABASE_URL` = `https://wtvvzthfpusnqztltkkv.supabase.co`
   - `SUPABASE_ANON_KEY` = (من Supabase Dashboard)
   - `SUPABASE_SERVICE_ROLE_KEY` = (من Supabase Dashboard)

### الحل 2: إعادة بناء الموقع

بعد إضافة Environment Variables:
1. اذهب إلى **Deploys**
2. اضغط على **Trigger deploy** > **Clear cache and deploy site**

### الحل 3: التحقق من Function Code

تأكد من أن:
- `netlify/functions/server.ts` موجود
- `backend/src/app.ts` موجود
- جميع dependencies موجودة في `package.json`

## ملاحظات مهمة

1. **Environment Variables في Netlify:**
   - يجب إضافتها في Netlify Dashboard
   - لا تعتمد على ملف `.env` في production
   - يمكن استخدام `.env` فقط للـ local development

2. **Supabase Logs:**
   - من logs Supabase، يبدو أن Supabase يعمل بشكل صحيح
   - المشكلة هي أن الـ backend API (عبر Netlify Function) لا يعمل

3. **Function Logs:**
   - Function logs ستساعد في تحديد السبب الدقيق
   - تحقق من logs بعد كل deploy

## الاتصال بالدعم

إذا استمرت المشكلة بعد تجربة جميع الحلول:
1. شارك Function logs من Netlify Dashboard
2. شارك Build logs
3. شارك Environment Variables names (بدون القيم)

