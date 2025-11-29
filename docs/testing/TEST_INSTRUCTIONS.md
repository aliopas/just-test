# 🧪 تعليمات تشغيل الاختبارات - Story 3.4

## الطريقة 1: استخدام Terminal مباشرة

### في PowerShell أو Command Prompt:

```bash
npm test -- request.controller.test.ts --testNamePattern="presignAttachment"
```

أو لتشغيل جميع اختبارات request controller:

```bash
npm test -- request.controller.test.ts
```

---

## الطريقة 2: استخدام ملفات التشغيل

### Windows (Command Prompt):
```bash
RUN_TESTS.bat
```

### Windows (PowerShell):
```powershell
.\RUN_TESTS.ps1
```

**ملاحظة:** قد تحتاج إلى تشغيل:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## الطريقة 3: تشغيل جميع الاختبارات

```bash
npm test
```

---

## 📊 النتيجة المتوقعة

### عند النجاح:
```
PASS  backend/tests/request.controller.test.ts
  requestController.presignAttachment
    ✓ returns 401 when user not authenticated
    ✓ returns 400 when request id is missing
    ✓ returns 400 when payload is invalid
    ✓ returns 400 when file type is not allowed
    ✓ returns 400 when file size exceeds 10MB
    ✓ returns 404 when request not found
    ✓ returns 403 when request not owned
    ✓ returns 409 when request is not editable
    ✓ returns presign URL on success

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
```

---

## 🔍 إذا فشلت الاختبارات

### المشكلة: Cannot find module
**الحل:**
```bash
npm install
```

### المشكلة: Tests timeout
**الحل:**
- تحقق من اتصال Supabase
- تحقق من متغيرات البيئة في `.env`

### المشكلة: Module not found
**الحل:**
```bash
npm install
cd backend
npm install
```

---

## ✅ بعد نجاح الاختبارات

1. **الاختبار اليدوي:**
   - شغّل Backend: `npm run dev`
   - شغّل Frontend: `cd frontend && npm run dev`
   - افتح المتصفح واختبر رفع الملفات

2. **راجع:**
   - `STORY_3.4_MANUAL_TEST_CHECKLIST.md` للاختبار اليدوي الشامل

---

**ملاحظة:** إذا واجهت أي مشاكل، راجع:
- `docs/stories/STORY_3.4_TESTING_GUIDE.md` - دليل الاختبار الشامل
- `TEST_STORY_3.4.md` - دليل الاختبار السريع

