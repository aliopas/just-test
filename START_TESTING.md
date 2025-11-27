# 🚀 ابدأ الاختبار الآن - Story 3.4

## ✅ الطريقة الأسهل والأسرع

### استخدم الأمر الجديد في package.json:

```bash
npm run test:story-3.4
```

هذا الأمر سيشغل **فقط** اختبارات Story 3.4 (presignAttachment).

---

## 📋 جميع الطرق المتاحة

### 1. ✅ الطريقة الموصى بها (جديدة)
```bash
npm run test:story-3.4
```

### 2. استخدام Node.js script
```bash
node run-tests.js
```

### 3. npm test مباشرة
```bash
npm test -- request.controller.test.ts --testNamePattern="presignAttachment"
```

### 4. npx jest
```bash
npx jest backend/tests/request.controller.test.ts --testNamePattern="presignAttachment"
```

### 5. تشغيل جميع اختبارات request controller
```bash
npm test -- request.controller.test.ts
```

### 6. تشغيل جميع الاختبارات
```bash
npm test
```

---

## 🎯 النتيجة المتوقعة

عند النجاح:

```
PASS  backend/tests/request.controller.test.ts
  requestController.presignAttachment
    ✓ returns 401 when user not authenticated (5ms)
    ✓ returns 400 when request id is missing (2ms)
    ✓ returns 400 when payload is invalid (3ms)
    ✓ returns 400 when file type is not allowed (2ms)
    ✓ returns 400 when file size exceeds 10MB (2ms)
    ✓ returns 404 when request not found (3ms)
    ✓ returns 403 when request not owned (2ms)
    ✓ returns 409 when request is not editable (2ms)
    ✓ returns presign URL on success (4ms)

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
```

---

## 🔧 إذا واجهت مشاكل

### المشكلة: npm غير موجود
**الحل:** تأكد من تثبيت Node.js من [nodejs.org](https://nodejs.org)

### المشكلة: Cannot find module
**الحل:**
```bash
npm install
```

### المشكلة: Tests fail
**الحل:**
- تحقق من ملف `.env` موجود
- تحقق من `backend/tests/setup.ts` موجود

---

## 📝 بعد نجاح الاختبارات

1. **الاختبار اليدوي:**
   - شغّل Backend: `npm run dev`
   - شغّل Frontend: `cd frontend && npm run dev`
   - افتح المتصفح واختبر رفع الملفات

2. **راجع:**
   - `STORY_3.4_MANUAL_TEST_CHECKLIST.md` للاختبار الشامل

---

**ابدأ الآن:** `npm run test:story-3.4` 🚀

