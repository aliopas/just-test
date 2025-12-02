# مشكلة react-router-dom في باقي الصفحات

## المشكلة

بعد إصلاح `PublicLandingPage`، لا تزال باقي الصفحات تستخدم `react-router-dom`:

### الصفحات المتأثرة:

1. **صفحات Auth:**
   - `LoginPage.tsx` - يستخدم `Link`, `useNavigate`, `useSearchParams`
   - `RegisterPage.tsx` - يستخدم `useNavigate`, `Link`
   - `VerifyOtpPage.tsx` - يستخدم `Link`, `useLocation`, `useNavigate`
   - `ResetPasswordPage.tsx` - يستخدم `useNavigate`, `useSearchParams`

2. **صفحات Investor:**
   - `HomePage.tsx` - يستخدم `Link`
   - `InvestorNewsDetailPage.tsx` - يستخدم `Link`, `useParams`
   - `InvestorProjectDetailPage.tsx` - يستخدم `Link`, `useParams`
   - `InvestorDashboardPage.tsx` - يستخدم `Link`

3. **صفحات Admin:**
   - `AdminDashboardPage.tsx` - يستخدم `Link`
   - `AdminRequestsTable.tsx` - يستخدم `Link`

4. **مكونات أخرى:**
   - `App.tsx` - يستخدم `BrowserRouter`, `Routes`, `Route`, `NavLink`, `Navigate`
   - `DynamicRequestForm.tsx` - يستخدم `useLocation`
   - `NonFinancialRequestsPage.tsx` - يستخدم `useNavigate`

## الحل الموجود

يوجد ملف `frontend/src/utils/next-router.ts` يحتوي على helper functions:
- `useNextNavigate()` - بديل لـ `useNavigate`
- `useNextLocation()` - بديل لـ `useLocation`
- `useParams` - من `next/navigation`

## الحل المطلوب

يجب استبدال جميع استخدامات `react-router-dom` بـ Next.js navigation:

### 1. استبدال الاستيرادات:

**من:**
```typescript
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
```

**إلى:**
```typescript
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useNextNavigate, useNextLocation } from '@/utils/next-router';
```

### 2. استبدال الاستخدامات:

- `useNavigate()` → `useNextNavigate()` أو `useRouter()`
- `useLocation()` → `useNextLocation()` أو `usePathname()` + `useSearchParams()`
- `useSearchParams()` → `useSearchParams()` من `next/navigation`
- `useParams()` → `useParams()` من `next/navigation`
- `<Link to="...">` → `<Link href="...">`

### 3. إزالة App.tsx

`App.tsx` يستخدم `BrowserRouter`, `Routes`, `Route` - وهذا لا يعمل مع Next.js App Router لأن Next.js يدير routing تلقائياً. يجب إزالة هذا الملف أو تحويله إلى مكونات Next.js.

## الحالة الحالية

- ✅ `PublicLandingPage.tsx` - تم إصلاحه
- ❌ باقي الصفحات - تحتاج إصلاح

## الخطوات التالية

1. إصلاح صفحات Auth (Login, Register, Verify, Reset Password)
2. إصلاح صفحات Investor
3. إصلاح صفحات Admin
4. إزالة أو تحويل `App.tsx`

---

**ملاحظة**: هذا عمل كبير يتطلب تحديث جميع الصفحات. يمكن القيام به تدريجياً.

