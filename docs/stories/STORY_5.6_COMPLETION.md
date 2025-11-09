# Story 5.6 Completion — نظام الموافقة على المحتوى

**Status:** ✅ Completed  
**Date:** 2025-11-09  
**Owner:** GPT-5 Codex (Cursor session)  

## Summary

تم تنفيذ نظام الموافقة على الأخبار قبل النشر، بما يشمل سير العمل في قاعدة البيانات، واجهات الـ API، إدارة السجل، الإشعارات، وواجهة المستخدم التي تسمح بالمراجعة والمصادقة أو الرفض مع تعليقات.

## Backend

- **Migration (`20241108100000_news_approval_workflow.sql`):**
  - إضافة حالات `pending_review` و`rejected` إلى نوع `news_status`.
  - إنشاء نوع `news_review_action` وقاعدة `news_reviews` لتسجيل قرارات المراجعة (المراجع، الإجراء، التعليق، الطابع الزمني) مع سياسات RLS للأدمن.
- **Schemas:** تحديث `news.schema.ts` لدعم الحالات الجديدة، إضافة مخططات التحقق `newsApproveSchema` و`newsRejectSchema`.
- **Service Layer (`news.service.ts`):**
  - إضافة أنواع `NewsReview` وتغذية `NewsItem` بالمراجعات.
  - `approveNews` و`rejectNews` مع تسجيل إلى `audit_logs`، إنشاء سجل في `news_reviews`، إرسال الإشعارات، وتفعيل النشر الفوري أو إبقاء الحالة مجدولة.
  - استدعاء `notifyAuthorOfNewsApproval` و`notifyAuthorOfNewsRejection` (مكان-holder) بالإضافة إلى `notifyInvestorsOfPublishedNews`.
- **Controller & Routes:**
  - نقاط جديدة `POST /admin/news/:id/approve`، `POST /admin/news/:id/reject` مع معالجة للأخطاء القياسية (400/404/409/500).
  - تحديث `admin.routes.ts` لإضافة المسارات الجديدة تحت صلاحية `admin.content.manage`.
- **Tests:**
  - تحديث شامل لـ `news.service.test.ts` مع حالات الموافقة والرفض، التحقق من الإشعارات، الحالات غير الصالحة، وتعليقات الرفض.
  - إضافة تغطية في `news.controller.test.ts` لكل السيناريوهات (valiation، نجاح، أخطاء منطقية).

## Frontend

- **Hooks (`useAdminNews.ts`):**
  - `useApproveNewsMutation`, `useRejectNewsMutation`, `useAdminNewsDetail` مع تحديث الكاش بعد كل عملية.
- **Types & Locales:**
  - توسيع `NewsStatus`, إضافة `AdminNewsReview`.
  - رسائل جديدة في `adminNews.ts` للحالات الجديدة، أزرار الموافقة/الرفض، سجل المراجعات، والتوستات.
- **UI Components:**
  - `AdminNewsTable`: عرض أزرار ✅ موافقة و🚫 رفض عند الحالة `pending_review`، تعطيل أثناء التنفيذ، شارات ألوان للحالات الجديدة.
  - `AdminNewsFormDrawer`: دعم اختيار الحالات الإضافية، وعرض سجل المراجعات (القرار، التاريخ، المراجع، التعليق) داخل النموذج مع حالة تحميل عند جلب التفاصيل.
  - `AdminNewsPage`: استخدام الاستعلام التفصيلي عند فتح النموذج، توستات للنجاح/الفشل، نافذة حوار (`prompt`) لتجميع تعليق الموافقة/الرفض، وإدارة الحالات الفارغة.
- **Filter Options:** تحديث شريط الفلترة ليشمل `pending_review`, `rejected`, `archived`.

## Notifications

- توسيع `notification.service.ts` بوظائف placeholder:
  - `notifyAuthorOfNewsApproval`
  - `notifyAuthorOfNewsRejection`

## Testing & Verification

- ✅ `npm run lint`
- ✅ Jest unit tests (`news.service`, `news.controller`)

## Known Follow-ups

- ربط الإشعارات الحقيقية (Email/SMS/Push) لاحقاً.
- تحسين واجهة التعليقات (استبدال `window.prompt` بنموذج مخصص وموحّد).
- دمج نظام التصنيفات والمصادقة النهائية في قصص تالية (Story 5.7+).

## File Checklist

- `supabase/migrations/20241108100000_news_approval_workflow.sql`
- `backend/src/schemas/news.schema.ts`
- `backend/src/services/news.service.ts`
- `backend/src/controllers/news.controller.ts`
- `backend/src/routes/admin.routes.ts`
- `backend/src/services/notification.service.ts`
- `backend/tests/news.service.test.ts`
- `backend/tests/news.controller.test.ts`
- `frontend/src/types/news.ts`
- `frontend/src/locales/adminNews.ts`
- `frontend/src/hooks/useAdminNews.ts`
- `frontend/src/components/admin/news/AdminNewsTable.tsx`
- `frontend/src/components/admin/news/AdminNewsFormDrawer.tsx`
- `frontend/src/components/admin/news/AdminNewsFilterBar.tsx`
- `frontend/src/pages/AdminNewsPage.tsx`
- `docs/front-end-spec.md`
- `docs/stories/STORY_5.6_COMPLETION.md`

