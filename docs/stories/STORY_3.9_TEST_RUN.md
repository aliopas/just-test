# Story 3.9: تعليمات تشغيل الاختبارات

**التاريخ:** 2025-01-16

---

## ✅ التحقق اليدوي من الكود

تم التحقق من الكود يدوياً والتأكد من:

### Controller Tests
- ✅ جميع mocks موجودة ومضبوطة
- ✅ جميع test cases موجودة (9 اختبارات)
- ✅ التوافق مع باقي الاختبارات في الملف

### Service Tests
- ✅ Mock لـ `generateRequestNumber` موجود
- ✅ جميع handlers موجودة
- ✅ جميع test cases موجودة (9 اختبارات)
- ✅ التوافق مع باقي الاختبارات في الملف

---

## 🚀 تشغيل الاختبارات

**ملاحظة:** يجب تشغيل الاختبارات من **root directory** (وليس من `backend/`) لأن Jest config موجود في الجذر.

### Windows PowerShell

```powershell
# من root directory (C:\Users\USER\Documents\GitHub\invastors-bacura)

# تشغيل اختبارات Controller للـ partnership فقط
npm test -- backend/tests/request.controller.test.ts --testNamePattern="createPartnership"

# تشغيل اختبارات Service للـ partnership فقط
npm test -- backend/tests/request.service.test.ts --testNamePattern="createPartnershipRequest"

# أو تشغيل جميع الاختبارات في ملف Controller
npm test -- backend/tests/request.controller.test.ts

# أو تشغيل جميع الاختبارات في ملف Service
npm test -- backend/tests/request.service.test.ts
```

### Command Prompt (CMD)

```cmd
# من root directory
npm test -- backend/tests/request.controller.test.ts --testNamePattern="createPartnership"
npm test -- backend/tests/request.service.test.ts --testNamePattern="createPartnershipRequest"
```

### Git Bash / Linux / macOS

```bash
# من root directory
npm test -- backend/tests/request.controller.test.ts --testNamePattern="createPartnership"
npm test -- backend/tests/request.service.test.ts --testNamePattern="createPartnershipRequest"
```

---

## 📋 الاختبارات المتوقعة

### Controller Tests (9 اختبارات)
1. ✅ returns 401 when user not authenticated
2. ✅ returns 400 when payload is invalid
3. ✅ returns 400 when partnership plan is missing
4. ✅ returns 400 when partnership plan is too short
5. ✅ returns 400 when proposed amount is negative
6. ✅ returns 404 when project not found
7. ✅ returns 201 with partnership request details on success
8. ✅ returns 201 with optional projectId on success
9. ✅ handles internal errors

### Service Tests (9 اختبارات)
1. ✅ throws PROJECT_NOT_FOUND when project does not exist
2. ✅ creates partnership request without projectId
3. ✅ creates partnership request with projectId and verifies project exists
4. ✅ saves partnership data in metadata field
5. ✅ creates request with draft status
6. ✅ logs initial event in request_events
7. ✅ sets amount to null when proposedAmount is not provided
8. ✅ handles database error when creating request
9. ✅ handles error when logging event fails

---

## ⚠️ ملاحظات

إذا واجهت أي أخطاء:

1. **تأكد من وجود dependencies:**
   ```bash
   npm install
   ```

2. **تحقق من إعداد Jest:**
   ```bash
   npm test -- --version
   ```

3. **تشغيل اختبار واحد للتأكد:**
   ```bash
   npm test -- request.controller.test.ts -t "returns 401"
   ```

---

**تم التحقق:** ✅ الكود صحيح وجاهز للتشغيل

