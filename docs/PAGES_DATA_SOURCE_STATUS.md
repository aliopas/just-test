# حالة مصادر البيانات في جميع الصفحات

هذا المستند يوضح أي الصفحات تستخدم Supabase مباشرة وأيها لا يزال يستخدم API backend.

## ✅ الصفحات التي تستخدم Supabase مباشرة (Direct Supabase)

### صفحات الإدارة (Admin)

1. **Admin Requests** (`/admin/requests`)
   - ✅ **Hook**: `useAdminRequestsDirect`
   - ✅ **المصدر**: Supabase مباشرة
   - **الجدول**: `requests`, `users`, `investor_profiles`, `admin_request_views`

2. **Admin Dashboard** (`/admin/dashboard`)
   - ✅ **Hook**: `useAdminDashboardStatsDirect`
   - ✅ **المصدر**: Supabase مباشرة
   - **الجدول**: `requests`, `request_events`, `notification_jobs`

### صفحات المستثمر (Investor)

3. **Investor Requests** (`/requests`)
   - ✅ **Hook**: `useInvestorRequestsDirect`
   - ✅ **المصدر**: Supabase مباشرة
   - **View**: `v_request_workflow`

4. **Investor Dashboard** (`/dashboard`)
   - ✅ **Hook**: `useInvestorDashboardDirect`
   - ✅ **المصدر**: Supabase مباشرة
   - **الجداول**: `requests`, `notifications`

### صفحات عامة (Public)

5. **Public Landing Page** (`/`)
   - ✅ **Hook**: `useCompanyProfiles`, `usePartnershipInfo` (من `useSupabaseTables`)
   - ✅ **المصدر**: Supabase مباشرة
   - **الجداول**: `company_profiles`, `partnership_info`

6. **Investor News List** (`/news`)
   - ✅ **Hook**: `useInvestorNewsList` (من `useSupabaseNews`)
   - ✅ **المصدر**: Supabase مباشرة
   - **الجدول**: `news`

7. **Investor News Detail** (`/news/[id]`)
   - ✅ **Hook**: `useInvestorNewsDetail` (من `useSupabaseNews`)
   - ✅ **المصدر**: Supabase مباشرة
   - **الجدول**: `news`

8. **Investor Internal News** (`/internal-news`)
   - ✅ **Hook**: `useInvestorInternalNewsList` (من `useSupabaseNews`)
   - ✅ **المصدر**: Supabase مباشرة
   - **الجدول**: `news`

9. **Investor Project Detail** (`/projects/[id]`)
   - ✅ **Hook**: `usePublicProjectDetail` (من `useSupabaseProjects`)
   - ✅ **المصدر**: Supabase مباشرة
   - **الجدول**: `projects`

### صفحات المصادقة (Auth)

10. **Login** (`/login`)
    - ✅ **Hook**: `useSupabaseLogin`
    - ✅ **المصدر**: Supabase Auth مباشرة
    - **لا يحتاج API backend**

## ⚠️ الصفحات التي لا تزال تستخدم API Backend

### صفحات الإدارة (Admin)

1. **Admin Request Detail** (`/admin/requests/[id]`)
   - ⚠️ **Hook**: `useAdminRequestDetail`
   - ⚠️ **المصدر**: API backend (`/api/v1/admin/requests/:id`)
   - **يحتاج تحديث**: إنشاء `useAdminRequestDetailDirect`

2. **Admin News** (`/admin/news`)
   - ⚠️ **Hook**: `useAdminNewsList`, `useAdminNewsDetail`
   - ⚠️ **المصدر**: API backend (`/api/v1/admin/news`)
   - **يحتاج تحديث**: يمكن استخدام `useSupabaseData` مباشرة

3. **Admin Projects** (`/admin/projects`)
   - ⚠️ **Hook**: `useAdminProjectsList`, `useAdminProjectDetail`
   - ⚠️ **المصدر**: API backend (`/api/v1/admin/projects`)
   - **يحتاج تحديث**: يمكن استخدام `useSupabaseData` مباشرة

4. **Admin Signup Requests** (`/admin/signup-requests`)
   - ⚠️ **Hook**: `useAdminAccountRequests`
   - ⚠️ **المصدر**: API backend (`/api/v1/admin/account-requests`)
   - **يحتاج تحديث**: إنشاء `useAdminAccountRequestsDirect`

5. **Admin Company Content** (`/admin/company-content`)
   - ⚠️ **Hook**: `useAdminCompanyProfiles`, `useAdminCompanyPartners`, إلخ
   - ⚠️ **المصدر**: API backend (`/api/v1/admin/company-*`)
   - **ملاحظة**: يمكن استخدام `useSupabaseTables` (موجود بالفعل)

6. **Admin Audit Log** (`/admin/audit`)
   - ⚠️ **Hook**: `useAdminAuditLogs`
   - ⚠️ **المصدر**: API backend (`/api/v1/admin/audit-logs`)
   - **يحتاج تحديث**: إنشاء `useAdminAuditLogsDirect`

