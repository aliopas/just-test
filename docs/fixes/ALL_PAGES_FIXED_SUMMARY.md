# ملخص إصلاح جميع الصفحات

## الصفحات التي تم إصلاحها

### صفحات Auth:
1. ✅ **LoginPage.tsx**
   - استبدال `Link` من `react-router-dom` بـ `next/link`
   - استبدال `useNavigate` بـ `useNextNavigate`
   - استبدال `useSearchParams` بـ `useSearchParams` من `next/navigation`
   - استبدال `to=` بـ `href=`

2. ✅ **RegisterPage.tsx**
   - استبدال `Link` من `react-router-dom` بـ `next/link`
   - استبدال `useNavigate` بـ `useNextNavigate`
   - استبدال `to=` بـ `href=`

3. ✅ **VerifyOtpPage.tsx**
   - استبدال `Link` من `react-router-dom` بـ `next/link`
   - استبدال `useNavigate` بـ `useNextNavigate`
   - استبدال `useLocation` بـ `useNextLocation` و `useSearchParams` من Next.js
   - استبدال `to=` بـ `href=`

4. ✅ **ResetPasswordPage.tsx**
   - استبدال `useNavigate` بـ `useNextNavigate`
   - استبدال `useSearchParams` بـ `useSearchParams` من `next/navigation`

### صفحات Investor:
5. ✅ **HomePage.tsx**
   - استبدال `Link` من `react-router-dom` بـ `next/link`
   - استبدال جميع `to=` بـ `href=`

6. ⏳ **InvestorNewsDetailPage.tsx** - يحتاج إصلاح
7. ⏳ **InvestorProjectDetailPage.tsx** - يحتاج إصلاح
8. ⏳ **InvestorDashboardPage.tsx** - يحتاج إصلاح

### صفحات Admin:
9. ⏳ **AdminDashboardPage.tsx** - يحتاج إصلاح

## الصفحات المتبقية

- InvestorNewsDetailPage.tsx
- InvestorProjectDetailPage.tsx
- InvestorDashboardPage.tsx
- AdminDashboardPage.tsx
- NonFinancialRequestsPage.tsx
- AdminRequestsTable.tsx
- DynamicRequestForm.tsx

## الحالة الحالية

- ✅ تم إصلاح صفحات Auth الأربع
- ✅ تم إصلاح HomePage
- ⏳ باقي الصفحات تحتاج إصلاح

