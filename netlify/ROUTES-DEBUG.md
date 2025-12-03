# 🔍 تشخيص مسارات Backend

**التاريخ:** اليوم  
**المشكلة:** 502 Bad Gateway - مشكلة محتملة في مسارات Backend

---

## ✅ المسارات الصحيحة

### 1. Netlify Redirect ✅

```toml
from = "/api/v1/*"
to = "/.netlify/functions/server/:splat"
```

**مثال:**
- `/api/v1/auth/login` → `/.netlify/functions/server/auth/login`
- `/api/v1/public/company-profile?lang=ar` → `/.netlify/functions/server/public/company-profile?lang=ar`

### 2. Backend Routes ✅

```typescript
app.use('/api/v1/public', publicRouter);
```

**المسار:** `/api/v1/public/company-profile` ✅

### 3. Path Reconstruction في server.ts

المشكلة المحتملة هنا! دعني أفحص الكود:

```typescript
if (event.path && event.path.startsWith('/.netlify/functions/server')) {
  const splat = event.path.replace('/.netlify/functions/server', '');
  event.path = `/api/v1${splat || ''}`;
}
```

**المشكلة المحتملة:**
- Query Parameters قد لا تنتقل بشكل صحيح
- قد تكون المشكلة في كيفية Netlify يمرر المسار

---

## 🔧 الحل المحتمل

### تحسين Path Reconstruction

يجب التأكد من:
1. Query Parameters تنتقل بشكل صحيح
2. المسار يعاد بناءه بشكل صحيح
3. rawPath يتم تحديثه أيضاً

---

## 📋 الخطوات التالية

1. فحص Function Logs لمعرفة المسار الفعلي
2. تحسين منطق إعادة بناء المسار
3. التأكد من Query Parameters

---

**الخطوة التالية:** فحص Function Logs أولاً!

