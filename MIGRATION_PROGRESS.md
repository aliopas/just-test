# تقدم الانتقال إلى Next.js 🚀

## ✅ ما تم إنجازه

### 1. إنشاء صفحة InvestorRequestDetailPage في Next.js
- ✅ تم إنشاء `app/(investor)/requests/[id]/page.tsx`
- ✅ الصفحة تستخدم `InvestorRequestDetailPage` من `src/spa-pages/`
- ✅ الصفحة محاطة بـ `ClientOnly` للتوافق مع SSR
- ✅ تم تعيين `dynamic = 'force-dynamic'` للصفحة

### 2. تحديث مكونات التنقل لاستخدام Next.js
- ✅ تم تحديث `InvestorSidebarNav` في `src/components/navigation/` - يستخدم `Link` و `usePathname`
- ✅ تم تحديث `AdminSidebarNav` في `src/components/navigation/` - يستخدم `Link` و `usePathname`
- ✅ تم تحديث `HeaderNav` في `src/components/navigation/` - يستخدم `Link` و `usePathname`
- ✅ تم تحديث `src/App.tsx` - استبدال جميع `NavLink` بـ `Link` من Next.js
- ✅ تم استبدال `useLocation` بـ `usePathname` في جميع المكونات
- ✅ تم تحديث `InvestorNewsDetailPage` لاستخدام `useNextNavigate` بدلاً من `useNavigate`

### 3. التحقق من البنية الحالية
- ✅ جميع الصفحات في `app/` تستخدم `@/pages/` الذي يشير إلى `src/spa-pages/`
- ✅ `MyRequestsPage` يستخدم بالفعل `useNextNavigate` من Next.js
- ✅ الروابط في `MyRequestsPage` تشير إلى `/requests/${id}` بشكل صحيح

---

## 📋 ما يجب إنجازه

### المرحلة 1: إكمال الصفحات المفقودة
- [ ] التحقق من أن جميع الصفحات في `src/spa-pages/` لها صفحات Next.js في `app/`
- [ ] إنشاء صفحات Next.js للصفحات المفقودة إن وجدت

### المرحلة 2: تحديث الروابط
- [x] استبدال جميع `NavLink` من React Router بـ `Link` من Next.js ✅
- [x] تحديث `src/components/navigation/` لاستخدام Next.js routing ✅
- [x] إزالة `useLocation` من React Router واستبداله بـ `usePathname` من Next.js ✅

### المرحلة 3: إزالة React Router
- [ ] إزالة `BrowserRouter` من `src/main.tsx`
- [ ] إزالة `Routes` و `Route` من `src/App.tsx`
- [ ] حذف `react-router-dom` من dependencies
- [ ] حذف `src/App.tsx` إذا لم يعد ضرورياً

### المرحلة 4: تنظيف الكود
- [ ] حذف `vite.config.ts` إذا لم يعد مستخدماً
- [ ] تحديث `package.json` scripts
- [ ] تحديث الوثائق

---

## 🔍 الصفحات الحالية

### صفحات Investor (المستثمر)
- ✅ `/home` → `app/(investor)/home/page.tsx`
- ✅ `/requests` → `app/(investor)/requests/page.tsx`
- ✅ `/requests/new` → `app/(investor)/requests/new/page.tsx`
- ✅ `/requests/[id]` → `app/(investor)/requests/[id]/page.tsx` (جديد!)
- ✅ `/profile` → `app/(investor)/profile/page.tsx`
- ✅ `/internal-news` → `app/(investor)/internal-news/page.tsx`
- ✅ `/news` → `app/(investor)/news/page.tsx`
- ✅ `/news/[id]` → `app/(investor)/news/[id]/page.tsx`
- ✅ `/projects/[id]` → `app/(investor)/projects/[id]/page.tsx`
- ✅ `/dashboard` → `app/(investor)/dashboard/page.tsx`

### صفحات Admin (المسؤول)
- ✅ `/admin/dashboard` → `app/(admin)/admin/dashboard/page.tsx`
- ✅ `/admin/requests` → `app/(admin)/admin/requests/page.tsx`
- ✅ `/admin/requests/[id]` → `app/(admin)/admin/requests/[id]/page.tsx`
- ✅ `/admin/news` → `app/(admin)/admin/news/page.tsx`
- ✅ `/admin/projects` → `app/(admin)/admin/projects/page.tsx`
- ✅ `/admin/company-content` → `app/(admin)/admin/company-content/page.tsx`
- ✅ `/admin/signup-requests` → `app/(admin)/admin/signup-requests/page.tsx`
- ✅ `/admin/investors` → `app/(admin)/admin/investors/page.tsx`
- ✅ `/admin/reports` → `app/(admin)/admin/reports/page.tsx`
- ✅ `/admin/audit` → `app/(admin)/admin/audit/page.tsx`

### صفحات عامة
- ✅ `/login` → `app/login/page.tsx`
- ✅ `/register` → `app/register/page.tsx`
- ✅ `/verify` → `app/verify/page.tsx`
- ✅ `/reset-password` → `app/reset-password/page.tsx`

---

## 🎯 الخطوات التالية

1. **التحقق من الروابط**: التأكد من أن جميع الروابط في المكونات تستخدم Next.js
2. **تحديث Navigation Components**: استبدال React Router بـ Next.js في جميع مكونات التنقل
3. **إزالة React Router**: حذف جميع الاستيرادات والاستخدامات لـ React Router
4. **اختبار شامل**: التأكد من أن جميع الصفحات تعمل بشكل صحيح

---

## 📝 ملاحظات

- جميع الصفحات حالياً تستخدم `ClientOnly` wrapper للتوافق مع SSR
- `useNextNavigate` موجود في `src/utils/next-router.ts` ويعمل كجسر بين React Router و Next.js
- يجب استبدال `useNextNavigate` بـ `useRouter` من Next.js مباشرة في المستقبل

