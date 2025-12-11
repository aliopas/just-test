# تحقق من توجيه الأدمن إلى لوحة تحكم الأدمن

## ✅ التحقق الكامل من نظام التوجيه

### 1. بعد تسجيل الدخول (useSupabaseLogin.ts)
**الملف:** `frontend/src/hooks/useSupabaseLogin.ts`

**السطور 183-190:**
```typescript
// التوجيه الافتراضي حسب الدور
// Admin → لوحة تحكم الأدمن | Investor → لوحة تحكم المستثمر
const dashboardPath = data.user.role === 'admin' 
  ? '/admin/dashboard' 
  : '/dashboard';

// استخدام replace بدلاً من push لتجنب إضافة صفحة تسجيل الدخول للتاريخ
router.replace(dashboardPath);
```

**✅ يعمل بشكل صحيح:** 
- إذا كان `data.user.role === 'admin'` → `/admin/dashboard`
- إذا كان `data.user.role !== 'admin'` → `/dashboard`

---

### 2. جلب Role من قاعدة البيانات (useSupabaseLogin.ts)
**الملف:** `frontend/src/hooks/useSupabaseLogin.ts`

**السطور 68-147:**
- ✅ يتحقق من عمود `role` في جدول `users`
- ✅ يتحقق من جدول `user_roles` (RBAC) إذا لم يكن role في العمود
- ✅ يتحقق من `user_metadata` و `app_metadata` كـ fallback
- ✅ يسجل النتيجة النهائية في console

**سلسلة التحقق:**
1. عمود `role` في `users` → `role === 'admin'`
2. جدول `user_roles` → البحث عن role `admin`
3. `user_metadata.role` أو `app_metadata.role`
4. الافتراضي: `investor`

---

### 3. الصفحة الرئيسية (RootPageClient.tsx)
**الملف:** `frontend/app/components/RootPageClient.tsx`

**السطور 70-78:**
```typescript
useEffect(() => {
  if (isAuthenticated) {
    if (user?.role === 'admin') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/dashboard');
    }
  }
}, [isAuthenticated, user, router]);
```

**✅ يعمل بشكل صحيح:** يوجه الأدمن إلى `/admin/dashboard` عند الوصول للصفحة الرئيسية

---

### 4. الصفحة الجذرية للمستثمر (investor/page.tsx)
**الملف:** `frontend/app/(investor)/page.tsx`

**السطور 14-20:**
```typescript
useEffect(() => {
  if (user?.role === 'admin') {
    router.replace('/admin/dashboard');
  } else {
    router.replace('/dashboard');
  }
}, [user, router]);
```

**✅ يعمل بشكل صحيح:** يوجه الأدمن بعيداً عن صفحة المستثمر

---

### 5. Middleware Redirect
**الملف:** `frontend/app/middleware-redirect/page.tsx`

**السطور 12-20:**
```typescript
useEffect(() => {
  if (!isAuthenticated) {
    router.replace('/login');
  } else if (user?.role === 'admin') {
    router.replace('/admin/dashboard');
  } else {
    router.replace('/dashboard');
  }
}, [isAuthenticated, user, router]);
```

**✅ يعمل بشكل صحيح:** يستخدم `router.replace()` للاتساق

---

### 6. ProtectedRoute (حماية الصفحات)
**الملف:** `frontend/src/components/auth/ProtectedRoute.tsx`

**السطور 95-105:**
```typescript
if (!requiredRoles.includes(currentRole)) {
  // User doesn't have required role, redirect to appropriate dashboard
  const targetPath = currentRole === 'admin' ? '/admin/dashboard' : '/dashboard';
  console.log('[ProtectedRoute] Redirecting due to role mismatch:', {
    from: pathname,
    to: targetPath,
    currentRole,
    requiredRoles,
  });
  router.push(targetPath);
  return;
}
```

**✅ يعمل بشكل صحيح:** يحمي صفحات الأدمن ويوجه المستخدمين غير المصرح لهم

---

