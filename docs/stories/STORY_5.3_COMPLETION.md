# Story 5.3: رفع ومعالجة الصور – حالة الإكمال

**التاريخ:** 2025-11-08  
**الحالة:** ✅ مكتمل

---

## ✅ ما تم إنجازه

### 1. نقطة نهاية توقيع رفع الصور
- إضافة مخطط التحقق `newsImagePresignSchema` في `backend/src/schemas/news.schema.ts` للتحقق من:
  - اسم الملف، نوعه (MIME يبدأ بـ `image/`)، حجم لا يتجاوز 10MB، والامتدادات المدعومة (`jpg`, `jpeg`, `png`, `webp`, `avif`, `gif`).
  - تحديد نوع الصورة (`cover` | `inline`) مع قيمة افتراضية `cover`.

- إنشاء دالة الخدمة `createNewsImageUploadUrl` في `backend/src/services/news.service.ts`:
  - توليد مسار منظم بالصيغة `variant/YYYY/MM/uuid.ext`.
  - استخدام `Supabase Storage` (Bucket افتراضي `news-images` أو من المتغير `NEWS_IMAGES_BUCKET`) لإنشاء `Signed Upload URL`.
  - إرجاع معلومات الرفع (bucket، المسار، الرابط الموقّع، الترويسات المطلوبة).

- إضافة `newsController.presignImage` وربطها بالمسار:
  - `POST /admin/news/images/presign` مع حمايتها بصلاحية `admin.content.manage`.

### 2. الاختبارات
- تحديث `backend/tests/news.service.test.ts` بتغطية `createNewsImageUploadUrl` لحالات النجاح والفشل.
- تحديث `backend/tests/news.controller.test.ts` بتغطية نقطة النهاية الجديدة (تحقق، نجاح، خطأ).
- جميع الفحوصات تمر: `npm run lint` و `npm run test -- --runTestsByPath backend/tests/news.controller.test.ts backend/tests/news.service.test.ts`.

---

## 🧪 الاختبارات
- `npm run lint`
- `npm run test -- --runTestsByPath backend/tests/news.controller.test.ts backend/tests/news.service.test.ts`

---

## 📁 الملفات المتأثرة
- `backend/src/schemas/news.schema.ts`
- `backend/src/services/news.service.ts`
- `backend/src/controllers/news.controller.ts`
- `backend/src/routes/admin.routes.ts`
- `backend/tests/news.service.test.ts`
- `backend/tests/news.controller.test.ts`
- `docs/stories/STORY_5.3_COMPLETION.md`

---

## 📌 ملاحظات
- التخزين يعتمد على `Supabase Storage` مع Bucket `news-images`; يمكن تخصيصه عبر المتغير البيئي `NEWS_IMAGES_BUCKET`.
- المعالجة الفعلية (التحجيم، الضغط، إنشاء النسخ) ستُنفّذ في قصص لاحقة، بينما يمهّد هذا التنفيذ لرفع الملفات بشكل آمن ومضبوط.
- يمكن إعادة استخدام منطق التوقيع لسيناريوهات صور أخرى عبر توسيع variants أو إضافة سياسات إضافية.

---

**تم الإنشاء بواسطة:** GPT-5 Codex (Cursor)  
**آخر تحديث:** 2025-11-08  

