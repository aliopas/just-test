# حل سريع: إضافة Environment Variables في Netlify

## ⚠️ المشكلة

المستخدم لا يستطيع تسجيل الدخول بسبب خطأ `502 Bad Gateway`. السبب: **Environment Variables غير موجودة في Netlify Dashboard**.

## ✅ الحل (5 دقائق)

### الخطوة 1: اذهب إلى Netlify Dashboard

1. افتح: https://app.netlify.com
2. اختر موقعك: `investor-bacura`
3. اضغط على **Site settings** (⚙️) في القائمة الجانبية
4. اضغط على **Environment variables** في القائمة الجانبية

### الخطوة 2: أضف Environment Variables

أضف المتغيرات التالية واحدة تلو الأخرى:

#### 1. `SUPABASE_URL`
- **Key:** `SUPABASE_URL`
- **Value:** `https://wtvvzthfpusnqztltkkv.supabase.co`
- **Scopes:** ✅ All scopes
- اضغط **Create variable**

#### 2. `SUPABASE_ANON_KEY`
- **Key:** `SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dnZ6dGhmcHVzbnF6dGx0a2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzE2MDUsImV4cCI6MjA3NzgwNzYwNX0.6KttJmjGUsgp3xfGf3wBm6kPmrinXB5R6AJJsTB-LWA`
- **Scopes:** ✅ All scopes
- اضغط **Create variable**

#### 3. `SUPABASE_SERVICE_ROLE_KEY` (مهم جداً!)

**للحصول على Service Role Key:**
1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. اختر المشروع
3. اذهب إلى **Settings** (⚙️) > **API**
4. انسخ **service_role** key (⚠️ احذر: هذا المفتاح حساس!)

- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** (الصق service_role key من Supabase)
- **Scopes:** ✅ All scopes
- اضغط **Create variable**

### الخطوة 3: إعادة بناء الموقع

1. في Netlify Dashboard، اذهب إلى **Deploys**
2. اضغط على **Trigger deploy** > **Clear cache and deploy site**
3. انتظر حتى ينتهي البناء (~3-5 دقائق)

### الخطوة 4: التحقق

1. **تحقق من Function Logs:**
   - اذهب إلى **Functions** > **server** > **Logs**
   - يجب أن ترى:
     ```
     [Server Function] Environment check: {
       hasSupabaseUrl: true,
       hasSupabaseAnonKey: true,
       hasSupabaseServiceRoleKey: true
     }
     ```

2. **اختبر Health Check:**
   - افتح: `https://investor-bacura.netlify.app/api/v1/health`
   - يجب أن ترى response بنجاح

3. **جرب تسجيل الدخول:**
   - يجب أن يعمل الآن! 🎉

## 📋 Checklist

- [ ] أضفت `SUPABASE_URL` في Netlify Dashboard
- [ ] أضفت `SUPABASE_ANON_KEY` في Netlify Dashboard  
- [ ] أضفت `SUPABASE_SERVICE_ROLE_KEY` في Netlify Dashboard
- [ ] أعدت بناء الموقع
- [ ] تحققت من Function Logs
- [ ] جربت تسجيل الدخول

## 🔍 إذا استمرت المشكلة

1. **تحقق من Function Logs:**
   - Netlify Dashboard > Functions > server > Logs
   - ابحث عن أي أخطاء

2. **تحقق من Build Logs:**
   - Netlify Dashboard > Deploys > [Latest] > Build log
   - تأكد من نجاح البناء

3. **تحقق من Environment Variables:**
   - تأكد من أن الأسماء صحيحة (case-sensitive)
   - تأكد من أن القيم صحيحة (بدون مسافات إضافية)

## ⚠️ ملاحظات أمان

- **لا تشارك `SUPABASE_SERVICE_ROLE_KEY` أبداً!**
- هذا المفتاح لديه صلاحيات كاملة على قاعدة البيانات
- احتفظ به آمنًا

## 📞 الدعم

إذا استمرت المشكلة بعد اتباع جميع الخطوات، شارك:
1. Function Logs من Netlify Dashboard
2. رسالة الخطأ الدقيقة

