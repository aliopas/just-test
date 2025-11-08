# Story 4.3: لوحة قرار الطلب للأدمن – حالة الإكمال

**التاريخ:** 2025-11-08  
**الحالة:** ✅ مكتمل

---

## ✅ ما تم إنجازه

### 1. API `GET /admin/requests/:id`
- إضافة الدالة `getAdminRequestDetail` في `backend/src/services/admin-request.service.ts` للحصول على بيانات الطلب الكاملة، المرفقات، الأحداث، والتعليقات (مستخرجة من notes).
- دعم العلاقات مع جدول `users` و`investor_profiles` لعرض بيانات المستثمر.
- التعامل مع الأخطاء جزئيًا (عدم العثور، فشل المرفقات، فشل الأحداث).
- تحديث `adminRequestController`، وإضافة مسار جديد في `admin.routes.ts` مع حماية RBAC `admin.requests.review`.

### 2. الواجهة الأمامية: صفحة تفاصيل طلب الأدمن
- إنشاء صفحة مستقلة `AdminRequestDetailPage` (`frontend/src/pages/AdminRequestDetailPage.tsx`) مع نقطة دخول `frontend/src/app/admin-request-detail/main.tsx`.
- عرض شامل لمعلومات الطلب، بيانات المستثمر، Timeline للأحداث، التعليقات الداخلية، والمرفقات.
- أزرار القرار (قبول/رفض/طلب معلومات) موجودة كبلايسهولدر لحين تنفيذ القصص التالية.
- دعم الحالات: التحميل، الخطأ (مع زر إعادة المحاولة)، والحالات الفارغة.
- إضافة روابط من جدول صندوق الوارد لفتح التفاصيل (`/app/admin/requests/:id`).

### 3. طبقة البيانات وLocalization
- `useAdminRequestDetail` (TanStack Query) لجلب البيانات التفصيلية.
- تحديث `frontend/src/types/admin.ts` لتعريف أنواع التفاصيل (attachments, events, comments).
- تحديث قاموس `frontend/src/locales/adminRequests.ts` برسائل تفاصيل الطلب.
- إعادة تصدير قائمة الحالات `REQUEST_STATUSES` لاستخدامها في شريط الفلاتر والواجهة.

### 4. الاختبارات
- **خدمة:** `backend/tests/admin-request.service.test.ts` تغطي حالات عدم العثور، ونجاح الاسترجاع مع المرفقات/الأحداث.
- **كونترولر:** `backend/tests/admin-request.controller.test.ts` تغطي المصادقة، عدم العثور، والنجاح.
- تم تشغيل `npm run lint` و `npm run test -- --runTestsByPath backend/tests/admin-request.controller.test.ts backend/tests/admin-request.service.test.ts`.

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
- `frontend/src/types/admin.ts`
- `frontend/src/hooks/useAdminRequestDetail.ts`
- `frontend/src/components/admin/requests/AdminRequestsTable.tsx`
- `frontend/src/pages/AdminRequestDetailPage.tsx`
- `frontend/src/app/admin-request-detail/main.tsx`
- `frontend/src/locales/adminRequests.ts`
- `frontend/src/utils/requestStatus.ts`
- `docs/front-end-spec.md`
- `README.md`
- المستند الحالي `docs/stories/STORY_4.3_COMPLETION.md`

---

## 📌 ملاحظات
- أزرار القرار معطّلة حالياً وستُفعّل مع تنفيذ Stories 4.4 و4.5.
- روابط التنزيل للمرفقات تعتمد على البيانات الحالية؛ يمكن دمج آليات Signed URLs للأدمن لاحقاً.
- سيتم ربط الصفحة مع صندوق الوارد عبر نظام التوجيه أو Router عند بناء لوحة الأدمن الكاملة.

---

**تم الإنشاء بواسطة:** GPT-5 Codex (Cursor)  
**آخر تحديث:** 2025-11-08  

