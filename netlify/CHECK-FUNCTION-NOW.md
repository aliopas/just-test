# 🔍 فحص Netlify Function الآن

**تاريخ:** الآن  
**المشكلة:** 502 Bad Gateway مستمر

---

## ⚠️ المشكلة

```
GET /api/v1/public/company-profile?lang=ar 502 (Bad Gateway)
```

**السبب:** Netlify Function لا تعمل.

---

## 🔍 التحقق السريع

### الخطوة 1: فحص Function Logs يدوياً

1. **اذهب إلى:**
   ```
   https://app.netlify.com
   ```

2. **اختر موقعك:**
   ```
   investor-bacura
   ```

3. **اذهب إلى Functions:**
   - اضغط على **Functions** في القائمة الجانبية
   - اختر **server**
   - اضغط على **Logs**

4. **ابحث عن:**

#### ✅ إذا رأيت:
```
[Server Function] Environment check: {
  hasSupabaseUrl: true,
  hasSupabaseAnonKey: true,
  hasSupabaseServiceRoleKey: true
}
[Server Function] Backend app loaded successfully
```
**✅ Function تعمل - المشكلة في مكان آخر**

#### ❌ إذا رأيت:
```
[Server Function] WARNING: Missing critical Supabase environment variables!
[Server Function] Failed to load backend app: Error: Missing Supabase environment variables
```
**❌ Environment Variables مفقودة!**

#### ❌ إذا رأيت:
```
[Server Function] Environment check: {
  hasSupabaseUrl: false,
  hasSupabaseAnonKey: false,
  hasSupabaseServiceRoleKey: false
}
```
**❌ Environment Variables غير موجودة في Netlify!**

### الخطوة 2: فحص Environment Variables

1. **اذهب إلى:**
   ```
   Site settings > Environment variables
   ```

2. **يجب أن تجد:**
   - ✅ `SUPABASE_URL`
   - ✅ `SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`

3. **إذا كانت مفقودة:**
   - راجع: `netlify/URGENT-502-FIX.md`
   - أضفها من Supabase Dashboard
   - أعد بناء الموقع

### الخطوة 3: اختبار Function مباشرة

افتح في المتصفح:
```
https://investor-bacura.netlify.app/.netlify/functions/server/api/v1/health
```

**النتائج:**
- ✅ **200 OK** → Function تعمل، المشكلة في redirects
- ❌ **502 Bad Gateway** → Function لا تعمل، Environment Variables مفقودة
- ❌ **503 Service Unavailable** → Backend فشل في التحميل

---

## 🚨 الحل الفوري

### إذا كانت Environment Variables مفقودة:

1. **احصل على Keys من Supabase:**
   - اذهب إلى: https://app.supabase.com
   - اختر مشروعك
   - Settings > **API**
   - انسخ الـ 3 مفاتيح

2. **أضفها في Netlify:**
   - Site settings > **Environment variables**
   - أضف كل متغير
   - Scopes: **All scopes**

3. **أعد بناء الموقع:**
   - Deploys > **Trigger deploy**
   - **Clear cache and deploy site**

---

## 📋 Checklist

- [ ] فحصت Function Logs
- [ ] تحققت من Environment Variables
- [ ] جربت Health Check endpoint
- [ ] أعدت بناء الموقع

---

**راجع:** `netlify/URGENT-502-FIX.md` للحل التفصيلي

