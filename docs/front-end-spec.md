# منصة باكورة الاستثمارية - مواصفات واجهة المستخدم وتجربة الاستخدام
## Bakurah Investors Portal - UI/UX Specification

**الإصدار:** 1.0  
**التاريخ:** 2024-11-06  
**الحالة:** Draft

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2024-11-06 | 1.0 | إنشاء Front End Spec الأولي | BMad Team |
| 2025-11-08 | 1.1 | إضافة صفحة `/app/profile` واستراتيجية i18n/RTL للمستثمر | GPT-5 Codex |
| 2025-11-08 | 1.2 | إضافة صفحة إنشاء الطلب `/app/new-request` مع نماذج وتوست ومقدمات API | GPT-5 Codex |
| 2025-11-08 | 1.3 | إضافة صفحة متابعة الطلبات `/app/requests` بعرض الحالة والتفاصيل | GPT-5 Codex |
| 2025-11-08 | 1.4 | دعم عرض تفاصيل الطلب مع المرفقات وسجل الأحداث | GPT-5 Codex |
| 2025-11-08 | 1.5 | إضافة صفحة صندوق وارد الطلبات للأدمن | GPT-5 Codex |
| 2025-11-08 | 1.6 | إضافة صفحة تفاصيل طلب الأدمن (لوحة القرار) | GPT-5 Codex |

---

## Introduction

هذه الوثيقة تحدد أهداف تجربة المستخدم، بنية المعلومات، تدفقات المستخدم، ومواصفات التصميم البصري لواجهة منصة باكورة الاستثمارية. تعمل كأساس للتصميم البصري وتطوير الواجهة الأمامية، مما يضمن تجربة متماسكة ومرتكزة على المستخدم.

### Design System Snapshot
- المرجع التفصيلي لنظام التصميم: `docs/design-system.md`.
- ملف الألوان والقيم المحوسبة: `frontend/src/styles/theme.ts`.
- مكوّن الشعار المعياري: `frontend/src/components/Logo.tsx` (يستخدم الأصل `frontend/src/assets/logo.jpg`).
- يلتزم النظام بتباين WCAG AA ويعتمد خط **Tajawal** للعربية مع دعم كامل لـ RTL.

### New Investor Profile Experience (v1.1)

