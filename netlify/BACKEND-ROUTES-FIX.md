# 🔧 حل مشكلة مسارات Backend

**التاريخ:** اليوم  
**المشكلة:** 502 Bad Gateway - مشكلة في مسارات Backend

---

## 🔍 فحص المسارات

### 1. Netlify Redirect (netlify.toml)

```toml
[[redirects]]
  from = "/api/v1/*"
  to = "/.netlify/functions/server/:splat"
  status = 200
  force = true
```

**يعمل:** ✅
- `/api/v1/auth/login` → `/.netlify/functions/server/auth/login`
- `/api/v1/public/company-profile` → `/.netlify/functions/server/public/company-profile`

### 2. Server Function (server.ts)

```typescript
// إعادة بناء المسار
if (event.path && event.path.startsWith('/.netlify/functions/server')) {
  const splat = event.path.replace('/.netlify/functions/server', '');
  event.path = `/api/v1${splat || ''}`;
}
```

**المسار بعد إعادة البناء:**
- `/.netlify/functions/server/auth/login` → `/api/v1/auth/login` ✅
- `/.netlify/functions/server/public/company-profile` → `/api/v1/public/company-profile` ✅

### 3. Backend Routes (backend/src/app.ts)

```typescript
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1/public', publicRouter);
```

**المسارات موجودة:** ✅

---

## 🔍 التشخيص

المسارات تبدو صحيحة. المشكلة قد تكون في:

### 1. Path Reconstruction

قد تكون هناك مشكلة في كيفية إعادة بناء المسار في `server.ts`.

### 2. Query Parameters

قد تكون المشكلة في Query Parameters (`?lang=ar`).

### 3. Function Logs

يجب فحص Function Logs لمعرفة المسار الفعلي.

---

## 🔧 الحلول المحتملة

### الحل 1: تحسين Path Reconstruction

تحسين منطق إعادة بناء المسار في `server.ts`.

### الحل 2: فحص Function Logs

فحص Function Logs لمعرفة المسار الفعلي الذي يصل للـ Function.

### الحل 3: التحقق من Query Parameters

التأكد من أن Query Parameters تنتقل بشكل صحيح.

---

## 📋 Checklist

- [ ] فحص Function Logs لمعرفة المسار الفعلي
- [ ] التحقق من Path Reconstruction في server.ts
- [ ] التحقق من Query Parameters
- [ ] اختبار المسارات المختلفة

---

**الخطوة التالية:** فحص Function Logs لمعرفة المسار الفعلي!

