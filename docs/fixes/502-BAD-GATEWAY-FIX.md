# 🔧 إصلاح مشكلة 502 Bad Gateway

**التاريخ:** اليوم  
**الحالة:** ⚠️ قيد التشخيص

---

## ⚠️ المشكلة

```
POST https://investor-bacura.netlify.app/api/v1/auth/login 502 (Bad Gateway)
GET https://investor-bacura.netlify.app/api/v1/public/company-profile?lang=ar 502 (Bad Gateway)
```

**المعنى:** Netlify Function لا تعمل أو فشلت في التحميل.

---

## 🔍 الأسباب المحتملة

### 1. Environment Variables مفقودة في Netlify

**الأكثر احتمالاً!**

Netlify Function تحتاج إلى:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. Backend App فشل في التحميل

قد يكون بسبب:
- Environment variables مفقودة
- خطأ في الكود
- مشاكل في dependencies

### 3. Function غير موجودة

قد يكون:
- Build فشل
- Function لم يتم نشرها
- Deployment تم إلغاؤه

---

## ✅ الحلول

### الحل 1: التحقق من Environment Variables في Netlify

1. **اذهب إلى Netlify Dashboard:**
   ```
   https://app.netlify.com
   ```

2. **اختر موقعك:**
   ```
   investor-bacura
   ```

3. **اذهب إلى Environment Variables:**
   - Site settings > Environment variables

4. **تحقق من وجود:**
   - ✅ `SUPABASE_URL`
   - ✅ `SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`

5. **إذا كانت مفقودة:**
   - أضفها من Supabase Dashboard
   - راجع: `netlify/README.md`

### الحل 2: فحص Function Logs

1. **اذهب إلى Netlify Dashboard:**
   ```
   https://app.netlify.com
   ```

2. **اختر موقعك:**
   ```
   investor-bacura
   ```

3. **اذهب إلى Functions:**
   - Functions > server > Logs

4. **ابحث عن:**
   - `[Server Function] Environment check:`
   - `[Server Function] WARNING:`
   - `[Server Function] Failed to load backend app:`

### الحل 3: إعادة بناء الموقع

1. **في Netlify Dashboard:**
   - Deploys > Trigger deploy
   - Clear cache and deploy site

2. **انتظر حتى ينتهي البناء**

3. **تحقق من Function Logs بعد البناء**

---

## 🔧 إصلاح Service Worker

Service Worker يحاول cache assets غير موجودة، مما يسبب خطأ.

### الحل: معالجة الأخطاء في Service Worker

```javascript
// معالجة أخطاء caching
cache.addAll(PRECACHE_ASSETS).catch((error) => {
  console.warn('[Service Worker] Failed to cache some assets:', error);
  // المتابعة حتى لو فشل caching بعض الملفات
});
```

---

## 📋 خطوات التشخيص

### 1. فحص Function Logs

```
Netlify Dashboard > Functions > server > Logs
```

**ابحث عن:**
- ✅ `[Server Function] Environment check:` - يجب أن يظهر `hasSupabaseUrl: true`
- ❌ `[Server Function] WARNING: Missing critical Supabase environment variables!`
- ❌ `[Server Function] Failed to load backend app:`

### 2. فحص Build Logs

```
Netlify Dashboard > Deploys > [Latest] > Build log
```

**تحقق من:**
- ✅ Build نجح
- ✅ Function تم بناؤها
- ✅ لا أخطاء

### 3. اختبار Function مباشرة

افتح في المتصفح:
```
https://investor-bacura.netlify.app/.netlify/functions/server/api/v1/health
```

**إذا كان 502:**
- Function لا تعمل
- Environment variables مفقودة

**إذا كان 200:**
- Function تعمل
- المشكلة في redirects

---

## 🚨 الأخطاء الشائعة

### خطأ 1: "Missing Supabase environment variables"

**السبب:** Environment variables غير موجودة في Netlify

**الحل:**
1. أضف Environment Variables في Netlify Dashboard
2. أعد بناء الموقع

### خطأ 2: "Failed to load backend app"

**السبب:** Backend فشل في التحميل

**الحل:**
1. راجع Function Logs
2. تحقق من Environment Variables
3. راجع Build Logs

### خطأ 3: Function غير موجودة

**السبب:** Build فشل أو تم إلغاؤه

**الحل:**
1. راجع آخر deployment
2. أعد البناء

---

## ✅ Checklist

- [ ] Environment Variables موجودة في Netlify
- [ ] Function Logs لا تظهر أخطاء
- [ ] Build Logs تظهر نجاح
- [ ] Function موجودة في Functions tab
- [ ] Health check endpoint يعمل

---

## 🚀 الخطوة التالية

1. **فحص Environment Variables في Netlify**
2. **مراجعة Function Logs**
3. **إعادة بناء الموقع إذا لزم الأمر**

---

**راجع:** `netlify/README.md` للحصول على دليل إعداد Environment Variables

