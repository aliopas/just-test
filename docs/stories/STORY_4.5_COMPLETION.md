# Story 4.5: طلب معلومات إضافية – حالة الإكمال

**التاريخ:** 2025-11-08  
**الحالة:** ✅ مكتمل

---

## ✅ ما تم إنجازه

### 1. API `POST /admin/requests/:id/request-info`
- إضافة مسار جديد في `admin.routes.ts` محمي بـ `admin.requests.review`.
- التحقق من أن الرسالة المدخلة ليست فارغة (حد أعلى 1000 حرف).
- استخدام `transitionRequestStatus` لنقل الطلب إلى حالة `pending_info` وتسجيل الحدث في `request_events`.
- تسجيل العملية في `audit_logs` تحت الإجراء `request.info_requested`.
- إرسال إشعار Placeholder للمستثمر عبر `notifyInvestorOfInfoRequest`.

### 2. منطق الخدمة
- دالة `requestInfoFromInvestor` في `backend/src/services/admin-request.service.ts` تتولى:
  - التحقق من الرسالة.
  - إجراء الانتقال وتسجيل الحدث/السجل.
  - استدعاء إشعار المستثمر بالرسالة.

### 3. الواجهة الأمامية
- تحديث `AdminRequestDetailPage` لإعادة استخدام حقل الملاحظة كرسالة تطلب معلومات إضافية (إلزامية لهذا الإجراء).
- زر "طلب معلومات" ينفّذ استدعاء `POST /admin/requests/:id/request-info` ويعرض رسائل نجاح/خطأ، مع إعادة تحميل البيانات وتفريغ الحقل.
- إبقاء ملاحظة توضيحية بأن زر طلب المعلومات أصبح فعّالاً وأن الملاحظة مطلوبة.
- إضافة نصوص ترجمة إضافية (`decision.infoRequestedSuccess`, `decision.noteRequired`).

---

## 🧪 الاختبارات
- `npm run lint`
- `npm run test -- --runTestsByPath backend/tests/admin-request.controller.test.ts backend/tests/admin-request.service.test.ts`

---

## 📁 الملفات المتأثرة
- `backend/src/services/admin-request.service.ts`
- `backend/src/controllers/admin-request.controller.ts`
- `backend/src/routes/admin.routes.ts`
- `backend/tests/admin-request.service.test.ts`
- `backend/tests/admin-request.controller.test.ts`
- `backend/src/services/notification.service.ts`
- `frontend/src/pages/AdminRequestDetailPage.tsx`
- `frontend/src/locales/adminRequests.ts`
- `docs/front-end-spec.md`
- `README.md`
- المستند الحالي `docs/stories/STORY_4.5_COMPLETION.md`

---

## 📌 ملاحظات
- الإشعارات ما تزال Placeholder لحين دمج قنوات الإرسال الفعلية.
- بعد انتقال الطلب إلى `pending_info`، يمكن للمستثمر الرد في قصص لاحقة (Story 4.6/5.x).
- تم استخدام نفس حقل الملاحظات للأدمن لجميع الإجراءات، مع التحقق من إلزامية الرسالة فقط عند طلب معلومات إضافية.

---

**تم الإنشاء بواسطة:** GPT-5 Codex (Cursor)  
**آخر تحديث:** 2025-11-08  

