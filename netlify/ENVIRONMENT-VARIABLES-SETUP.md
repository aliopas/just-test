# إعداد Environment Variables في Netlify

## المشكلة

المستخدم لا يستطيع تسجيل الدخول بسبب خطأ `502 Bad Gateway`. السبب الأساسي هو **Environment Variables غير موجودة في Netlify Dashboard**.

## الحل: إضافة Environment Variables

### الخطوة 1: الحصول على Supabase Keys

1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. اختر المشروع الخاص بك
3. اذهب إلى **Settings** (⚙️) > **API**
4. انسخ القيم التالية:

   - **Project URL** → هذا هو `SUPABASE_URL`
     ```
     مثال: https://wtvvzthfpusnqztltkkv.supabase.co
     ```

   - **anon public** key → هذا هو `SUPABASE_ANON_KEY`
     ```
     مثال: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

   - **service_role** key → هذا هو `SUPABASE_SERVICE_ROLE_KEY` (مهم جداً!)
     ```
     مثال: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

### الخطوة 2: إضافة Environment Variables في Netlify

1. اذهب إلى [Netlify Dashboard](https://app.netlify.com)
2. اختر موقعك (`investor-bacura`)
3. اذهب إلى **Site settings** (⚙️) في القائمة الجانبية
4. اذهب إلى **Environment variables** في القائمة الجانبية
5. اضغط على **Add a variable**

6. أضف المتغيرات التالية واحدة تلو الأخرى:

   #### المتغير 1: `SUPABASE_URL`
   - **Key:** `SUPABASE_URL`
   - **Value:** Project URL من Supabase (مثال: `https://wtvvzthfpusnqztltkkv.supabase.co`)
   - **Scopes:** اختر `All scopes` (أو `Production`, `Branch deploys`, `Deploy previews` حسب الحاجة)
   - اضغط **Create variable**

   #### المتغير 2: `SUPABASE_ANON_KEY`
   - **Key:** `SUPABASE_ANON_KEY`
   - **Value:** anon public key من Supabase
   - **Scopes:** اختر `All scopes`
   - اضغط **Create variable**

   #### المتغير 3: `SUPABASE_SERVICE_ROLE_KEY`
   - **Key:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** service_role key من Supabase (⚠️ **مهم جداً!**)
   - **Scopes:** اختر `All scopes`
   - اضغط **Create variable**

### الخطوة 3: إعادة بناء الموقع

بعد إضافة جميع Environment Variables:

1. في Netlify Dashboard، اذهب إلى **Deploys**
2. اضغط على **Trigger deploy** > **Clear cache and deploy site**
3. انتظر حتى ينتهي البناء (يجب أن يستغرق بضع دقائق)

### الخطوة 4: التحقق من أن كل شيء يعمل

بعد انتهاء البناء:

1. **تحقق من Function Logs:**
   - اذهب إلى **Functions** > **server** > **Logs**
   - يجب أن ترى:
     ```
     [Server Function] Environment check: {
       hasSupabaseUrl: true,
       hasSupabaseAnonKey: true,
       hasSupabaseServiceRoleKey: true
     }
     Serverless handler initialized successfully
     ```

2. **اختبر Health Check:**
   - افتح في المتصفح: `https://investor-bacura.netlify.app/api/v1/health`
   - يجب أن ترى response مثل:
     ```json
     {
       "status": "ok",
       "timestamp": "...",
       "uptime": ...
     }
     ```

3. **اختبر تسجيل الدخول:**
   - حاول تسجيل الدخول من الواجهة
   - يجب أن يعمل الآن! 🎉

## ملاحظات مهمة

### ⚠️ أمان

- **لا تشارك `SUPABASE_SERVICE_ROLE_KEY` أبداً!**
- هذا المفتاح لديه صلاحيات كاملة على قاعدة البيانات
- احتفظ به آمنًا ولا ترفعه إلى GitHub أو أي مكان عام

### 🔍 التحقق من Environment Variables

بعد إضافة Environment Variables، يمكنك التحقق منها:

1. في Netlify Dashboard: **Site settings** > **Environment variables**
2. يجب أن ترى جميع المتغيرات الثلاثة
3. تأكد من أن **Scopes** صحيحة (يُنصح بـ `All scopes`)

### 🐛 استكشاف الأخطاء

#### إذا رأيت في Function Logs:
```
[Server Function] WARNING: Missing critical Supabase environment variables!
```

**الحل:**
- تأكد من أن جميع Environment Variables موجودة في Netlify Dashboard
- تأكد من أن الأسماء صحيحة (case-sensitive):
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- أعد بناء الموقع بعد إضافة المتغيرات

#### إذا رأيت خطأ `502 Bad Gateway`:
- تحقق من Function Logs للبحث عن الأخطاء
- تأكد من أن Environment Variables موجودة
- تأكد من أن البناء نجح بدون أخطاء

#### إذا رأيت خطأ `Failed to initialize serverless handler`:
- تحقق من Function Logs
- تأكد من أن الـ backend code موجود
- تحقق من أن جميع dependencies موجودة

## الخطوات السريعة (Quick Reference)

1. ✅ الحصول على Supabase Keys من Supabase Dashboard
2. ✅ إضافة Environment Variables في Netlify Dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. ✅ إعادة بناء الموقع
4. ✅ التحقق من Function Logs
5. ✅ اختبار تسجيل الدخول

## الدعم

إذا استمرت المشكلة بعد اتباع جميع الخطوات:
1. شارك Function Logs من Netlify Dashboard
2. تأكد من أن Environment Variables موجودة (يمكنك مشاركة الأسماء فقط، بدون القيم)
3. تحقق من Build Logs للتأكد من أن البناء نجح

