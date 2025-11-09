# Story 5.5 Completion — واجهة إدارة المحتوى (Frontend)

**Status:** ✅ Completed  
**Date:** 2025-11-09  
**Owner:** GPT-5 Codex (Cursor session)  

## Summary

تم تنفيذ واجهة إدارة الأخبار والإعلانات الخاصة بالأدمن وفقًا لمتطلبات Story 5.5. الواجهة تدعم إدارة دورة حياة المقالة (مسودة → مجدول → منشور) مع رفع صورة الغلاف، تحرير المحتوى بنسق Markdown، البحث، الفلترة، وجدولة النشر.

## What Was Delivered

### 1. صفحة إدارة الأخبار

- صفحة جديدة `frontend/src/pages/AdminNewsPage.tsx` مع Bootstrap مستقل عبر `frontend/src/app/admin-news/main.tsx`.
- رأس توضيحي يعرض الهدف من الشاشة وتلميحات الاستخدام.
- تكامل كامل مع `LanguageProvider` و`ToastProvider` و`@tanstack/react-query`.

### 2. البيانات والتفاعلات

- هوكات جديدة في `frontend/src/hooks/useAdminNews.ts`:
  - `useAdminNewsList` لاستدعاء `GET /admin/news`.
  - Mutations لإنشاء/تعديل/حذف الأخبار (`POST`, `PATCH`, `DELETE`).
  - Mutation لنشر المجدول (`POST /admin/news/publish-scheduled`).
  - Mutation لطلب presigned URL للصور (`POST /admin/news/images/presign`).
- أنواع مشتركة في `frontend/src/types/news.ts` تسهل تبادل البيانات بين المكونات.

### 3. المكونات

- `AdminNewsFilterBar`: بحث، فلترة حسب الحالة، زر إنشاء، زر نشر المجدول.
- `AdminNewsTable`: جدول responsive يعرض العنوان، slug، الحالة، تواريخ الجدولة/النشر، وأزرار التعديل/الحذف.
- `AdminNewsPagination`: تنقل بين الصفحات مع عرض إجمالي العناصر.
- `AdminNewsFormDrawer`: نموذج جانبي يوفر:
  - الحقول (العنوان، slug مع مولد تلقائي، اختيار الحالة).
  - حقول التواريخ عند اختيار `scheduled` أو `published`.
  - رفع صورة الغلاف عبر presigned URL مع معاينة واسترجاع المفتاح التخزيني.
  - محرر Markdown بسيط مع معاينة نصية فورية.
  - إجراءات حفظ/إلغاء/حذف مع تأكيدات وتعطيل أثناء التنفيذ.
- قاموس جديد `frontend/src/locales/adminNews.ts` يغطي جميع الرسائل باللغتين العربية والإنجليزية.

### 4. توستات وحالات الاستخدام

- توستات للنجاح والفشل عند الحفظ، الحذف، نشر المجدول، أو تعذر رفع الصور.
- حالات تحميل، أخطاء، وفراغ داخل الجدول مع زر إعادة المحاولة.
- تعطيل الأزرار أثناء أي عملية (رفع، حفظ، نشر، حذف) لمنع الإجراءات المكررة.

### 5. التوثيق المحدث

- تحديث `docs/front-end-spec.md` بإضافة قسم Admin News Management.
- إضافة هذا المستند لتتبع اكتمال Story 5.5.

## Testing & Verification

- ✅ `npm run lint`
- يعمل التطبيق التجريبي عبر Vite (`npm run dev`) ويمكن الوصول إلى `/app/admin/news`.
- تم التحقق يدويًا من السيناريوهات الأساسية:
  - إنشاء خبر جديد (Draft).
  - رفع صورة غلاف (presigned upload).
  - جدولة خبر وإعادة نشره عبر زر “Publish scheduled”.
  - التعديل والحذف مع انعكاس النتائج في الجدول.

## Known Gaps / Next Steps

- لا يوجد رندر Markdown متقدم (يتم عرض النص فقط في المعاينة). يمكن لاحقًا إدماج محرر Markdown متكامل (مثال: `@uiw/react-md-editor`) إذا لزم الأمر.
- لا يوجد تكامل بعد مع إدارة التصنيفات (Story 5.6) — سيتم تغطيتها في قصص لاحقة.
- يتطلب ربط هذه الواجهة ببوابة الدخول الحقيقية وضبط التحكم بالأذونات في النهاية على بيئة الإنتاج.

## File Checklist

- `frontend/src/types/news.ts`
- `frontend/src/locales/adminNews.ts`
- `frontend/src/hooks/useAdminNews.ts`
- `frontend/src/components/admin/news/*`
- `frontend/src/pages/AdminNewsPage.tsx`
- `frontend/src/app/admin-news/main.tsx`
- `docs/front-end-spec.md`
- `docs/stories/STORY_5.5_COMPLETION.md`

> تم إنجاز Story 5.5 بنجاح، والواجهة جاهزة لاستخدام فريق المحتوى بعد نشر الـ backend والخدمات المساندة.

