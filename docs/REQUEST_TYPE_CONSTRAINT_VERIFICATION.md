# تحقق من قيد نوع الطلب والقوانين
# Request Type Constraint Verification

## ✅ القيد الحالي في قاعدة البيانات
## Current Database Constraint

### القيد `requests_type_check`:
### Constraint `requests_type_check`:

```sql
CHECK (type IN (
  'buy', 
  'sell', 
  'partnership', 
  'board_nomination', 
  'feedback'
))
```

**✅ القيد صحيح ويسمح بجميع الأنواع الخمسة!**

**✅ The constraint is correct and allows all five types!**

---

### حجم عمود `type`:
### Column `type` size:

```sql
VARCHAR(50) -- كافٍ لجميع القيم
```

**✅ الحجم كافٍ!**
**✅ Size is sufficient!**

---

## ✅ Backend Schema
## Backend Schema

### ملف: `backend/src/schemas/request.schema.ts`

**✅ يسمح بجميع الأنواع:**

```typescript
type: z.enum(['buy', 'sell', 'partnership', 'board_nomination', 'feedback'])
```

**✅ يستخدم `discriminatedUnion` لفصل:**
- الطلبات المالية (`buy`, `sell`) - `amount` و `currency` مطلوبين
- الطلبات غير المالية (`partnership`, `board_nomination`, `feedback`) - `amount` و `currency` اختياريين

---

## ✅ Frontend Forms
## Frontend Forms

### النماذج الموجودة:

1. **✅ `PartnershipRequestForm.tsx`**
   - ✅ يرسل `type: 'partnership'`
   - ✅ يرسل `amount` و `currency` فقط إذا تم تقديمهما
   - ✅ يرسل `metadata` مع البيانات

2. **✅ `BoardNominationRequestForm.tsx`** - **تم الإصلاح!**
   - ✅ لا يرسل `amount` أو `currency`
   - ✅ يرسل فقط `type`, `metadata`, و `notes`

3. **✅ `FeedbackRequestForm.tsx`**
   - ✅ لا يرسل `amount` أو `currency`
   - ✅ يرسل `metadata` فقط

---

## 🔧 المشاكل المكتشفة
## Issues Discovered

### 1. `BoardNominationRequestForm.tsx`

**المشكلة:**
**Problem:**

```typescript
// ❌ خطأ - يرسل amount دائماً
const result = await createRequest.mutateAsync({
  type: 'board_nomination' as RequestType,
  amount: 1, // ❌ لا يجب إرسال amount للطلبات غير المالية
  currency: 'SAR',
  // ...
});
```

**يجب أن يكون:**
**Should be:**

```typescript
// ✅ صحيح - لا يرسل amount أو currency
const result = await createRequest.mutateAsync({
  type: 'board_nomination' as RequestType,
  // لا يرسل amount أو currency للطلبات غير المالية
  metadata: { /* ... */ },
  notes: values.nominationReason,
});
```

---

## ✅ التحقق من API Hook
## API Hook Verification

### `useCreateRequest` في `frontend/src/hooks/useCreateRequest.ts`

**✅ الكود صحيح:**
- يرسل `amount` و `currency` فقط إذا تم توفيرهما
- لا يفرض إرسال `amount` أو `currency`

---

## 📋 ملخص
## Summary

### ✅ ما يعمل بشكل صحيح:
### What works correctly:

1. ✅ **قاعدة البيانات:** القيد يسمح بجميع الأنواع
2. ✅ **Backend Schema:** يدعم جميع الأنواع
3. ✅ **PartnershipRequestForm:** يعمل بشكل صحيح
4. ✅ **FeedbackRequestForm:** يعمل بشكل صحيح
5. ✅ **API Hook:** يرسل البيانات بشكل صحيح

### ✅ جميع المشاكل تم إصلاحها:
### All issues have been fixed:

1. ✅ **BoardNominationRequestForm:** تم إزالة `amount` و `currency`

---

## 🎯 التوصيات
## Recommendations

1. **إصلاح `BoardNominationRequestForm.tsx`:**
   - إزالة `amount: 1` و `currency: 'SAR'`
   - إرسال فقط `type`, `metadata`, و `notes`

2. **التحقق من قاعدة البيانات:**
   - ✅ القيد الحالي صحيح
   - ✅ العمود `type` حجمه كافٍ

3. **اختبار:**
   - جرب إنشاء طلب `board_nomination` للتأكد من أنه يعمل بدون `amount`

---

**آخر تحديث:** 2025-01-30
**Last Updated:** 2025-01-30

