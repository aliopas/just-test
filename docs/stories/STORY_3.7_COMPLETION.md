# Story 3.7: متابعة الطلبات للمستثمر – حالة الإكمال

**التاريخ:** 2025-11-08  
**الحالة:** ✅ مكتمل

---

## ✅ ما تم إنجازه

### 1. API `GET /investor/requests`
- إضافة مخطط `requestListQuerySchema` للتحقق من معاملات الاستعلام (`page`, `limit`, `status`).
- تنفيذ الخدمة `listInvestorRequests` التي تعتمد على العرض `v_request_workflow` وتعيد قائمة الطلبات مع بيانات `meta` (عدد الصفحات، الإجمالي، `hasNext`).
- تفعيل المسار في `investor.routes.ts` مع حماية RBAC (`investor.requests.read` أو `admin.requests.review`).
- إرجاع بيانات الطلب بما في ذلك آخر حدث (من `request_events`) للوصول السريع في الواجهة.

### 2. منطق التحقق والحالات
- التحقق من ملكية الطلبات عبر RLS (Supabase) وإرجاع أخطاء موحدة عند حدوث أخطاء.
- دعم ترشيح الحالة (`status` query) مع Pagination (افتراضي 10 عناصر لكل صفحة).
- إضافة إشعارات Placeholder عند الفشل مع تسجيل للخطأ في الخادم.

### 3. واجهة My Requests
- إنشاء `MyRequestsPage` (`frontend/src/pages/MyRequestsPage.tsx`) مع نقطة الدخول `frontend/src/app/requests/main.tsx`.
- عرض بطاقات الطلبات عبر `RequestList` مع:
  - شارات حالة (`RequestStatusBadge`) وألوان معبرة عن الحالة.
  - شريط تقدم (`RequestProgressBar`) يعكس المرحلة الحالية.
  - فلترة للحالات وزر إنشاء طلب جديد في حالة عدم وجود بيانات.
  - Pagination بسيط (التالي/السابق) وعرض لمؤشرات الصفحة.
- عند النقر على بطاقة يتم فتح `RequestDetailsDrawer` (سايد دراور) يعرض التفاصيل والملحوظات.
- إعادة استخدام نظام الترجمة (`LanguageProvider`) مع قاموس جديد `frontend/src/locales/requestList.ts`.

### 4. الاختبارات
- تحديث `request.controller.test.ts` لتغطية السيناريوهات (مصادقة، تحقق معاملات، نجاح).
- توسيع `request.service.test.ts` للتحقق من دوال `submitInvestorRequest` و`listInvestorRequests` مع mock مبني خصيصًا لسلوك Supabase.

---

## 🧪 الاختبارات
- **وحدة (Jest):** `backend/tests/request.controller.test.ts`, `backend/tests/request.service.test.ts`.
- **اختبار يدوي:** التحقق من الفلترة، الانتقال بين الصفحات، فتح التفاصيل، والتعامل مع حالتي المسودة/المرسلة.

لتشغيل الاختبارات المتعلقة بالقصة:
```bash
npm run test -- --runTestsByPath backend/tests/request.controller.test.ts backend/tests/request.service.test.ts
```

---

## 📁 الملفات المتأثرة / المضافة
- `backend/src/controllers/request.controller.ts`
- `backend/src/routes/investor.routes.ts`
- `backend/src/services/request.service.ts`
- `backend/src/schemas/request-list.schema.ts`
- `backend/tests/request.controller.test.ts`
- `backend/tests/request.service.test.ts`
- `frontend/src/types/request.ts`
- `frontend/src/utils/requestStatus.ts`
- `frontend/src/hooks/useInvestorRequests.ts`
- `frontend/src/locales/requestList.ts`
- `frontend/src/components/request/*` (عناصر جديدة للقائمة، الشارات، السايد دراور)
- `frontend/src/pages/MyRequestsPage.tsx`
- `frontend/src/app/requests/main.tsx`
- توثيق: `docs/front-end-spec.md`, `README.md`

---

## 📌 ملاحظات
- المرفقات لازالت Placeholder، وسيتم ربطها مع Story 3.4 لرفع الملفات الفعلي.
- عرض التفاصيل يستخدم Portal (`drawer-root`)، لذا يجب التأكد من وجود العنصر في DOM عند دمج الصفحة داخل التطبيق الرئيسي.
- الخطوة التالية (Story 3.8) ستبني Endpoint تفصيلي `GET /investor/requests/:id` لعرض كامل السجل والملفات (للمستثمر).

---

**تم الإنشاء بواسطة:** GPT-5 Codex (Cursor)  
**آخر تحديث:** 2025-11-08  