7. **Admin Reports** (`/admin/reports`)
   - ⚠️ **Hook**: `useAdminRequestReport`
   - ⚠️ **المصدر**: API backend (`/api/v1/admin/reports/requests`)
   - **يحتاج تحديث**: يمكن استخدام Supabase مباشرة مع معالجة CSV

### صفحات المستثمر (Investor)

8. **Investor Request Detail** (`/requests/[id]`)
   - ⚠️ **Hook**: `useInvestorRequestDetail`, `useRequestTimeline`
   - ⚠️ **المصدر**: API backend (`/api/v1/investor/requests/:id`)
   - **يحتاج تحديث**: إنشاء `useInvestorRequestDetailDirect`

9. **Home Page** (`/home`)
   - ⚠️ **Hook**: `useInvestorDashboard` (القديم)
   - ⚠️ **المصدر**: API backend (`/api/v1/investor/dashboard`)
   - **يحتاج تحديث**: استبدال بـ `useInvestorDashboardDirect`

10. **Profile Page** (`/profile`)
    - ⚠️ **Hook**: `useInvestorProfile`
    - ⚠️ **المصدر**: API backend (`/api/v1/investor/profile`)
    - **يحتاج تحديث**: يمكن استخدام `useSupabaseSingle` مع `investor_profiles`

11. **New Request Page** (`/requests/new`)
    - ⚠️ **Hook**: `useCreateRequest`
    - ⚠️ **المصدر**: API backend (`/api/v1/investor/requests`)
    - **ملاحظة**: إنشاء الطلبات قد يحتاج API backend للمعالجة المعقدة

### صفحات المصادقة (Auth)

12. **Register** (`/register`)
    - ⚠️ **Hook**: `useRegister`
    - ⚠️ **المصدر**: API backend (`/api/v1/auth/register`)
    - **ملاحظة**: التسجيل قد يحتاج API backend للمعالجة المعقدة

13. **Verify OTP** (`/verify`)
    - ⚠️ **Hook**: `useVerifyOtp`
    - ⚠️ **المصدر**: API backend (`/api/v1/auth/verify-otp`)
    - **ملاحظة**: التحقق قد يحتاج API backend

14. **Reset Password** (`/reset-password`)
    - ⚠️ **Hook**: `useResetPassword`, `useResetPasswordRequest`
    - ⚠️ **المصدر**: API backend (`/api/v1/auth/reset-password`)
    - **ملاحظة**: إعادة تعيين كلمة المرور قد يحتاج API backend

## 📊 ملخص

### ✅ تم التحديث (13 صفحة)
- Admin Requests
- Admin Dashboard
- Admin Signup Requests
- Investor Requests
- Investor Dashboard
- Investor Profile
- Home Page
- Public Landing Page
- Investor News (List & Detail)
- Investor Internal News
- Investor Project Detail
- Login

### ⚠️ يحتاج تحديث (11 صفحة)
- Admin Request Detail
- Admin News
- Admin Projects
- Admin Company Content (يمكن استخدام hooks موجودة)
- Admin Audit Log
- Admin Reports
- Investor Request Detail
- New Request Page
- Register
- Verify OTP
- Reset Password

## 🎯 الأولويات للتحديث

### عالية الأولوية (صفحات رئيسية)
1. **Home Page** - صفحة رئيسية للمستثمر
2. **Profile Page** - صفحة مهمة
3. **Admin Request Detail** - تفاصيل الطلبات
4. **Investor Request Detail** - تفاصيل الطلبات

### متوسطة الأولوية
5. **Admin Signup Requests** - مشابهة لـ Admin Requests
6. **Admin News** - يمكن استخدام `useSupabaseData`
7. **Admin Projects** - يمكن استخدام `useSupabaseData`

### منخفضة الأولوية (قد تحتاج API backend)
8. **New Request Page** - إنشاء طلبات قد يحتاج معالجة معقدة
9. **Register/Verify OTP** - قد يحتاج معالجة خاصة
10. **Admin Reports** - قد يحتاج معالجة CSV معقدة

## 📝 ملاحظات

1. **الصفحات التي تستخدم Supabase مباشرة** تعمل بشكل أفضل وأسرع
2. **الصفحات التي تستخدم API backend** قد تواجه مشاكل 502 في production
3. **صفحات المصادقة** قد تحتاج API backend للمعالجة المعقدة (OTP، إلخ)
4. **صفحات الإنشاء/التحديث** قد تحتاج API backend للمعالجة المعقدة

## 🔄 كيفية التحديث

لتحويل صفحة من API backend إلى Supabase مباشرة:

1. **ابحث عن الـ hook المستخدم** في الصفحة
2. **أنشئ hook جديد** يستخدم `useSupabaseData` أو `getSupabaseBrowserClient`
3. **استبدل الـ hook القديم** بالجديد في الصفحة
4. **اختبر الصفحة** للتأكد من عملها بشكل صحيح

### مثال:
```tsx
// قبل
import { useAdminNewsList } from '../hooks/useAdminNews';
const { data } = useAdminNewsList(filters);

// بعد
import { useSupabaseData } from '../hooks/useSupabaseData';
const { data: news } = useSupabaseData({
  table: 'news',
  filters: [{ column: 'status', value: 'published' }],
  orderBy: { column: 'created_at', ascending: false },
});
```
