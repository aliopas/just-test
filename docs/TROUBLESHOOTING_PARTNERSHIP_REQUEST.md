# دليل تشخيص مشاكل طلبات الشراكة
# Partnership Request Troubleshooting Guide

## 📋 نظرة عامة
## Overview

هذا الدليل يساعدك في تشخيص مشاكل إنشاء طلبات الشراكة.
This guide helps you troubleshoot partnership request creation issues.

---

## 🔍 كيفية قراءة السجلات
## How to Read Logs

### 1️⃣ في Backend Console
### In Backend Console

عند إرسال طلب شراكة، ستظهر الرسائل التالية بالترتيب:
When sending a partnership request, you'll see these messages in order:

#### ✅ **الخطوة 1: استلام البيانات**
#### **Step 1: Request Received**

```
Request body received: {
  "type": "partnership",
  "metadata": { ... },
  ...
}
```

**ما يجب البحث عنه:**
- ✅ تأكد من أن `type` = `"partnership"`
- ✅ تأكد من وجود `metadata` مع الحقول المطلوبة
- ✅ تأكد من أن `amount` و `currency` موجودان فقط إذا كان `investmentAmount` > 0

#### ✅ **الخطوة 2: Validation**
#### **Step 2: Validation**

**إذا نجحت:**
```
Validation successful, validated data: { ... }
```

**إذا فشلت:**
```
Validation failed: [
  {
    "path": ["metadata", "companyName"],
    "message": "Required"
  }
]
```

**ما يجب البحث عنه:**
- ✅ إذا فشلت validation، راجع `Validation failed` للتعرف على الحقول المفقودة أو غير الصحيحة

#### ✅ **الخطوة 3: إنشاء Request Number**
#### **Step 3: Request Number Generation**

في `request-number.service.ts`، ستظهر رسالة خطأ إذا فشل:
In `request-number.service.ts`, you'll see an error if it fails:

```
Failed to generate request number: [error details] - Code: [error code]
```

#### ✅ **الخطوة 4: إدراج البيانات**
#### **Step 4: Database Insert**

```
Creating request with payload: {
  user_id: "...",
  request_number: "INV-2025-XXXXX",
  type: "partnership",
  amount: ...,
  currency: ...,
  has_metadata: true,
  metadata_keys: ["companyName", "partnershipType", ...]
}
```

**إذا نجحت:**
- ✅ لا توجد رسائل خطأ
- ✅ الطلب يتم إنشاؤه بنجاح

**إذا فشلت:**
```
Database insert error: {
  error: { ... },
  code: "23505",  // Example: unique violation
  message: "duplicate key value violates unique constraint",
  details: "...",
  hint: "...",
  payload: { ... }
}
```

**أخطاء شائعة:**
- `23505`: `request_number` موجود مسبقاً (UNIQUE constraint violation)
- `23503`: Foreign key violation (مشكلة في `user_id`)
- `23514`: Check constraint violation (مشكلة في `amount` أو `currency`)

#### ✅ **الخطوة 5: إنشاء Event**
#### **Step 5: Event Creation**

```
Failed to create request event: [error details]
```

---

### 2️⃣ في Network Tab (المتصفح)
### In Network Tab (Browser)

1. افتح **Developer Tools** (F12)
2. انتقل إلى **Network** tab
3. أرسل طلب الشراكة
4. ابحث عن الطلب: `POST /api/v1/investor/requests`

**تحقق من:**

#### **Request Payload:**
```json
{
  "type": "partnership",
  "metadata": {
    "companyName": "...",
    "partnershipType": "...",
    "contactPerson": "...",
    "contactEmail": "..."
  },
  "amount": 500000,  // فقط إذا كان > 0
  "currency": "SAR"  // فقط إذا كان amount موجود
}
```

#### **Response:**
- ✅ **201 Created**: نجح إنشاء الطلب
  ```json
  {
    "requestId": "...",
    "requestNumber": "INV-2025-XXXXX",
    "status": "draft"
  }
  ```