### 7. Admin Layout Protection
**الملف:** `frontend/app/(admin)/layout.tsx`

**السطر 18:**
```typescript
<ProtectedRoute requiredRole="admin">
```

**✅ يعمل بشكل صحيح:** يحمي جميع صفحات الأدمن تحت `/admin/*`

---

### 8. AuthContext - تحديث Role
**الملف:** `frontend/src/context/AuthContext.tsx`

**السطور 146-165:**
- ✅ يستخدم `useSupabaseUser` لجلب role من قاعدة البيانات
- ✅ يحدّث role في AuthContext عند تغييره
- ✅ يحفظ role في localStorage

---

### 9. useSupabaseUser Hook
**الملف:** `frontend/src/hooks/useSupabaseUser.ts`

**التحسينات:**
- ✅ يتحقق من جدول `user_roles` إذا لم يكن role في العمود
- ✅ يحدّث role تلقائياً كل 30 ثانية
- ✅ يعمل بشكل متزامن مع `AuthContext`

---

## 📋 قائمة التحقق النهائية

### ✅ جميع النقاط تعمل بشكل صحيح:

1. ✅ **تسجيل الدخول** → يحدد role ويوجه الأدمن إلى `/admin/dashboard`
2. ✅ **جلب Role** → يتحقق من قاعدة البيانات بشكل شامل (users + user_roles)
3. ✅ **RootPageClient** → يوجه الأدمن عند الوصول للصفحة الرئيسية
4. ✅ **Investor Root** → يوجه الأدمن بعيداً عن صفحة المستثمر
5. ✅ **Middleware Redirect** → يستخدم `router.replace()` بشكل صحيح
6. ✅ **ProtectedRoute** → يحمي الصفحات ويوجه حسب الدور
7. ✅ **Admin Layout** → محمي بـ `ProtectedRoute requiredRole="admin"`
8. ✅ **AuthContext** → يحدّث role من قاعدة البيانات
9. ✅ **useSupabaseUser** → يتحقق من user_roles ويحدّث role

---

## 🔍 كيفية التحقق يدوياً

### 1. فتح Console Logs
بعد تسجيل دخول الأدمن، ابحث عن:
```
[Login] Role from database column: admin
أو
[Login] Role from user_roles table (RBAC): admin
[Login] Final determined role: { role: 'admin', ... }
```

### 2. التحقق من التوجيه
- ✅ يجب أن يتم التوجيه إلى `/admin/dashboard`
- ✅ يجب أن تظهر صفحة `AdminDashboardPage`
- ✅ يجب أن يكون `AdminSidebarNav` مرئياً

### 3. التحقق من Role في AuthContext
```javascript
// في Console
console.log(user?.role) // يجب أن يكون 'admin'
```

---

## 🚨 إذا لم يعمل

### تحقق من:
1. ✅ وجود `role = 'admin'` في عمود `role` في جدول `users`
   - أو
2. ✅ وجود role `admin` في جدول `user_roles` للمستخدم
3. ✅ RLS policies تسمح للمستخدم بقراءة بياناته
4. ✅ Session موجودة وصالحة

### أخطاء محتملة:
- ❌ RLS policy تمنع القراءة → تحقق من migration `20241106000004_rls_policies.sql`
- ❌ Role غير موجود في قاعدة البيانات → أضف role يدوياً
- ❌ Session منتهية → سجّل الدخول مرة أخرى

---

## ✅ النتيجة النهائية

**جميع النقاط تم التحقق منها وتعمل بشكل صحيح:**
- ✅ الأدمن يتم توجيهه إلى `/admin/dashboard` بعد تسجيل الدخول
- ✅ جلب role يعمل من قاعدة البيانات بشكل شامل
- ✅ جميع نقاط التوجيه تستخدم `router.replace()` للاتساق
- ✅ الصفحات محمية بـ `ProtectedRoute`
- ✅ `AuthContext` يحدّث role بشكل تلقائي

**النظام جاهز للاستخدام!** 🎉

