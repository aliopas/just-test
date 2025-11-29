# 🧪 كيفية تشغيل اختبارات Story 3.4

## ✅ الطريقة الأسهل: استخدام Node.js مباشرة

### 1. استخدام ملف run-tests.js

```bash
node run-tests.js
```

هذا الملف سيشغل الاختبارات تلقائياً.

---

## 📋 الطرق الأخرى

### الطريقة 1: npm مباشرة

```bash
npm test -- request.controller.test.ts --testNamePattern="presignAttachment"
```

### الطريقة 2: npx jest

```bash
npx jest backend/tests/request.controller.test.ts --testNamePattern="presignAttachment"
```

### الطريقة 3: تشغيل جميع اختبارات request controller

```bash
npm test -- request.controller.test.ts
```

### الطريقة 4: تشغيل جميع الاختبارات

```bash
npm test
```

---

## 🔧 إذا واجهت مشاكل

### المشكلة: npm غير موجود
**الحل:**
1. تأكد من تثبيت Node.js
2. تحقق من PATH environment variable

### المشكلة: Cannot find module
**الحل:**
```bash
npm install
```

### المشكلة: Tests timeout
**الحل:**
- تحقق من ملف `.env` موجود
- تحقق من اتصال Supabase (للاختبارات التكاملية)

### المشكلة: PowerShell execution policy
**الحل (PowerShell):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📊 النتيجة المتوقعة

عند النجاح، يجب أن ترى:

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
Snapshots:   0 total
Time:        2.345 s
```

---

## 🎯 الخطوة التالية بعد نجاح الاختبارات

1. **الاختبار اليدوي:**
   ```bash
   # Terminal 1 - Backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **افتح المتصفح:**
   - انتقل إلى `http://localhost:3000`
   - سجّل الدخول
   - اذهب إلى "إنشاء طلب جديد"
   - اختبر رفع الملفات

3. **راجع قائمة التحقق:**
   - `STORY_3.4_MANUAL_TEST_CHECKLIST.md`

---

## 💡 نصيحة

إذا استمرت المشاكل، جرب:

1. **استخدام Command Prompt بدلاً من PowerShell:**
   ```cmd
   npm test -- request.controller.test.ts --testNamePattern="presignAttachment"
   ```

2. **استخدام Git Bash:**
   ```bash
   npm test -- request.controller.test.ts --testNamePattern="presignAttachment"
   ```

3. **استخدام VS Code Terminal:**
   - افتح VS Code
   - اضغط Ctrl+` لفتح Terminal
   - شغّل الأمر

---

**ملاحظة:** جميع الطرق أعلاه تعمل. اختر الطريقة التي تناسبك!

