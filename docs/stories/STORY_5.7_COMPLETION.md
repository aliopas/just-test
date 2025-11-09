# Story 5.7 Completion — عرض المحتوى للمستثمرين

**Status:** ✅ Completed  
**Date:** 2025-11-09  
**Owner:** GPT-5 Codex (Cursor session)  

## Summary

تم توفير قناة قراءة عامة للأخبار المنشورة من خلال واجهات API جديدة وتطبيقات واجهة مستخدم للمستثمرين. يستطيع المستثمر الآن استعراض قائمة الأخبار المنشورة والتوجه لقراءة التفاصيل بكامل المحتوى بنسق Markdown.

## Backend

- **Routes:**  
  - إنشاء `newsRouter` جديد تحت `/api/v1/news` مع نقطتي `GET /` (قائمة) و`GET /:id` (تفاصيل منشور منشور).  
  - تحديث `app.ts` لربط المسار العام وإظهاره في رسالة الجذر.

- **Service Layer (`news.service.ts`):**  
  - تعريف أنواع `PublicNewsItem`, `PublicNewsDetail`, `PublicNewsListResult`.  
  - دوال جديدة `listPublishedNews` و`getPublishedNewsById` للتحكم في الاستعلام عن الأخبار المنشورة فقط، مع توليد مقتطف (excerpt) بسيط.  
  - الاستفادة من قائمة معدلة مع pagination، وفرز تنازلي حسب `published_at`.

- **Validation:**  
  - مخطط Zod جديد `publicNewsListQuerySchema` (`page`, `limit`) في `backend/src/schemas/public-news.schema.ts`.

- **Controller:**  
  - `public-news.controller.ts` للتعامل مع التحقق، الاستجابة القياسية للأخطاء (400، 404، 500).

- **Tests:**  
  - تغطية وحدات الخدمة (`news.service.test.ts`) لحالات النجاح / الأخطاء.  
  - تغطية وحدات التحكم العامة (`public-news.controller.test.ts`) مع محاكاة كاملة للسيرفر.

## Frontend

- **أنواع وواجهات:**  
  - تحديث `frontend/src/types/news.ts` بأنواع `InvestorNewsItem`, `InvestorNewsDetail`, `InvestorNewsListResponse`.

- **Localization:**  
  - ملف قاموس جديد `frontend/src/locales/investorNews.ts` باللغتين العربية والإنجليزية.

- **Data Hooks:**  
  - `useInvestorNewsList` و`useInvestorNewsDetail` مع `apiClient` بدون مصادقة (`auth: false`).

- **صفحات جديدة:**  
  - `InvestorNewsListPage.tsx`: شبكة بطاقات للأخبار المنشورة، زر "تحميل المزيد"، حالة فارغة، الاعتماد على `LanguageProvider` و`ToastProvider`.  
  - `InvestorNewsDetailPage.tsx`: عرض العنوان، تاريخ النشر، صورة الغلاف إن وجدت، وتحويل Markdown مبسط إلى عناصر React.  
  - نقاط الدخول: `frontend/src/app/news/main.tsx` و`frontend/src/app/news-detail/main.tsx`.

- **تجربة المستخدم:**  
  - دعم كامل للـ RTL واستخدام التوست عند الفشل.  
  - مرونة في عرض صور الغلاف عبر متغير البيئة `SUPABASE_STORAGE_URL`.

## Docs

- تحديث `docs/front-end-spec.md` بوصف تدفق "Investor News Feed".
- تحديث `README.md` لربط المستند الجديد.
- إنشاء هذا الملف لتوثيق Story 5.7.

## Testing & Verification

- ✅ `npm run lint`
- ✅ `npm run test -- --runTestsByPath backend/tests/news.service.test.ts backend/tests/news.controller.test.ts backend/tests/public-news.controller.test.ts`

## Follow-ups / Nice-to-haves

- تحسين دالة Markdown (استبدال المحول البسيط بمكتبة كاملة مع sanitization).
- إضافة بحث/فلترة متقدمة عند الحاجة.  
- توفير صورة غلاف افتراضية محددة من التصميم.

## File Checklist

- `backend/src/app.ts`
- `backend/src/routes/news.routes.ts`
- `backend/src/controllers/public-news.controller.ts`
- `backend/src/schemas/public-news.schema.ts`
- `backend/src/services/news.service.ts`
- `backend/tests/public-news.controller.test.ts`
- `backend/tests/news.service.test.ts`
- `frontend/src/types/news.ts`
- `frontend/src/locales/investorNews.ts`
- `frontend/src/hooks/useInvestorNews.ts`
- `frontend/src/pages/InvestorNewsListPage.tsx`
- `frontend/src/pages/InvestorNewsDetailPage.tsx`
- `frontend/src/app/news/main.tsx`
- `frontend/src/app/news-detail/main.tsx`
- `docs/front-end-spec.md`
- `docs/stories/STORY_5.7_COMPLETION.md`
- `README.md`

