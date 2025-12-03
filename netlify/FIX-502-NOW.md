# 🚨 حل سريع: 502 Bad Gateway

**الحالة:** ⚠️ عاجل  
**المشكلة:** Netlify Function لا تعمل → 502 Bad Gateway

---

## 📋 الخطوات السريعة (5 دقائق)

### الخطوة 1: فحص Function Logs

1. افتح: https://app.netlify.com
2. اختر: **investor-bacura**
3. اذهب إلى: **Functions** > **server** > **Logs**

**ماذا تبحث عنه:**

#### ✅ **إذا رأيت:**
```
[Server Function] Environment check: {
  hasSupabaseUrl: true,
  hasSupabaseAnonKey: true
}
[Server Function] Backend app loaded successfully
```
**✅ Function تعمل - انتقل للخطوة 2**

#### ❌ **إذا رأيت:**
```
[Server Function] WARNING: Missing critical Supabase environment variables!
[Server Function] Failed to load backend app
```
**❌ Environment Variables مفقودة - اتبع الخطوات أدناه**

---

### الخطوة 2: إضافة Environment Variables

#### 2.1 احصل على Keys من Supabase

1. اذهب إلى: https://app.supabase.com
2. اختر مشروعك
3. **Settings** > **API**
4. انسخ:
   - **Project URL** → `https://wtvvzthfpusnqztltkkv.supabase.co`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️

#### 2.2 أضفها في Netlify

1. اذهب إلى: https://app.netlify.com
2. اختر: **investor-bacura**
3. **Site settings** > **Environment variables**
4. اضغط **Add variable** لكل متغير:

**المتغير 1:**
- **Key:** `SUPABASE_URL`
- **Value:** `https://wtvvzthfpusnqztltkkv.supabase.co`
- **Scopes:** ✅ **All scopes** (Builds, Functions, Runtime)
- **Context:** ✅ **All contexts** (Production, Deploy previews, Branch deploys)

**المتغير 2:**
- **Key:** `SUPABASE_ANON_KEY`
- **Value:** (انسخه من Supabase Dashboard)
- **Scopes:** ✅ **All scopes**
- **Context:** ✅ **All contexts**

**المتغير 3:** ⚠️
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** (انسخه من Supabase Dashboard)
- **Scopes:** ✅ **All scopes**
- **Context:** ✅ **All contexts**

---

### الخطوة 3: إعادة بناء الموقع

1. في Netlify Dashboard
2. **Deploys** > **Trigger deploy**
3. اختر: **Clear cache and deploy site**
4. اضغط **Deploy site**
5. انتظر حتى ينتهي البناء (~3-5 دقائق)

---

### الخطوة 4: التحقق من النجاح

#### 4.1 فحص Function Logs

بعد البناء:
- اذهب إلى: **Functions** > **server** > **Logs**
- يجب أن ترى:
  ```
  [Server Function] Environment check: {
    hasSupabaseUrl: true,
    hasSupabaseAnonKey: true,
    hasSupabaseServiceRoleKey: true
  }
  [Server Function] Backend app loaded successfully
  [Server Function] Serverless handler initialized successfully
  ```

#### 4.2 اختبار Health Check

افتح في المتصفح:
```
https://investor-bacura.netlify.app/api/v1/health
```

**إذا كان 200 OK:**
- ✅ Function تعمل!
- جرب تسجيل الدخول

**إذا كان 502:**
- راجع Function Logs
- تحقق من Environment Variables مرة أخرى

---

## ⚠️ ملاحظات مهمة

1. **Service Role Key حساس:**
   - لا تشاركه أبداً
   - لديه صلاحيات كاملة
   - احتفظ به آمناً

2. **Scopes مهمة:**
   - يجب أن تكون **All scopes**
   - خاصة **Functions** scope

3. **بعد إضافة Variables:**
   - **يجب إعادة البناء**
   - Variables الجديدة لا تعمل في deployment الحالي

---

## 🔍 إذا استمرت المشكلة

### فحص Build Logs

1. **Deploys** > **[Latest]** > **Build log**
2. ابحث عن:
   - ❌ `ERROR`
   - ❌ `FAILED`
   - ⚠️ `WARNING`

### فحص Function Status

1. **Functions** > **server**
2. تحقق من:
   - ✅ Function موجودة
   - ✅ Status = Active
   - ✅ لا أخطاء

---

## ✅ Checklist

- [ ] فحصت Function Logs
- [ ] حصلت على Supabase Keys
- [ ] أضفت `SUPABASE_URL` في Netlify
- [ ] أضفت `SUPABASE_ANON_KEY` في Netlify
- [ ] أضفت `SUPABASE_SERVICE_ROLE_KEY` في Netlify
- [ ] جميع Scopes = **All scopes**
- [ ] أعدت بناء الموقع
- [ ] تحققت من Function Logs بعد البناء
- [ ] جربت Health Check endpoint
- [ ] جربت تسجيل الدخول

---

## 📞 للمساعدة

إذا استمرت المشكلة بعد اتباع جميع الخطوات:

1. شارك Function Logs
2. شارك Build Logs
3. تحقق من Environment Variables (الأسماء فقط)

---

**راجع أيضاً:**
- `netlify/URGENT-502-FIX.md` - دليل تفصيلي
- `netlify/502-DIAGNOSIS-GUIDE.md` - دليل تشخيص
- `netlify/README.md` - دليل شامل

---

**تم إنشاء الدليل!** ✅

**الخطوة التالية:** اتبع الخطوات أعلاه لإصلاح المشكلة.