- ❌ **400 Bad Request**: فشل validation
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Invalid request payload",
      "details": [...]
    }
  }
  ```

- ❌ **500 Internal Server Error**: خطأ في الخادم
  ```json
  {
    "error": {
      "code": "INTERNAL_ERROR",
      "message": "Failed to create request",
      "details": "..." // فقط في development mode
    }
  }
  ```

---

## 🐛 الأخطاء الشائعة والحلول
## Common Errors and Solutions

### ❌ خطأ: `Failed to create request`

#### **المشكلة 1: Validation Failed**
```
Validation failed: [
  {
    "path": ["metadata", "companyName"],
    "message": "Required"
  }
]
```

**الحل:**
- تأكد من ملء جميع الحقول المطلوبة في النموذج
- تحقق من أن الحقول لا تحتوي على قيم فارغة بعد `trim()`

#### **المشكلة 2: Database Insert Error**
```
Database insert error: {
  code: "23505",
  message: "duplicate key value violates unique constraint"
}
```

**الحل:**
- `request_number` موجود مسبقاً
- تحقق من دالة `generate_request_number()` في قاعدة البيانات
- تأكد من أن sequence يتم زيادته بشكل صحيح

#### **المشكلة 3: Foreign Key Violation**
```
Database insert error: {
  code: "23503",
  message: "insert or update on table \"requests\" violates foreign key constraint"
}
```

**الحل:**
- `user_id` غير موجود في جدول `users`
- تحقق من أن المستخدم مسجل دخول بشكل صحيح
- تحقق من أن `req.user?.id` موجود

#### **المشكلة 4: Check Constraint Violation**
```
Database insert error: {
  code: "23514",
  message: "new row for relation \"requests\" violates check constraint"
}
```

**الحل:**
- مشكلة في قيود `amount` أو `currency`
- تحقق من أن `amount` > 0 إذا كان موجوداً
- تحقق من أن `currency` في القائمة المسموح بها (SAR, USD, EUR)

---

## 📝 Checklist للتشخيص
## Diagnostic Checklist

### ✅ قبل إرسال الطلب:
- [ ] جميع الحقول المطلوبة مملوءة
- [ ] `investmentAmount` > 0 (إذا كان مطلوباً)
- [ ] المستخدم مسجل دخول
- [ ] الـ backend يعمل

### ✅ عند إرسال الطلب:
- [ ] افتح Backend Console
- [ ] افتح Browser Network Tab
- [ ] أرسل الطلب
- [ ] راقب الرسائل في Console

### ✅ بعد إرسال الطلب:
- [ ] تحقق من Backend Console للرسائل
- [ ] تحقق من Network Tab للـ response
- [ ] إذا كان هناك خطأ، ابحث عن:
  - `Validation failed`
  - `Database insert error`
  - `Failed to generate request number`

---

## 🔧 إصلاحات تم تطبيقها
## Applied Fixes

### ✅ تحسين معالجة Metadata:
- تنظيف metadata وإزالة القيم الفارغة
- التأكد من إرسال metadata بشكل صحيح
- استخدام `null` إذا كان metadata فارغاً

### ✅ تحسين معالجة Amount/Currency:
- إرسال `amount` و `currency` فقط إذا كان `investmentAmount` > 0
- التأكد من التزامن مع قاعدة البيانات

### ✅ تحسين تسجيل الأخطاء:
- تسجيل مفصل في كل خطوة
- تسجيل تفاصيل أخطاء قاعدة البيانات
- تسجيل payload المرسل

---

## 📞 خطوات التواصل عند الحاجة
## Steps to Contact Support

إذا استمرت المشكلة، قم بتوفير:

1. **Backend Console Logs:**
   - `Request body received:`
   - `Validation failed:` أو `Validation successful:`
   - `Database insert error:` (إذا كان موجوداً)
   - `Failed to create request:`

2. **Network Tab Response:**
   - Status code
   - Response body

3. **Request Payload:**
   - البيانات المرسلة من Frontend

---

## 📚 المراجع
## References

- [Supabase Error Codes](https://www.postgresql.org/docs/current/errcodes-appendix.html)
- [Zod Validation](https://zod.dev/)
- [Request Service](../backend/src/services/request.service.ts)
- [Request Controller](../backend/src/controllers/request.controller.ts)

---

---

## 🔥 خطأ 500 من Netlify
## 500 Error from Netlify

إذا كنت تحصل على خطأ 500 من Netlify (`investor-bacura.netlify.app`):

### 1️⃣ تحقق من Netlify Function Logs:

1. **اذهب إلى Netlify Dashboard:**
   - https://app.netlify.com/
   - اختر موقعك `investor-bacura`
   - اذهب إلى **Functions** → **server** → **Logs**

2. **ابحث عن:**
   - `Request body received:`
   - `Validation failed:`
   - `Database insert error:`
   - `Failed to create request:`
   - أي أخطاء (خطأ باللون الأحمر)

### 2️⃣ الأخطاء الشائعة في Netlify:

#### ❌ **خطأ: "Failed to generate request number"**
```
Failed to generate request number: [error message] - Code: [error code]
```

**الحل:**
- تحقق من أن `SUPABASE_SERVICE_ROLE_KEY` موجود في Netlify Environment Variables
- تحقق من أن دالة `generate_request_number()` موجودة في قاعدة البيانات

#### ❌ **خطأ: "Database insert error"**
```
Database insert error: {
  code: "23505",  // أو أي كود آخر
  message: "...",
  ...
}
```

**الحل:**
- راجع الكود في رسالة الخطأ
- تحقق من القيود في قاعدة البيانات

#### ❌ **خطأ: "Request body received:" لكن لا يوجد response**

**الحل:**
- تحقق من أن جميع الحقول المطلوبة موجودة
- تحقق من أن metadata يحتوي على البيانات الصحيحة

### 3️⃣ التحقق من Environment Variables في Netlify:

1. **اذهب إلى Netlify Dashboard:**
   - **Site settings** → **Environment variables**

2. **تأكد من وجود:**
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - أي متغيرات أخرى مطلوبة

### 4️⃣ إعادة النشر (إذا لزم الأمر):

إذا قمت بتغيير الكود مؤخراً:
- ادفع التغييرات إلى Git
- Netlify سيقوم بإعادة النشر تلقائياً
- أو اذهب إلى **Deploys** → **Trigger deploy** → **Deploy site**

---

**آخر تحديث:** 2025-01-30
**Last Updated:** 2025-01-30

