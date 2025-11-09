# Story 5.4: جدولة النشر – حالة الإكمال

**التاريخ:** 2025-11-08  
**الحالة:** ✅ مكتمل

---

## ✅ ما تم إنجازه

### 1. منطق جدولة النشر
- إضافة الدالة `publishScheduledNews` في `backend/src/services/news.service.ts` التي:
  - تبحث عن الأخبار ذات الحالة `scheduled` التي حان وقتها (`scheduled_at <= الآن`).
  - تحدّث الحالة إلى `published` وتعيّن `published_at` و `updated_at`.
  - تستدعي `notifyInvestorsOfPublishedNews` (Placeholder) لكل عنصر منشور.

### 2. واجهة إدارية للتحكم
- إضافة `newsController.publishScheduled` وربط المسار `POST /admin/news/publish-scheduled` بصلاحية `admin.content.manage`.
- الاستجابة تشمل عدد العناصر المنشورة وقائمتها لتسهيل التتبع.

### 3. الاختبارات
- تغطية وظيفية في `backend/tests/news.service.test.ts` (تشمل حالات النجاح، عدم وجود عناصر، وأخطاء Supabase).
- تغطية وحدة التحكم في `backend/tests/news.controller.test.ts`.
- تمرير `npm run lint` و `npm run test -- --runTestsByPath backend/tests/news.controller.test.ts backend/tests/news.service.test.ts`.

---

## 🧪 الاختبارات
- `npm run lint`
- `npm run test -- --runTestsByPath backend/tests/news.controller.test.ts backend/tests/news.service.test.ts`

---

## 📁 الملفات المتأثرة
- `backend/src/services/notification.service.ts`
- `backend/src/services/news.service.ts`
- `backend/src/controllers/news.controller.ts`
- `backend/src/routes/admin.routes.ts`
- `backend/tests/news.service.test.ts`
- `backend/tests/news.controller.test.ts`
- `docs/stories/STORY_5.4_COMPLETION.md`

---

## 📌 ملاحظات
- وظيفة الجدولة الحالية تعتمد على استدعاء مسار إداري (يمكن ربطه بجدولة خارجية أو Job لاحقة).
- آلية الإشعارات ما تزال Placeholder حتى يتم دمج قنوات الإرسال الحقيقية.
- يمكن توسيع الدالة لاحقاً لدعم حدود معينة أو تقسيم النشر على دفعات كبيرة.

---

**تم الإنشاء بواسطة:** GPT-5 Codex (Cursor)  
**آخر تحديث:** 2025-11-08  

