## تحديثات 11 نوفمبر 2025

- إضافة صفحة `AdminInvestorsPage` ودمجها في شريط التنقل الإداري لإتاحة إنشاء مستثمرين جدد ومتابعة حساباتهم.
- إنشاء مكونات دعم لواجهة الإدارة (`AdminInvestorCreateForm`, `AdminUsersTable`, `AdminUsersFilterBar`, `AdminUsersPagination`) وربطها مع مصدر البيانات عبر `useAdminUsers`.
- تعريف هيكل بيانات جديد للمستثمرين الإداريين (`admin-users.ts`) مع رسائل ترجمة (`adminUsers.ts`) لدعم اللغتين العربية والإنجليزية.
- ضبط تهيئة النموذج والتحقق باستخدام `zod` لضمان التوافق مع متطلبات الـ backend واستدعاء Mutation الإنشاء.
- معالجة أخطاء البناء الخلفي بتوسيع Typings لخدمة `rbac.service` لاستيعاب أشكال العلاقات المختلفة واسترجاع معرفات الأدوار قبل تحميل صلاحيات fallback.
- توثيق عملية البناء الناجح (`npm run build`) بعد الإصلاحات للتأكد من جاهزية النشر على Netlify.
- تعديل hook `useInvestorProfile` بحيث يعيد `null` عند استجابة 404 ليعرض حالة الملف الفارغ للمستثمر بدلاً من إظهار خطأ.
- تحسين `AuthProvider` للتحقق من وجود توكنات Supabase قبل إعادة إحياء المستخدم، وإضافة مستمع تركيز للمتصفح لتحديث حالة المصادقة ومنع طلبات 401 المتكررة.

## تحديثات 12 نوفمبر 2025

- إنشاء صفحة `InvestorStocksPage` لتمكين المستثمرين من متابعة أداء سهم باكورة مع عرض sparkline، متوسطات متحركة، نطاقات تداول، وحجم التداول لآخر 30 يومًا بدعم كامل للـ RTL.
- إضافة hook جديد `useInvestorStockFeed` وأنواع `stocks.ts` لاستهلاك واجهة `/investor/stocks` وتخزين البيانات مؤقتًا عبر TanStack Query مع تحديثات دورية.
- تطوير خدمة `getBacuraStockFeed` ومتحكم `investor-stocks.controller` في الـ backend لتجميع مؤشرات الأداء (التذبذب، الاتجاه، أفضل/أضعف يوم) من جدول Supabase الجديد.
- ترحيل قاعدة البيانات بإنشاء جدول `bacura_stock_snapshots`، وسياسة RLS، وتهيئة بيانات تاريخية لمدة 60 يومًا، بالإضافة إلى ترخيص صلاحية `investor.market.read` وربطها بدور المستثمر.
- إدراج مسار `/investor/stocks` في `investor.routes.ts` مع متطلبات صلاحيات محدثة وضمان المصادقة.
- تحديث `App.tsx` لإضافة رابط "Bacura stock" في شريط تنقل المستثمرين، وربط الصفحة الجديدة ضمن المسارات المحمية.
- دمج صفحة `AdminSignupRequestsPage` في شريط التنقل الإداري ومسارات الـ router لتمكين مراجعة طلبات التسجيل الجديدة، مع توفير ترجمات خاصة بالصفحة (`adminSignupRequests.ts`) وhook البيانات (`useAdminAccountRequests`).
### تحسينات 12 نوفمبر 2025

