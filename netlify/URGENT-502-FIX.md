# 🚨 إصلاح عاجل: 502 Bad Gateway

**التاريخ:** اليوم  
**الحالة:** ⚠️ عاجل

---

## ⚠️ المشكلة

جميع طلبات API ترجع **502 Bad Gateway**:
- `POST /api/v1/auth/login` → 502
- `GET /api/v1/public/company-profile` → 502

**السبب:** Netlify Function لا تعمل.

---

## 🔍 السبب الأكثر احتمالاً

**Environment Variables مفقودة في Netlify Dashboard**

Netlify Function تحتاج إلى:
- ❌ `SUPABASE_URL` - مفقود
- ❌ `SUPABASE_ANON_KEY` - مفقود  
- ❌ `SUPABASE_SERVICE_ROLE_KEY` - مفقود

---

## ✅ الحل السريع (5 دقائق)

### 1. الحصول على Supabase Keys

**من Supabase Dashboard:**
1. اذهب إلى: https://app.supabase.com
2. اختر مشروعك
3. Settings > **API**
4. انسخ:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️

**القيم الحالية:**
- **SUPABASE_URL:** `https://wtvvzthfpusnqztltkkv.supabase.co`
- **SUPABASE_ANON_KEY:** (انسخه من Supabase Dashboard)

### 2. إضافة Environment Variables في Netlify

1. اذهب إلى: https://app.netlify.com
2. اختر موقعك: **investor-bacura**
3. **Site settings** > **Environment variables**
4. أضف المتغيرات الثلاثة:
   - Key: `SUPABASE_URL`
   - Value: `https://wtvvzthfpusnqztltkkv.supabase.co`
   - Scopes: ✅ **All scopes**
   
   - Key: `SUPABASE_ANON_KEY`
   - Value: (انسخه من Supabase)
   - Scopes: ✅ **All scopes**
   
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (انسخه من Supabase) ⚠️
   - Scopes: ✅ **All scopes**

### 3. إعادة بناء الموقع

1. في Netlify Dashboard
2. **Deploys** > **Trigger deploy**
3. اختر: **Clear cache and deploy site**
4. انتظر حتى ينتهي البناء (~3-5 دقائق)

### 4. التحقق من النجاح

**بعد البناء:**

1. **افتح Function Logs:**
   - Functions > server > Logs
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
   - يجب أن ترى: `{"status":"ok",...}`

3. **جرب تسجيل الدخول:**
   - يجب أن يعمل الآن! 🎉

---

## 🔧 تم إصلاح أيضاً

### Service Worker

تم تحسين معالجة الأخطاء في Service Worker لتجنب أخطاء caching.

---

## 📋 Checklist

- [ ] أضفت `SUPABASE_URL` في Netlify
- [ ] أضفت `SUPABASE_ANON_KEY` في Netlify
- [ ] أضفت `SUPABASE_SERVICE_ROLE_KEY` في Netlify
- [ ] أعدت بناء الموقع
- [ ] تحققت من Function Logs
- [ ] جربت تسجيل الدخول

---

## 🔍 إذا استمرت المشكلة

1. **راجع Function Logs:**
   - Functions > server > Logs
   - ابحث عن أخطاء

2. **راجع Build Logs:**
   - Deploys > [Latest] > Build log
   - تحقق من الأخطاء

3. **راجع دليل التشخيص:**
   - `netlify/502-DIAGNOSIS-GUIDE.md`

---

**راجع:** `netlify/README.md` للحصول على دليل شامل

**تم!** 🎉

