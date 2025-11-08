# Story 3.8: عرض تفاصيل الطلب للمستثمر – حالة الإكمال

**التاريخ:** 2025-11-08  
**الحالة:** ✅ مكتمل

---

## ✅ ما تم إنجازه

### 1. API `GET /investor/requests/:id`
- إضافة دالة خدمة `getInvestorRequestDetail` التي تتحقق من ملكية الطلب، وتجمع بياناته الأساسية، المرفقات، وسجل الأحداث.
- توليد روابط تنزيل موقّتة (Signed URL) لكل مرفق باستخدام Supabase Storage عند توفر مفتاح التخزين (`storage_key`).
- استخراج التعليقات من ملاحظات الأحداث (Notes) لتغذية واجهة المستخدم.
- التعامل مع حالات الخطأ (عدم العثور، عدم الملكية، مشاكل المرفقات/الأحداث) وإرجاع أكواد HTTP مناسبة.

### 2. التعديلات في الـ Controller & Routes
- إضافة `requestController.detail` مع معالجة شاملة للأخطاء وإرجاع JSON موحّد.
- توسيع `investor.routes.ts` بمسار `GET /investor/requests/:id` محمي عبر `authenticate` و `requirePermission(['investor.requests.read', 'admin.requests.review'])`.

### 3. الواجهة الأمامية: Request Details Drawer
- تحديث `RequestDetailsDrawer` لطلب بيانات التفصيل عبر `useInvestorRequestDetail`.
- عرض معلومات الطلب، المرفقات مع زر تنزيل، سجل الأحداث (Timeline)، والتعليقات.
- معالجة حالات التحميل والخطأ مع إمكانية إعادة المحاولة.
- دعم كامل لـ RTL والتعريب عبر تحديث قاموس `frontend/src/locales/requestList.ts`.

### 4. نماذج البيانات و Hooks
- توسيع `frontend/src/types/request.ts` لتضمين أنواع المرفقات، الأحداث، والتفاصيل.
- إضافة Hook جديد `useInvestorRequestDetail` وتحديث التجربة في صفحة `MyRequestsPage`.

### 5. الاختبارات
- تحديث `backend/tests/request.controller.test.ts` لتغطية السيناريوهات الجديدة (مصادقة، عدم الوجود، نجاح).
- توسيع `backend/tests/request.service.test.ts` لتعريف mocks أكبر لـ Supabase (queries + Storage) والتحقق من المخرجات (المرفقات، الأحداث، التعليقات).

---

## 🧪 الاختبارات
- **لينتر:** `npm run lint`
- **اختبارات وحدات مستهدفة:**  
  ```bash
  npm run test -- --runTestsByPath backend/tests/request.controller.test.ts backend/tests/request.service.test.ts
  ```

---

## 📁 الملفات المتأثرة
- `backend/src/services/request.service.ts`
- `backend/src/controllers/request.controller.ts`
- `backend/src/routes/investor.routes.ts`
- `backend/src/schemas/request-list.schema.ts`
- `backend/tests/request.controller.test.ts`
- `backend/tests/request.service.test.ts`
- `frontend/src/types/request.ts`
- `frontend/src/hooks/useInvestorRequestDetail.ts`
- `frontend/src/components/request/RequestDetailsDrawer.tsx`
- `frontend/src/locales/requestList.ts`
- `frontend/src/pages/MyRequestsPage.tsx`
- `frontend/src/app/requests/main.tsx`
- `docs/front-end-spec.md`
- `README.md`

---

## 📌 ملاحظات
- روابط التنزيل تعتمد على مفتاح التخزين (`storage_key`) بصيغة `bucket/path`. إذا لم يتوفر تقسيم صالح يتم إرجاع `downloadUrl = null`.
- سيتم تحسين تجربة الاستعراض/التنزيل عقب تنفيذ Story 3.4 (رفع الملفات باستخدام Presigned URLs).
- أي أحداث خالية من الملاحظات تُعرض في الـ Timeline فقط دون أن تُدرج ضمن قائمة التعليقات.

---

**تم الإنشاء بواسطة:** GPT-5 Codex (Cursor)  
**آخر تحديث:** 2025-11-08  