- توسيع ماكينة حالات الطلب في `request-state.service` للسماح بانتقالات مباشرة من حالات `draft` و`submitted` و`pending_info` إلى مراحل الفحص والمراجعة والموافقة دون رمي أخطاء 409.
- إضافة خدمة `moveAdminRequestToStatus` ومسار REST جديد `PATCH /admin/requests/:id/status` مع واجهة مستخدم (أزرار "نقل إلى التصفية" و"نقل إلى مراجعة الالتزام") داخل صفحة تفاصيل الطلب الإداري، ما مكّن فريق المراجعة من تحريك الطلب قبل الموافقة/الرفض.
- إصلاح روابط جدول الطلبات (`AdminRequestsTable`) لاستخدام `Link` الداخلي وإضافة تعريف مسار React Router `"/admin/requests/:id"` حتى لا يُعاد التوجيه إلى `/admin/dashboard` عند فتح التفاصيل.
- تحسين تجربة المستثمر في صفحة `HomePage` بعرض صورة الخبر من Supabase (مع شعار باكورة كنسخة احتياطية)، وإظهار مقتطف وزر "عرض التفاصيل" الذي ينتقل إلى مسار جديد `/news/{id}`.
- تعريف مسارات المستثمر للأخبار (`/news` و`/news/:id`) وتحديث صفحة `InvestorNewsDetailPage` كي تعتمد `useParams` وتعرض شعار باكورة عند غياب الصورة، مع زر رجوع يعمل عبر `Link` بدلاً من رابط خارجي.

## تحديثات 15 نوفمبر 2025

- دعم عرض كل الصور والملفات المرفقة للأخبار الداخلية عبر `InvestorInternalNewsPage` بما في ذلك معرض صور مبني على روابط Supabase موقعة وقسم كامل لتنزيل الملفات بدون حد أقصى لعدد العناصر الظاهرة في البطاقة.
- إتاحة عرض وتنزيل المرفقات في صفحة تفاصيل الأخبار العامة (`InvestorNewsDetailPage`) مع تقسيم تلقائي بين الصور والملفات، وإظهار حجم الملف ونوعه وزر تنزيل يعمل باللغتين.
- توسيع مخارج واجهة `/investor/internal-news` و`/news/:id` لإرجاع المرفقات مع روابط موقعة عبر تحديثات `news.service.ts` وأنواع `PublicNewsDetail` و`InvestorNewsDetail` لضمان اتساق الواجهة الأمامية مع البيانات الجديدة.

## تحديثات 15 يناير 2025 (2025-01-15)

### نظام تتبع قراءة الطلبات من قبل الأدمن

- **تنفيذ نظام تتبع قراءة طلبات الاستثمار:**
  - إنشاء جدول `admin_request_views` في قاعدة البيانات لتتبع قراءة الطلبات من قبل كل أدمن
  - إضافة دالة `markRequestAsRead` في `admin-request.service.ts` لتسجيل قراءة الطلب
  - إضافة دالة `isRequestReadByAdmin` للتحقق من حالة القراءة
  - تحديث `listAdminRequests` لإرجاع حالة `isRead` لكل طلب في القائمة
  - تحديث `getAdminRequestDetail` لتسجيل القراءة تلقائياً عند فتح تفاصيل الطلب
  - إضافة نوع `isRead: boolean` إلى واجهة `AdminRequest` في `frontend/src/types/admin.ts`
  - إضافة hook `useNotifications` لعرض عدد الإشعارات غير المقروءة في القائمة الجانبية
  - تحديث `App.tsx` لعرض badge بعدد الطلبات غير المقروءة بجانب "طلبات الاستثمار الواردة" في القائمة الجانبية

- **تنفيذ نظام تتبع قراءة طلبات إنشاء حساب مستثمر جديد:**
  - إنشاء جدول `admin_signup_request_views` في قاعدة البيانات لتتبع قراءة طلبات إنشاء الحساب
  - إضافة دالة `markSignupRequestAsRead` في `investor-signup-request.service.ts`
  - إضافة دالة `getUnreadSignupRequestCount` لحساب عدد الطلبات غير المقروءة
  - تحديث `listRequests` لإرجاع حالة `isRead` لكل طلب
  - إضافة endpoint `GET /admin/account-requests/unread-count` لجلب عدد الطلبات غير المقروءة
  - إضافة endpoint `POST /admin/account-requests/:id/mark-read` لتسجيل قراءة الطلب
  - إضافة hook `useUnreadSignupRequestCount` في `frontend/src/hooks/useAdminAccountRequests.ts`
  - إضافة hook `useMarkSignupRequestRead` لتسجيل القراءة
  - تحديث `App.tsx` لعرض badge بعدد الطلبات غير المقروءة بجانب "طلب إنشاء حساب مستثمر جديد"
  - تحديث `AdminSignupRequestsPage` لتسجيل القراءة تلقائياً عند فتح الصفحة للطلبات المعلقة غير المقروءة
  - إضافة نوع `isRead: boolean` إلى واجهة `AdminSignupRequest` في `frontend/src/types/admin-account-request.ts`

