# Route Protection System

## نظرة عامة

تم إنشاء نظام شامل لحماية الصفحات بناءً على تسجيل المستخدم والدور (role). النظام يتكون من:

1. **ProtectedRoute Component** - مكون لحماية الصفحات
2. **useRequireAuth Hook** - Hook للتحقق من authentication
3. **Layout Protection** - حماية على مستوى Layout
4. **Middleware** - حماية أساسية على مستوى Server

## المكونات

### 1. ProtectedRoute Component

مكون React يحمي الصفحات بناءً على authentication و role.

**الاستخدام:**
```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Protected Admin Content</div>
    </ProtectedRoute>
  );
}
```

**الخصائص:**
- `requiredRole?: 'investor' | 'admin' | ('investor' | 'admin')[]` - الدور المطلوب
- `redirectTo?: string` - مسار إعادة التوجيه (افتراضي: '/login')
- `showLoading?: boolean` - عرض حالة التحميل (افتراضي: true)

**مثال متقدم:**
```tsx
// حماية لصفحة تحتاج admin فقط
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>

// حماية لصفحة تحتاج investor أو admin
<ProtectedRoute requiredRole={['investor', 'admin']}>
  <SharedPage />
</ProtectedRoute>

// حماية لصفحة تحتاج أي مستخدم مسجل
<ProtectedRoute>
  <AnyAuthenticatedUserPage />
</ProtectedRoute>
```

### 2. useRequireAuth Hook

Hook للتحقق من authentication و role في المكونات.

**الاستخدام:**
```tsx
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function MyComponent() {
  const { isAuthenticated, user, hasRequiredRole, isLoading } = useRequireAuth({
    requiredRole: 'admin',
    redirect: true, // إعادة توجيه تلقائية
  });

  if (isLoading || !isAuthenticated || !hasRequiredRole) {
    return <div>Loading...</div>;
  }

  return <div>Protected Content</div>;
}
```

**الخصائص:**
- `requiredRole?: 'investor' | 'admin' | ('investor' | 'admin')[]` - الدور المطلوب
- `redirectTo?: string` - مسار إعادة التوجيه (افتراضي: '/login')
- `redirect?: boolean` - إعادة توجيه تلقائية (افتراضي: true)

**القيم المُرجعة:**
- `isAuthenticated: boolean` - هل المستخدم مسجل دخول
- `user: AuthUser | null` - بيانات المستخدم
- `hasRequiredRole: boolean` - هل المستخدم لديه الدور المطلوب
- `isLoading: boolean` - حالة التحميل

### 3. Layout Protection

تم تحديث Layouts لحماية جميع الصفحات تلقائياً:

**Admin Layout:**
```tsx
// frontend/app/(admin)/layout.tsx
<ProtectedRoute requiredRole="admin">
  {/* Admin content */}
</ProtectedRoute>
```

**Investor Layout:**
```tsx
// frontend/app/(investor)/layout.tsx
<ProtectedRoute requiredRole="investor">
  {/* Investor content */}
</ProtectedRoute>
```

## كيفية العمل

### 1. تدفق الحماية

```
User visits protected route
    ↓
ProtectedRoute checks authentication
    ↓
Not authenticated? → Redirect to /login
    ↓
Authenticated but wrong role? → Redirect to appropriate dashboard
    ↓
Authenticated and correct role? → Render content
```

### 2. إعادة التوجيه بعد تسجيل الدخول

عند محاولة الوصول لصفحة محمية بدون تسجيل دخول:
1. يتم حفظ المسار الحالي في `sessionStorage`
2. يتم إعادة التوجيه إلى `/login`
3. بعد تسجيل الدخول الناجح، يتم إعادة التوجيه إلى المسار المحفوظ

### 3. حماية الصفحات العامة

الصفحات التالية متاحة للجميع بدون تسجيل دخول:
- `/` - الصفحة الرئيسية
- `/login` - تسجيل الدخول
- `/register` - التسجيل
- `/verify` - التحقق من OTP
- `/reset-password` - إعادة تعيين كلمة المرور
- `/home` - الصفحة الرئيسية للمستثمر (عامة)
- `/news` - الأخبار العامة

## أمثلة الاستخدام

### مثال 1: حماية صفحة Admin

```tsx
// frontend/app/(admin)/dashboard/page.tsx
export default function AdminDashboard() {
  // لا حاجة لـ ProtectedRoute هنا لأن Layout يحميها
  return <div>Admin Dashboard</div>;
}
```

### مثال 2: حماية صفحة Investor

```tsx
// frontend/app/(investor)/profile/page.tsx
export default function InvestorProfile() {
  // لا حاجة لـ ProtectedRoute هنا لأن Layout يحميها
  return <div>Investor Profile</div>;
}
```

### مثال 3: حماية صفحة مشتركة

```tsx
// frontend/app/shared/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function SharedPage() {
  return (
    <ProtectedRoute requiredRole={['investor', 'admin']}>
      <div>Shared Content</div>
    </ProtectedRoute>
  );
}
```

### مثال 4: استخدام Hook في مكون

```tsx
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function MyComponent() {
  const { user, isAuthenticated } = useRequireAuth({
    requiredRole: 'admin',
    redirect: false, // لا إعادة توجيه تلقائية
  });

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user?.email}</div>;
}
```

## الصفحات المحمية

### صفحات Admin (تتطلب role: 'admin')
- `/admin` - لوحة تحكم الأدمن
- `/admin/dashboard` - لوحة تحكم الأدمن
- `/admin/requests` - صندوق الوارد
- `/admin/investors` - قائمة المستثمرين
- `/admin/news` - إدارة الأخبار
- `/admin/projects` - إدارة المشاريع
- `/admin/reports` - التقارير
- `/admin/audit` - سجل التدقيق
- `/admin/company-content` - محتوى الشركة
- `/admin/signup-requests` - طلبات التسجيل

### صفحات Investor (تتطلب role: 'investor')
- `/dashboard` - لوحة تحكم المستثمر
- `/profile` - الملف الشخصي
- `/requests` - قائمة الطلبات
- `/requests/new` - طلب جديد
- `/projects` - المشاريع
- `/internal-news` - الأخبار الداخلية

## ملاحظات مهمة

1. **Client-Side Protection**: الحماية الأساسية تتم على جانب العميل (client-side)
2. **Server-Side Validation**: التحقق من authentication يتم أيضاً على الـ backend في API routes
3. **Token Storage**: Tokens محفوظة في localStorage و cookies
4. **Session Management**: Session يتم إدارته تلقائياً عبر Supabase Auth
5. **Role-Based Access**: الوصول يعتمد على role المستخدم (investor/admin)

## استكشاف الأخطاء

### المستخدم لا يتم إعادة توجيهه
- تحقق من أن `AuthContext` يعمل بشكل صحيح
- تحقق من أن tokens محفوظة في localStorage
- تحقق من console للأخطاء

### المستخدم يتم إعادة توجيهه دائماً
- تحقق من أن role المستخدم صحيح
- تحقق من أن `requiredRole` في ProtectedRoute صحيح
- تحقق من logs في console

### الصفحة لا تُحمّل
- تحقق من أن Layout يحتوي على ProtectedRoute
- تحقق من أن authentication يعمل بشكل صحيح
- تحقق من network requests