- **Entry Route:** `/app/profile` (Vite entry point located at `frontend/src/app/profile/main.tsx`).
- **State Management:** [`@tanstack/react-query`](https://tanstack.com/query/latest) for caching `GET /investor/profile` and invalidating on `PATCH`.
- **Forms & Validation:** [`react-hook-form`](https://react-hook-form.com/) + [`@hookform/resolvers/zod`](https://github.com/react-hook-form/resolvers) with the shared rules in `frontend/src/schemas/investorProfileSchema.ts`.
- **i18n & RTL:** Lightweight context in `frontend/src/context/LanguageContext.tsx` backed by `localStorage`, flipping the document direction and strings defined in `frontend/src/locales/investorProfile.ts`.
- **Notifications & Analytics:** Toast stack (`ToastProvider`, `ToastStack`) for inline success/error messages, and a temporary `analytics` shim logging events until Segment is integrated.
- **Responsive Layout:** Flex + CSS grid—works from 320px mobile up to 1440px desktop, with summary sidebar collapsing on smaller widths.
- **File Upload Placeholder:** UI accepts files and tracks names locally; actual upload workflow to Supabase Storage will be wired alongside Story 3 (requests).
- **Dependencies To Install When Bootstrapping Frontend:**
  - `react`, `react-dom`, `@types/react`, `@types/react-dom`
  - `@tanstack/react-query`
  - `react-hook-form`
  - `@hookform/resolvers`
  - `zod`
  - Optional for testing/E2E: `@testing-library/react`, `@testing-library/jest-dom`, `playwright` (see Story 2.3 completion notes)

### New Request Experience (v1.2)

- **Entry Route:** `/app/new-request` (`frontend/src/app/new-request/main.tsx`)。
- **Core Components:** `NewRequestPage`, `NewRequestForm`, `UploadDropzone` في `frontend/src/components/request/`.
- **State & Data Flow:**
  - `useCreateRequest` (TanStack Query mutation) يستدعي `POST /investor/requests` لحفظ الطلب كمسودة.
  - التحقق عبر `newRequestFormSchema` (Zod) + `react-hook-form`.
  - Toast notifications (`ToastProvider` + `ToastStack`) لتغذية رسائل النجاح/الفشل.
- **المرفقات:** المكون الحالي يحفظ الملفات محليًا (Placeholder) مع دعم السحب والإفلات، وسيتم ربطه بـ Story 3.4 لرفع الملفات الفعلي.
- **i18n:** يعتمد `LanguageProvider` مع قاموس `frontend/src/locales/newRequest.ts` لنصوص النموذج.
- **التحليلات:** Placeholder عبر `analytics.track('request_created')` عند النجاح.
- **ملاحظات:** تتطلب نفس التبعيات المذكورة أعلاه (React Query, Hook Form, Zod). عند إضافة اختبارات واجهة، استخدم `@testing-library/react`.

### Investor Dashboard (v1.0)

- **Entry Route:** `/dashboard` عبر `InvestorDashboardPage` (ضمن shell الرئيسي في `App.tsx`). إعادة التوجيه من `/` إلى `/dashboard`.
- **Providers:** يستخدم `LanguageProvider`, `ToastProvider`, و`QueryClientProvider` (React Query) مع cache زمنية قصيرة (30 ثانية) و`refetchOnWindowFocus`.
- **Data Layer:** `useInvestorDashboard` يستدعي `GET /investor/dashboard` لإرجاع ملخص الطلبات (`requestSummary`)، الأنشطة الأخيرة (`recentRequests`)، العناصر التي تحتاج معلومات إضافية، وعدد الإشعارات غير المقروءة.
- **UI Sections:**
  - **Summary Grid:** بطاقات تعرض إجمالي الطلبات، موزعة حسب الحالة (Submitted, Screening, Pending Info, Compliance Review, Approved, Settling, Completed, Rejected, Draft). كل بطاقة تستخدم `SummaryCard` مع ظلال خفيفة ودعم RTL.
  - **Pending Actions:** قائمة تعرض طلبات `pending_info` مع زر قصير `View request` يؤدي إلى `/requests`. حالة فارغة، Skeleton أثناء التحميل، وزر إعادة المحاولة عند الخطأ.
  - **Recent Activity:** قائمة طلبات حديثة (آخر 5) تعرض رقم الطلب، الحالة باستخدام `getStatusLabel`, المبلغ مع `Intl.NumberFormat`, وختم زمني.
  - **Header Metrics:** عداد الإشعارات غير المقروءة، وطابع محدث (`generatedAt`) بصيغة محلية.
- **Error Handling:** Toasts عند فشل التحميل، شريط تحذير مع زر `Try again` لإعادة الاستعلام (`refetch`).
- **Styling:** يعتمد `palette` (خلفيات surface/alt، حدود soft، ألوان brand)، ويستخدم `animation: pulse` للـ skeleton placeholders.
- **Extensibility:** دعم لاحق لRealtime (Supabase) عبر الاشتراك في `notifications`/`requests` channels (TODO مستقبلي).

### My Requests Experience (v1.3)

- **Entry Route:** `/app/requests` (`frontend/src/app/requests/main.tsx`) مع دعم منفذ `drawer-root` لعرض التفاصيل.
- **Core Components:** داخل `frontend/src/components/request/` وتشمل `RequestList`, `RequestListItem`, `RequestStatusBadge`, `RequestProgressBar`, `RequestDetailsDrawer`.
- **Data Layer:** `useInvestorRequests` (TanStack Query) يستدعي `GET /investor/requests` مع pagination + فلترة حسب الحالة (`status` query).
- **التفاعلات:** أزرار فلترة بحسب الحالة، أزرار Pagination، زر تحديث سريع، واختيار عنصر لفتح تفاصيل الطلب (Side Drawer).
- **التصميم البصري:** بطاقات بطول كامل مع شريط تقدم يرمز للحالة، شارات ملونة للحالة، ولوح تفاصيل يغطي جانب الشاشة مع معلومات أساسية.
- **i18n:** قاموس `frontend/src/locales/requestList.ts` يغطي النصوص، يعتمد نفس `LanguageProvider`.
- **التكامل:** زر Call-to-Action في حالة عدم وجود طلبات ينقل إلى `/app/new-request`.

### Request Detail Experience (v1.4)

- **Entry Route:** نفس صفحة `/app/requests` عبر `RequestDetailsDrawer` (Portal إلى `#drawer-root`).
- **Data Layer:** 
  - `useInvestorRequestDetail` تستدعي `GET /investor/requests/:id` لقراءة تفاصيل الطلب، المرفقات، وآخر حالة.
  - `useRequestTimeline` (Story 6.7) تستدعي `GET /investor/requests/:id/timeline` للحصول على سجل موحّد للأحداث (تنبيهات البريد/التطبيق، انتقالات الحالة).
- **عرض المرفقات:** تضمين معلومات الملف (الاسم، الحجم، النوع) مع زر تنزيل يستعمل روابط موقّتة (Signed URL) عند توافرها.
- **سجل الأحداث:** `RequestTimeline` يعرض العناصر بترتيب زمني تنازلي مع تصنيف نوع الحدث (تنبيه، تغيير حالة)، القناة (Email/In-app)، والجهة (النظام أو الأدمن) مع رسالة ديناميكية بحسب اللغة.
- **التعليقات:** تُحمَّل من `GET /admin/requests/:id` (قائمة القراءة) ومن `GET /admin/requests/:id/comments`، مع واجهة لإضافة تعليق جديد عبر `POST /admin/requests/:id/comments` (Story 4.6). تُعرض بطاقة مخصصة للتعليقات مع إظهار اسم/بريد الكاتب، الطابع الزمني، والنص (بدعم RTL).
- **تجربة الاستخدام:** حالات تحميل/خطأ واضحة، زر تحديث، دعم كامل لـ RTL والنصوص عبر `frontend/src/locales/requestList.ts`، ورسالة خطأ قابلة لإعادة المحاولة عند فشل تحميل الـ Timeline.

### Admin Requests Inbox (v1.5)

- **Entry Route:** `/app/admin/requests` (`frontend/src/app/admin-requests/main.tsx`) ضمن بيئة الأدمن.
- **Data Layer:** `useAdminRequests` يعتمد على `GET /admin/requests` مع معاملات الفلترة (الحالة، النوع، الفترة الزمنية، حدود المبلغ، البحث، الفرز).
- **التفاعلات:** شريط فلاتر تفاعلي (`AdminRequestsFilterBar`) يطبق التغييرات فوراً؛ جدول (`AdminRequestsTable`) يعرض الطلب رقمًا، المستثمر، المبلغ، الحالة، وتاريخ الإنشاء مع مؤشرات بصرية؛ Pagination (`AdminRequestsPagination`) للتنقل بين الصفحات.
- **Localization & RTL:** قاموس `frontend/src/locales/adminRequests.ts` يوفر النصوص العربية/الإنجليزية مع دعم RTL عبر `LanguageProvider`.
- **الحالات:** عرض حالات التحميل، الأخطاء مع زر إعادة المحاولة، والحالة الفارغة.
- **التكامل المستقبلي:** الضغط على الصف سيُستخدم لاحقاً لفتح لوحة القرار (Story 4.3).

### Admin Request Detail (v1.6)

- **Entry Route:** `/app/admin/requests/:id` (`frontend/src/app/admin-request-detail/main.tsx`).
- **Data Layer:** 
  - `useAdminRequestDetail` يستدعي `GET /admin/requests/:id` للحصول على بيانات الطلب، المرفقات، والتعليقات.
  - `useRequestTimeline` (Story 6.7) يستدعي `GET /admin/requests/:id/timeline` ويعيد سجل الاتصال الكامل (تنبيهات المستثمر، تنبيهات العمليات، انتقالات الحالة، التعليقات الداخلية).
- **Layout:** تقسيم من عمودين — العمود الرئيسي يعرض معلومات الطلب، بيانات المستثمر، Timeline، التعليقات؛ العمود الجانبي يعرض المرفقات وإجراءات القرار (كبلايسهولدر) وملاحظات داخلية.
- **Settlement:** بطاقة خاصة بتفاصيل التسوية (المرجع، تاريخ البدء، تاريخ الإتمام، ملاحظات التسوية) يتم تحديثها بعد الانتقال إلى `settling` أو `completed`.
- **Decision Actions:** أزرار (قبول، رفض) تستدعي واجهات Story 4.4 مع ملاحظات داخلية اختيارية وتغذية راجعة فورية؛ زر طلب المعلومات يسمح بإرسال رسالة إلزامية للمستثمر (Story 4.5) وينقل الحالة إلى Pending Info؛ نموذج تعليق داخلي (Story 4.6) بسرية داخلية مع Toasts للنجاح/الفشل وإعادة التحديث التلقائية.
- **التجربة:** حالات تحميل/خطأ واضحة، زر تحديث، دعم للـ RTL والنصوص عبر `frontend/src/locales/adminRequests.ts`، وسيناريو خطأ مخصص عند فشل تحميل Timeline مع زر إعادة المحاولة.

### Admin News Management (v1.0)

- **Entry Route:** `/app/admin/news` (`frontend/src/app/admin-news/main.tsx`) ضمن بيئة الأدمن.
- **Data Layer:** طبقة التفاعل تستخدم `useAdminNewsList`, `useCreateNewsMutation`, `useUpdateNewsMutation`, `useDeleteNewsMutation`, `usePublishScheduledMutation`, `useNewsImagePresignMutation` للوصول إلى `/admin/news*`.
- **Layout:** لوحة رئيسية تحتوي على شريط تحكم (`AdminNewsFilterBar`) للبحث وتغيير الحالة ونشر العناصر المجدولة، جدول (`AdminNewsTable`) يعرض العنوان، الحالة، توقيت الجدولة/النشر، وآخر تحديث، بالإضافة إلى `AdminNewsPagination`.
- **Editing Drawer:** النموذج الجانبي (`AdminNewsFormDrawer`) يوفّر الحقول الكاملة (العنوان، slug، الحالة، التواريخ، المحتوى بنسق Markdown) مع رفع صورة الغلاف عبر presigned URL ومعاينة محلية ومولد تلقائي للـ slug.
- **Review Workflow:** أزرار الموافقة/الرفض تظهر لعناصر `pending_review` مع طلب تعليق، توستات للنجاح/الفشل، وسجل مراجعات داخل النموذج يعرض القرارات مع التاريخ والمراجع والتعليق.
- **Feedback:** Toasts للنجاح والأخطاء، تعطيل للأزرار أثناء العمليات (حفظ، حذف، نشر، رفع)، دعم RTL كامل والنصوص عبر `frontend/src/locales/adminNews.ts`.

### Admin Request Reports (v1.0)

- **Entry Route:** `/admin/reports` عبر `AdminReportsPage` ضمن shell الأدمن (`App.tsx`).
- **Data Layer:** 
  - `useAdminRequestReport` يستدعي `GET /admin/reports/requests` مع معاملات اختيارية (`from`, `to`, `status`, `type`, `minAmount`, `maxAmount`).
  - استدعاء CSV يتم عبر `apiClient` بنفس الفلاتر مع `format=csv`، ثم تنزيل blob محلياً.
- **Filters UI:** 
  - حقول تاريخ/وقت (`datetime-local`) لبداية ونهاية الفترة.
  - أزرار حالة متعددة (pills) مرتبطة بـ `REQUEST_STATUSES`.
  - قائمة منسدلة لنوع الطلب (Buy/Sell/All) وحقول رقمية لنطاق المبلغ.
  - أزرار `Apply filters` (تحدّث الاستعلام) و`Reset`.
- **Results Table:** 
  - تعرض رقم الطلب، الحالة (مترجمة عبر `getStatusLabel`)، النوع، المبلغ (منسق باستخدام `Intl.NumberFormat`)، بيانات المستثمر، التواريخ (`createdAt`, `updatedAt`).
  - حالة فارغة بعبارة localized، وسطر skeleton أثناء `isLoading`.
- **Download CSV:** زر في الـ header يعيد استخدام الفلاتر الحالية، يعرض حالة تحميل، ويطلق Toast للنجاح/الفشل.
- **Localization & RTL:** النصوص في `frontend/src/locales/adminReports.ts`، مع تنسيق تاريخ/عملة ملائم للغة المختارة.
- **Error Handling:** 
  - Toast عند فشل جلب البيانات.
  - Toast مخصص عند فشل تنزيل CSV.
  - لا يتم تحديث الجدول إلا بعد الضغط على `Apply` (يتم الاحتفاظ بالفلاتر المؤقتة في حالة محلية).
- **Extensibility:** يمكن لاحقاً إضافة pagination، حفظ الفلاتر المفضلة، أو جدولة إرسال التقارير بالبريد.

### Investor News Feed (v1.0)

- **Entry Routes:** `/app/news` (`frontend/src/app/news/main.tsx`) لقائمة الأخبار، و`/app/news/:id` (`frontend/src/app/news-detail/main.tsx`) لعرض التفاصيل.
- **Data Layer:** `useInvestorNewsList` و`useInvestorNewsDetail` تتعامل مع API العام (`GET /api/v1/news`, `GET /api/v1/news/:id`) بدون مصادقة، مع caching عبر React Query (`keepPreviousData`).
- **List Experience:** شبكة بطاقات (داخل `InvestorNewsListPage`) تعرض العنوان، مقتطف مختصر، تاريخ النشر، وزر “قراءة المزيد”، إضافة إلى زر “تحميل المزيد” لاسترجاع الصفحة التالية. تشمل حالات التحميل والحالة الفارغة وتوست عند الفشل باستخدام `ToastProvider`.
- **Detail Experience:** صفحة المقال (`InvestorNewsDetailPage`) تعرض صورة الغلاف (إن وجدت)، العنوان، تواريخ النشر/التحديث، وتحويل Markdown مبسّط إلى عناصر React مع دعم RTL.
- **Storage Integration:** يتم توليد رابط الصورة عبر متغير البيئة `SUPABASE_STORAGE_URL` المتاح في `window.__ENV__` أو متغيرات البناء، مع fallback مرئي عند غياب الصورة.

---

## UX Goals & Principles

### Target User Personas

#### 1. المستثمر الفردي (Individual Investor)
- **الوصف:** مستثمر فردي يريد إدارة استثماراته بسهولة
- **الاحتياجات:** واجهة بسيطة وواضحة، خطوات محددة، متابعة سهلة للطلبات
- **المستوى التقني:** مبتدئ إلى متوسط
- **الأهداف:** تقديم طلبات بسرعة، متابعة حالة الاستثمارات

#### 2. المستثمر المؤسسي (Institutional Investor)
- **الوصف:** ممثل عن شركة أو مؤسسة استثمارية
- **الاحتياجات:** واجهة احترافية، تقارير مفصلة، إدارة متعددة المستخدمين
- **المستوى التقني:** متوسط إلى متقدم
- **الأهداف:** إدارة محفظة استثمارية، متابعة متعددة الطلبات

#### 3. الأدمن (Administrator)
- **الوصف:** موظف إداري في باكورة يدير المنصة
- **الاحتياجات:** أدوات إدارية شاملة، فلترة متقدمة، تقارير وإحصائيات
- **المستوى التقني:** متقدم
- **الأهداف:** معالجة الطلبات بسرعة، إدارة المستخدمين، نشر المحتوى

### Usability Goals

1. **سهولة التعلم:** المستخدمون الجدد يمكنهم إكمال المهام الأساسية خلال 5 دقائق
2. **كفاءة الاستخدام:** المستخدمون المتمرسون يمكنهم إكمال المهام المتكررة بأقل عدد من النقرات
3. **منع الأخطاء:** التحقق الواضح والتأكيد للإجراءات الحساسة
4. **القابلية للتذكر:** المستخدمون غير المنتظمين يمكنهم العودة دون إعادة التعلم
5. **الرضا:** تجربة استخدام ممتعة واحترافية تعزز الثقة في المنصة

### Design Principles

1. **الوضوح فوق الذكاء** - أولوية للتواصل الواضح على الابتكار الجمالي
2. **البساطة** - تقليل التعقيد، عرض ما هو ضروري فقط
3. **الاتساق** - استخدام نفس الأنماط والعناصر في جميع أنحاء المنصة
4. **الشفافية** - إظهار حالة النظام والإجراءات بوضوح
5. **الوصولية** - تصميم يمكن الوصول إليه لجميع المستخدمين (WCAG AA)
6. **الاستجابة** - عمل ممتاز على جميع الأجهزة (Desktop, Tablet, Mobile)
7. **الثقة** - تصميم يعزز الثقة في المنصة الاستثمارية

---

## Information Architecture

### Site Map

```
منصة باكورة الاستثمارية
│
├── الصفحة الرئيسية (Landing Page)
│   └── [عام - غير مسجل]
│
├── المصادقة
│   ├── تسجيل الدخول
│   ├── التسجيل
│   ├── التحقق من OTP
│   └── إعادة تعيين كلمة المرور
│
├── لوحة المستثمر (Investor Dashboard)
│   ├── نظرة عامة
│   ├── طلباتي
│   │   ├── قائمة الطلبات
│   │   ├── تفاصيل الطلب
│   │   └── تقديم طلب جديد
│   ├── ملفي الشخصي
│   ├── الإشعارات
│   └── الأخبار
│
└── لوحة الأدمن (Admin Dashboard)
    ├── نظرة عامة
    ├── صندوق وارد الطلبات
    │   ├── قائمة الطلبات
    │   └── تفاصيل الطلب (لوحة القرار)
    ├── إدارة المستخدمين
    ├── إدارة المحتوى
    │   ├── قائمة الأخبار
    │   ├── إنشاء/تعديل خبر
    │   └── التصنيفات
    ├── التقارير والإحصائيات
    └── سجل التدقيق
```

### Navigation Structure

#### للمستثمر
- **Header Navigation:**
  - Logo (رابط للصفحة الرئيسية)
  - القائمة الرئيسية: لوحة التحكم | طلباتي | الأخبار
  - Language Switcher (عربي/English)
  - Profile Menu (الملف الشخصي | الإشعارات | تسجيل الخروج)

- **Sidebar Navigation (في لوحة التحكم):**
  - نظرة عامة
  - طلباتي
  - ملفي الشخصي
  - الإشعارات
  - الأخبار

#### للأدمن
- **Header Navigation:**
  - Logo
  - القائمة الرئيسية: لوحة التحكم | الطلبات | المستخدمين | المحتوى | التقارير
  - Language Switcher
  - Profile Menu

- **Sidebar Navigation:**
  - نظرة عامة
  - صندوق وارد الطلبات
  - إدارة المستخدمين
  - إدارة المحتوى
  - التقارير والإحصائيات
  - سجل التدقيق

---

## User Flows

### Flow 1: تسجيل مستثمر جديد

**User Goal:** التسجيل في المنصة وإنشاء حساب جديد

**Entry Points:**
- زر "تسجيل مستثمر" في الصفحة الرئيسية
- رابط "إنشاء حساب" في صفحة تسجيل الدخول

**Success Criteria:**
- المستخدم يسجل بنجاح
- يتم إرسال OTP
- المستخدم يتحقق من OTP
- الحساب يتم تفعيله
- المستخدم يتم توجيهه إلى لوحة التحكم

**Flow Diagram:**

```mermaid
graph TD
    A[الصفحة الرئيسية] --> B[نموذج التسجيل]
    B --> C{التحقق من البيانات}
    C -->|صحيح| D[إرسال OTP]
    C -->|خطأ| B
    D --> E[صفحة التحقق من OTP]
    E --> F{OTP صحيح?}
    F -->|نعم| G[تفعيل الحساب]
    F -->|لا| E
    G --> H[لوحة التحكم]
    H --> I[إكمال الملف الشخصي]
```

**Edge Cases & Error Handling:**
- OTP منتهي الصلاحية → إعادة إرسال OTP
- OTP خاطئ → رسالة خطأ واضحة
- البريد الإلكتروني موجود → رسالة "الحساب موجود بالفعل"
- اتصال الإنترنت منقطع → حفظ البيانات محلياً وإعادة المحاولة

**Notes:** العملية يجب أن تكون سريعة (أقل من 2 دقيقة). استخدام التحقق الفوري من صحة البيانات.

---

### Flow 2: تقديم طلب استثماري

**User Goal:** تقديم طلب شراء أو بيع جديد

**Entry Points:**
- زر "طلب جديد" في لوحة التحكم
- زر "تقديم طلب" في صفحة طلباتي

**Success Criteria:**
- المستخدم يملأ النموذج بنجاح
- يتم رفع المرفقات
- الطلب يتم حفظه كـ Draft
- المستخدم يرسل الطلب
- الطلب ينتقل إلى حالة Submitted
- يتم إرسال إشعار تأكيد

**Flow Diagram:**

```mermaid
graph TD
    A[لوحة التحكم] --> B[صفحة تقديم طلب جديد]
    B --> C[اختيار نوع الطلب: شراء/بيع]
    C --> D[إدخال البيانات: المبلغ، العملة، السعر المستهدف]
    D --> E[اختيار تاريخ الصلاحية]
    E --> F[رفع المرفقات]
    F --> G{التحقق من البيانات}
    G -->|صحيح| H[حفظ كـ Draft]
    G -->|خطأ| D
    H --> I[مراجعة الطلب]
    I --> J{إرسال الطلب?}
    J -->|نعم| K[تأكيد الإرسال]
    J -->|لا| H
    K --> L[حالة: Submitted]
    L --> M[إشعار تأكيد]
    M --> N[عودة إلى قائمة الطلبات]
```

**Edge Cases & Error Handling:**
- ملف أكبر من 10MB → رسالة خطأ مع الحد الأقصى
- نوع ملف غير مدعوم → رسالة مع الأنواع المدعومة
- تاريخ صلاحية في الماضي → منع الإرسال
- مبلغ غير صحيح → التحقق الفوري

**Notes:** النموذج يجب أن يكون في صفحة واحدة مع خطوات واضحة. استخدام Drag & Drop لرفع الملفات.

---

### Flow 3: متابعة حالة الطلب

**User Goal:** معرفة حالة طلب استثماري

**Entry Points:**
- قائمة الطلبات في لوحة التحكم
- إشعار عن تغيير الحالة
- رابط مباشر من البريد الإلكتروني

**Success Criteria:**
- المستخدم يرى حالة الطلب الحالية
- المستخدم يرى Timeline للأحداث
- المستخدم يمكنه رؤية المرفقات
- المستخدم يمكنه الرد على طلب معلومات إضافية

**Flow Diagram:**

```mermaid
graph TD
    A[قائمة الطلبات] --> B[تفاصيل الطلب]
    B --> C[عرض الحالة الحالية]
    C --> D[مؤشر الحالة البصري]
    D --> E[Timeline الأحداث]
    E --> F{حالة الطلب}
    F -->|Pending Info| G[نموذج الرد]
    F -->|Approved| H[معلومات الموافقة]
    F -->|Rejected| I[سبب الرفض]
    F -->|Settling| J[معلومات المعالجة]
    G --> K[إرسال الرد]
    K --> L[تحديث Timeline]
```

**Edge Cases & Error Handling:**
- طلب محذوف → رسالة "الطلب غير موجود"
- عدم وجود صلاحيات → إعادة توجيه
- خطأ في تحميل البيانات → إعادة المحاولة

**Notes:** استخدام ألوان واضحة للحالات. Timeline يجب أن يكون تفاعلياً.

---

### Flow 4: معالجة طلب (للأدمن)

**User Goal:** مراجعة واتخاذ قرار على طلب

**Entry Points:**
- صندوق وارد الطلبات
- إشعار عن طلب جديد

**Success Criteria:**
- الأدمن يرى تفاصيل الطلب
- الأدمن يرى المرفقات
- الأدمن يرى Timeline
- الأدمن يتخذ قرار (قبول/رفض/طلب معلومات)
- يتم تحديث الحالة وإرسال إشعار

**Flow Diagram:**

```mermaid
graph TD
    A[صندوق وارد الطلبات] --> B[فلترة وفرز]
    B --> C[قائمة الطلبات]
    C --> D[فتح تفاصيل الطلب]
    D --> E[مراجعة البيانات]
    E --> F[مراجعة المرفقات]
    F --> G[مراجعة Timeline]
    G --> H{اتخاذ قرار}
    H -->|قبول| I[نموذج القبول]
    H -->|رفض| J[نموذج الرفض + السبب]
    H -->|طلب معلومات| K[نموذج طلب المعلومات]
    I --> L[تأكيد القرار]
    J --> L
    K --> L
    L --> M[تحديث الحالة]
    M --> N[إرسال إشعار للمستثمر]
    N --> O[تسجيل في Audit Log]
```

**Edge Cases & Error Handling:**
- طلب تم معالجته بالفعل → رسالة تحذير
- مرفقات مفقودة → طلب معلومات
- بيانات غير مكتملة → طلب معلومات

**Notes:** لوحة القرار يجب أن تكون شاملة وسريعة. استخدام Shortcuts للقرارات الشائعة.

---

### Flow 5: نشر خبر جديد (للأدمن)

**User Goal:** إنشاء ونشر خبر أو إعلان

**Entry Points:**
- قائمة الأخبار → "إنشاء جديد"
- لوحة التحكم → "إدارة المحتوى"

**Success Criteria:**
- إنشاء خبر جديد
- إضافة المحتوى والصور
- معاينة قبل النشر
- نشر أو جدولة النشر
- ظهور الخبر في واجهة المستثمرين

**Flow Diagram:**

```mermaid
graph TD
    A[قائمة الأخبار] --> B[إنشاء خبر جديد]
    B --> C[إدخال العنوان والمحتوى]
    C --> D[اختيار التصنيف]
    D --> E[رفع صورة الغلاف]
    E --> F[معاينة المحتوى]
    F --> G{حفظ أو نشر?}
    G -->|حفظ| H[حفظ كـ Draft]
    G -->|جدولة| I[اختيار تاريخ النشر]
    G -->|نشر| J[نشر فوري]
    I --> K[حفظ مجدول]
    H --> L[قائمة الأخبار]
    J --> M[نشر + إشعار]
    K --> M
    M --> N[ظهور في واجهة المستثمرين]
```

**Edge Cases & Error Handling:**
- محتوى فارغ → منع الحفظ
- صورة كبيرة → ضغط تلقائي
- تاريخ نشر في الماضي → رسالة خطأ

**Notes:** استخدام Markdown Editor للمحتوى. معاينة مباشرة أثناء الكتابة.

---

## Wireframes & Mockups

### Design Files Location

**Primary Design Tool:** Figma (موصى به) أو Sketch

**Design System:** سيتم إنشاء Design System مخصص بناءً على Brand Guidelines

### Key Screen Layouts

#### 1. الصفحة الرئيسية (Landing Page)

**Purpose:** صفحة ترحيبية للمستخدمين غير المسجلين

**Key Elements:**
- Header مع Logo وزر "تسجيل مستثمر"
- Hero Section مع عنوان رئيسي ووصف مختصر
- قسم الأخبار/الإعلانات الأخيرة (عنوان فقط)
- Footer مع روابط مهمة

**Interaction Notes:**
- زر "تسجيل مستثمر" بارز وواضح
- الأخبار قابلة للنقر للانتقال إلى صفحة التسجيل
- تصميم بسيط ونظيف

**Layout:**
```
┌─────────────────────────────────┐
│ Header: Logo | تسجيل مستثمر    │
├─────────────────────────────────┤
│                                   │
│     Hero Section                 │
│     (عنوان + وصف)                │
│                                   │
│     [زر تسجيل مستثمر]           │
│                                   │
├─────────────────────────────────┤
│     آخر الأخبار (عنوان فقط)     │
│     - خبر 1                      │
│     - خبر 2                      │
├─────────────────────────────────┤
│ Footer                           │
└─────────────────────────────────┘
```

---

#### 2. لوحة تحكم المستثمر (Investor Dashboard)

**Purpose:** نظرة عامة على حالة الاستثمارات والطلبات

**Key Elements:**
- Header مع Navigation وProfile Menu
- Cards للإحصائيات (إجمالي الطلبات، قيد المعالجة، مكتملة)
- قائمة الطلبات الأخيرة
- قسم الإشعارات غير المقروءة
- Sidebar للتنقل السريع

**Interaction Notes:**
- Cards قابلة للنقر للانتقال إلى التفاصيل
- Real-time updates للإشعارات
- Quick Actions للطلبات المعلقة

**Layout:**
```
┌─────────────────────────────────────────┐
│ Header: Logo | Nav | Profile            │
├──────────┬───────────────────────────────┤
│          │  Cards: Stats (3 columns)    │
│ Sidebar  ├───────────────────────────────┤
│          │  الطلبات الأخيرة             │
│ - نظرة   │  [Request 1] [Request 2]     │
│   عامة  │                               │
│ - طلباتي │  الإشعارات                   │
│ - ملفي   │  [Notification 1]            │
│ - إشعارات│  [Notification 2]             │
│          │                               │
└──────────┴───────────────────────────────┘
```

---

#### 3. صفحة تقديم طلب جديد

**Purpose:** نموذج لتقديم طلب استثماري جديد

**Key Elements:**
- Breadcrumb Navigation
- Form Sections:
  - نوع الطلب (Radio: شراء/بيع)
  - البيانات الأساسية (المبلغ، العملة، السعر المستهدف)
  - تاريخ الصلاحية (Date Picker)
  - رفع الملفات (Drag & Drop Zone)
  - ملاحظات (Textarea)
- Preview Section
- Action Buttons (حفظ كـ Draft، إرسال)

**Interaction Notes:**
- التحقق الفوري من البيانات
- Progress Indicator للرفع
- Preview للملفات المرفوعة
- Confirmation Modal قبل الإرسال

**Layout:**
```
┌─────────────────────────────────────────┐
│ ← طلباتي > طلب جديد                    │
├─────────────────────────────────────────┤
│                                         │
│  نوع الطلب: ○ شراء  ○ بيع             │
│                                         │
│  البيانات:                             │
│  [المبلغ] [العملة]                     │
│  [السعر المستهدف]                      │
│  [تاريخ الصلاحية]                      │
│                                         │
│  المرفقات:                             │
│  ┌─────────────────────┐               │
│  │  Drag & Drop Zone   │               │
│  │  أو انقر للاختيار   │               │
│  └─────────────────────┘               │
│                                         │
│  [File 1] [File 2]                      │
│                                         │
│  ملاحظات:                              │
│  [Textarea]                             │
│                                         │
│  [حفظ كـ Draft]  [إرسال الطلب]        │
└─────────────────────────────────────────┘
```

---

#### 4. صندوق وارد الطلبات (للأدمن)

**Purpose:** عرض وإدارة جميع الطلبات الواردة

**Key Elements:**
- Filters Bar (الحالة، النوع، التاريخ، البحث)
- Sort Options
- Table/List View للطلبات
- Pagination
- Bulk Actions (اختياري)

**Interaction Notes:**
- Filters تطبق فوراً
- Click على طلب لفتح لوحة القرار
- Badge للأولويات/الحالات
- Real-time updates للطلبات الجديدة

**Layout:**
```
┌─────────────────────────────────────────┐
│ Header: Logo | Nav | Profile            │
├─────────────────────────────────────────┤
│ Filters: [الحالة ▼] [النوع ▼] [بحث]   │
│ Sort: [التاريخ ▼] [المبلغ ▼]          │
├─────────────────────────────────────────┤
│ ┌─────┬──────────┬──────┬──────────┐   │
│ │رقم  │المستثمر │المبلغ│الحالة   │   │
│ ├─────┼──────────┼──────┼──────────┤   │
│ │INV- │أحمد     │10,000│Submitted │   │
│ │2024 │محمد     │5,000 │Screening │   │
│ └─────┴──────────┴──────┴──────────┘   │
│                                         │
│ [< Previous] [1] [2] [3] [Next >]     │
└─────────────────────────────────────────┘
```

---

#### 5. لوحة قرار الطلب (للأدمن)

**Purpose:** مراجعة شاملة للطلب واتخاذ قرار

**Key Elements:**
- Split View:
  - Left: بيانات الطلب + Timeline
  - Right: المرفقات + Quick Actions
- Action Buttons (قبول، رفض، طلب معلومات)
- Comments Section
- History Timeline

**Interaction Notes:**
- Scroll مستقل لكل قسم
- Preview للمرفقات
- Quick Actions في Fixed Position
- Auto-save للتعليقات

**Layout:**
```
┌─────────────────────────────────────────┐
│ ← صندوق وارد > طلب #INV-2024-0001     │
├──────────────┬──────────────────────────┤
│ بيانات الطلب│  المرفقات                │
│              │  ┌────────────┐          │
│ النوع: شراء │  │  File 1    │          │
│ المبلغ: 10K │  │  [Preview] │          │
│ العملة: SAR │  └────────────┘          │
│              │  ┌────────────┐          │
│ Timeline:    │  │  File 2    │          │
│ • Submitted  │  │  [Preview] │          │
│ • Screening  │  └────────────┘          │
│              │                          │
│ التعليقات:  │  Quick Actions:          │
│ [Textarea]   │  [قبول] [رفض]           │
│              │  [طلب معلومات]          │
└──────────────┴──────────────────────────┘
```

---

## Component Library / Design System

### Design System Approach

سيتم استخدام **Design System مخصص** مبني على Tailwind CSS مع مكونات shadcn/ui كأساس.

### Foundational Components

#### 1. Buttons

**States:**
- Default
- Hover
- Active
- Disabled
- Loading

**Variants:**
- Primary (أزرق)
- Secondary (رمادي)
- Success (أخضر)
- Danger (أحمر)
- Ghost (شفاف)

**Sizes:**
- Small
- Medium
- Large

#### 2. Forms

**Input Types:**
- Text Input
- Number Input
- Date Picker
- Select/Dropdown
- Textarea
- File Upload (Drag & Drop)

**States:**
- Default
- Focus
- Error
- Success
- Disabled

#### 3. Cards

**Types:**
- Stat Card (للإحصائيات)
- Content Card (للمحتوى)
- Request Card (للطلبات)

#### 4. Status Badges

**Colors:**
- Draft: رمادي
- Submitted: أزرق
- Screening: برتقالي
- Pending Info: أصفر
- Approved: أخضر
- Rejected: أحمر
- Settling: بنفسجي
- Completed: أخضر داكن

#### 5. Navigation

**Components:**
- Header Navigation
- Sidebar Navigation
- Breadcrumbs
- Tabs
- Pagination

#### 6. Feedback

**Components:**
- Alerts (Success, Error, Warning, Info)
- Toast Notifications
- Loading Spinners
- Progress Bars
- Empty States

#### 7. Data Display

**Components:**
- Tables
- Lists
- Timeline
- Charts/Graphs

---

## Visual Design Guidelines

### Color Palette

**Primary Colors:**
- Primary Blue: `#2563EB` (للأزرار الرئيسية والروابط)
- Primary Dark: `#1E40AF` (للـ Hover States)

**Secondary Colors:**
- Success Green: `#10B981`
- Warning Yellow: `#F59E0B`
- Error Red: `#EF4444`
- Info Blue: `#3B82F6`

**Neutral Colors:**
- Background: `#FFFFFF` / `#F9FAFB`
- Text Primary: `#111827`
- Text Secondary: `#6B7280`
- Border: `#E5E7EB`

**Status Colors:**
- Draft: `#9CA3AF`
- Submitted: `#3B82F6`
- Screening: `#F59E0B`
- Approved: `#10B981`
- Rejected: `#EF4444`

### Typography

**Font Family:**
- Arabic: "Cairo" أو "Tajawal"
- English: "Inter" أو "Roboto"

**Font Sizes:**
- H1: 32px / 2rem
- H2: 24px / 1.5rem
- H3: 20px / 1.25rem
- Body: 16px / 1rem
- Small: 14px / 0.875rem
- Caption: 12px / 0.75rem

**Font Weights:**
- Regular: 400
- Medium: 500
- Semi-bold: 600
- Bold: 700

### Spacing System

**Base Unit:** 4px

**Scale:**
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

### Border Radius

- Small: 4px
- Medium: 8px
- Large: 12px
- Full: 9999px

### Shadows

- Small: `0 1px 2px rgba(0,0,0,0.05)`
- Medium: `0 4px 6px rgba(0,0,0,0.1)`
- Large: `0 10px 15px rgba(0,0,0,0.1)`

---

## Responsive Design

### Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile-First Approach

- تصميم يبدأ من Mobile ثم يتوسع
- Navigation يتحول إلى Hamburger Menu على Mobile
- Tables تتحول إلى Cards على Mobile
- Forms تتحول إلى Full Width على Mobile

### Touch Targets

- Minimum Size: 44x44px
- Spacing بين العناصر: 8px minimum

---

## Accessibility (WCAG AA)

### Requirements

1. **Color Contrast:**
   - Text على Background: 4.5:1 minimum
   - Large Text: 3:1 minimum

2. **Keyboard Navigation:**
   - جميع العناصر قابلة للوصول عبر Keyboard
   - Focus Indicators واضحة

3. **Screen Readers:**
   - ARIA Labels لجميع العناصر التفاعلية
   - Semantic HTML
   - Alt Text للصور

4. **Text Alternatives:**
   - جميع الصور لها Alt Text
   - Icons لها Labels

---

## Notifications Roadmap (Epic 6)

- **Backend foundation:** Notifications and preferences tables created in Supabase with realtime publication (Story 6.1).
- **Email pipeline:** Queue-backed email dispatch via Supabase Edge Function and Resend (Story 6.3).
- **Operations alerts:** Configurable admin email notifications for critical request events (Story 6.4).
- **Investor notifications center:** In-app feed with unread badges, realtime updates, and per-channel preference management (Stories 6.5–6.6).
- **Channels:** Email, SMS, and in-app notifications share the same payload contract to ensure consistent rendering across delivery mechanisms.

---

## Internationalization (i18n)

### Supported Languages

- العربية (RTL)
- English (LTR)

### RTL Support

- Flip Layout للعربية
- Mirror Icons والـ UI Elements
- Date/Number Formatting حسب اللغة

### Translation Keys Structure

```
locales/
├── ar/
│   ├── common.json
│   ├── auth.json
│   ├── requests.json
│   ├── dashboard.json
│   └── admin.json
└── en/
    ├── common.json
    ├── auth.json
    ├── requests.json
    ├── dashboard.json
    └── admin.json
```

---

## Performance Considerations

### Loading States

- Skeleton Screens للبيانات
- Progressive Loading
- Lazy Loading للصور

### Optimization

- Code Splitting
- Image Optimization
- Font Optimization
- Caching Strategy

---

## Next Steps

بعد الموافقة على هذا Front End Spec:
1. إنشاء Design System في Figma
2. إنشاء Wireframes تفصيلية
3. إنشاء Mockups عالية الدقة
4. إنشاء Component Library
5. البدء في تطوير Frontend

---

## Design File References

**Figma File:** سيتم إنشاء ملف Figma منفصل يحتوي على:
- Design System
- Component Library
- Screen Mockups
- User Flow Diagrams

**Link:** سيتم إضافة الرابط بعد إنشاء الملف