### تحسين منطق حالة الطلبات

- **تغيير تلقائي لحالة الطلب عند فتحه:**
  - تعديل دالة `markRequestAsRead` في `backend/src/services/admin-request.service.ts`
  - عند فتح طلب غير مقروء لأول مرة من قبل أي أدمن:
    - إذا كانت الحالة `draft` (مسودة) → تتغير تلقائياً إلى `screening` (تحت المراجعة)
  - إذا لم يتم فتح الطلب → يبقى `draft` (مسودة)
  - إذا تم الموافقة → يبقى `approved` (موافق) كما كان
  - تسجيل الحدث في `request_events` مع ملاحظة "Request opened by admin - moved to screening"

### تحديثات الترجمة

- **تحديث ترجمة حالة "screening":**
  - تغيير الترجمة العربية من "تصفية أولية" إلى "تحت المراجعة" في جميع ملفات الترجمة:
    - `frontend/src/utils/requestStatus.ts` - تحديث `STATUS_META.screening.label.ar`
    - `frontend/src/locales/adminRequests.ts` - تحديث `status.screening`, `detail.moveToScreening`, `decision.screeningSuccess`
    - `frontend/src/locales/requestList.ts` - تحديث `filters.screening`
    - `frontend/src/locales/dashboard.ts` - تحديث `summary.screening`

### إصلاحات البناء

- **إصلاح خطأ build في Netlify:**
  - استبدال `onSuccess` callback في `useQuery` بـ `useEffect` في `frontend/src/hooks/useAdminAccountRequests.ts`
  - السبب: React Query v5 لا يدعم `onSuccess` في `useQuery`
  - الحل: استخدام `useEffect` مع dependencies صحيحة (`query.isSuccess`, `query.data?.unreadCount`, `queryClient`)
  - إضافة `import { useEffect } from 'react'` إلى الملف

### الملفات المعدلة

**Backend:**
- `backend/src/services/admin-request.service.ts` - إضافة منطق تغيير الحالة التلقائي
- `backend/src/services/investor-signup-request.service.ts` - إضافة تتبع القراءة
- `backend/src/controllers/investor-signup-request.controller.ts` - إضافة endpoints جديدة
- `backend/src/routes/admin.routes.ts` - إضافة مسارات جديدة

**Frontend:**
- `frontend/src/hooks/useAdminAccountRequests.ts` - إضافة hooks جديدة وإصلاح build error
- `frontend/src/types/admin.ts` - إضافة `isRead` field
- `frontend/src/types/admin-account-request.ts` - إضافة `isRead` field
- `frontend/src/App.tsx` - إضافة badges للطلبات غير المقروءة
- `frontend/src/pages/AdminSignupRequestsPage.tsx` - إضافة تسجيل القراءة التلقائي
- `frontend/src/utils/requestStatus.ts` - تحديث الترجمة
- `frontend/src/locales/adminRequests.ts` - تحديث الترجمات
- `frontend/src/locales/requestList.ts` - تحديث الترجمة
- `frontend/src/locales/dashboard.ts` - تحديث الترجمة

**Database:**
- `supabase/migrations/20250115130700_admin_request_views.sql` - إنشاء جدول تتبع قراءة الطلبات
- `supabase/migrations/20250115130800_admin_signup_request_views.sql` - إنشاء جدول تتبع قراءة طلبات إنشاء الحساب

**Documentation:**
- `docs/stories/ADMIN_REQUEST_READ_TRACKING.md` - توثيق نظام تتبع القراءة
- `docs/architecture/database-schema.md` - تحديث schema
- `docs/architecture/api-design.md` - تحديث API endpoints

