# 🔍 دليل تشخيص مشكلة 502 Bad Gateway

**التاريخ:** اليوم  
**المشكلة:** جميع طلبات API ترجع 502 Bad Gateway

---

## ⚠️ الأعراض

```
POST /api/v1/auth/login 502 (Bad Gateway)
GET /api/v1/public/company-profile 502 (Bad Gateway)
```

**المعنى:** Netlify Function لا تعمل.

---

## 🔍 خطوات التشخيص

### الخطوة 1: فحص Function Logs

1. اذهب إلى: https://app.netlify.com
2. اختر موقعك: **investor-bacura**
3. اذهب إلى: **Functions** > **server** > **Logs**

**ابحث عن:**

#### ✅ إذا رأيت هذا:
```
[Server Function] Environment check: {
  hasSupabaseUrl: true,
  hasSupabaseAnonKey: true,
  hasSupabaseServiceRoleKey: true
}
[Server Function] Backend app loaded successfully
[Server Function] Serverless handler initialized successfully
```
**✅ Function تعمل بشكل صحيح**

#### ❌ إذا رأيت هذا:
```
[Server Function] WARNING: Missing critical Supabase environment variables!
[Server Function] Failed to load backend app: Error: Missing Supabase environment variables
```
**❌ Environment Variables مفقودة!**

### الخطوة 2: فحص Environment Variables

1. اذهب إلى: **Site settings** > **Environment variables**

**يجب أن تجد:**
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

**إذا كانت مفقودة:**
- راجع: `netlify/README.md`
- أضفها من Supabase Dashboard

### الخطوة 3: فحص آخر Deployment

1. اذهب إلى: **Deploys**
2. راجع آخر deployment:
   - ✅ **Success** - جيد
   - ❌ **Failed** - المشكلة هنا
   - ⚠️ **Canceled** - أعد البناء

### الخطوة 4: اختبار Function مباشرة

افتح في المتصفح:
```
https://investor-bacura.netlify.app/.netlify/functions/server/api/v1/health
```

**النتائج:**
- ✅ **200 OK** - Function تعمل
- ❌ **502 Bad Gateway** - Function لا تعمل
- ❌ **503 Service Unavailable** - Environment Variables مفقودة

---

## 🔧 الحلول

### الحل 1: إضافة Environment Variables

**إذا كانت Environment Variables مفقودة:**

1. **اذهب إلى Supabase Dashboard:**
   ```
   https://app.supabase.com
   ```

2. **اختر مشروعك**

3. **اذهب إلى Settings > API**

4. **انسخ:**
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️

5. **أضفها في Netlify:**
   - Site settings > Environment variables
   - أضف كل متغير
   - Scopes: **All scopes**

6. **أعد بناء الموقع**

### الحل 2: إعادة بناء الموقع

1. **في Netlify Dashboard:**
   - Deploys > **Trigger deploy**
   - **Clear cache and deploy site**

2. **انتظر حتى ينتهي البناء**

3. **تحقق من Function Logs**

### الحل 3: فحص Build Logs

1. اذهب إلى: **Deploys** > **[Latest]** > **Build log**

2. **ابحث عن:**
   - ❌ `ERROR`
   - ❌ `FAILED`
   - ⚠️ `WARNING`

3. **إذا كان هناك أخطاء:**
   - راجع Build Logs
   - أصلح المشاكل
   - أعد البناء

---

## 📋 Checklist سريع

### Function Logs
- [ ] Function موجودة
- [ ] Logs لا تظهر أخطاء
- [ ] Environment check يظهر `true` لجميع المتغيرات

### Environment Variables
- [ ] `SUPABASE_URL` موجود
- [ ] `SUPABASE_ANON_KEY` موجود
- [ ] `SUPABASE_SERVICE_ROLE_KEY` موجود
- [ ] جميع Scopes = **All scopes**

### Deployment
- [ ] آخر deployment = **Success**
- [ ] Build logs لا تظهر أخطاء
- [ ] Function موجودة في Functions tab

---

## 🚨 الأخطاء الشائعة

### خطأ 1: "Missing Supabase environment variables"

**الحل:** أضف Environment Variables في Netlify Dashboard

### خطأ 2: "Failed to load backend app"

**الحل:** 
1. راجع Function Logs
2. تحقق من Environment Variables
3. أعد بناء الموقع

### خطأ 3: Function غير موجودة

**الحل:**
1. راجع Build Logs
2. تأكد من أن Build نجح
3. أعد البناء إذا لزم الأمر

---

## 📞 للمساعدة

إذا استمرت المشكلة:

1. شارك Function Logs من Netlify Dashboard
2. شارك Build Logs
3. تحقق من Environment Variables (الأسماء فقط، بدون القيم)

---

**راجع:** `netlify/README.md` للحصول على دليل كامل لإعداد Environment Variables

