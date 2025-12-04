# Supabase Auth Integration

## نظرة عامة

تم دمج Supabase Authentication مباشرة في نظام الحماية. الآن النظام يستخدم Supabase client للتحقق من authentication في الوقت الفعلي.

## المكونات الجديدة

### 1. useSupabaseAuth Hook

Hook للتحقق من authentication باستخدام Supabase client مباشرة.

**الاستخدام:**
```tsx
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

function MyComponent() {
  const { user, session, isLoading, isAuthenticated, signOut, refreshSession } = useSupabaseAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

**القيم المُرجعة:**
- `user: User | null` - Supabase user object
- `session: Session | null` - Supabase session
- `isLoading: boolean` - حالة التحميل
- `isAuthenticated: boolean` - هل المستخدم مسجل دخول
- `signOut: () => Promise<void>` - تسجيل الخروج
- `refreshSession: () => Promise<void>` - تحديث session

### 2. useSupabaseUser Hook

Hook للحصول على بيانات المستخدم من جدول `users` في Supabase.

**الاستخدام:**
```tsx
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

function MyComponent() {
  const { userRecord, isLoading, error, refresh } = useSupabaseUser(userId);

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <p>Role: {userRecord?.role}</p>
      <p>Status: {userRecord?.status}</p>
    </div>
  );
}
```

**القيم المُرجعة:**
- `userRecord: UserRecord | null` - بيانات المستخدم من جدول users
- `isLoading: boolean` - حالة التحميل
- `error: Error | null` - خطأ إن وجد
- `refresh: () => Promise<void>` - تحديث البيانات

## التحديثات المطبقة

### 1. AuthContext Integration

تم تحديث `AuthContext` لاستخدام Supabase hooks:
- يستخدم `useSupabaseAuth` للتحقق من authentication
- يستخدم `useSupabaseUser` للحصول على بيانات المستخدم
- يدمج البيانات من Supabase مع localStorage للسرعة

### 2. ProtectedRoute Enhancement

تم تحديث `ProtectedRoute` لاستخدام Supabase auth:
- يتحقق من Supabase session أولاً
- يعود إلى AuthContext إذا لم يكن Supabase متاحاً
- يعرض loading state أثناء التحقق من Supabase

## كيفية العمل

### تدفق Authentication

```
1. User logs in via backend API
   ↓
2. Backend returns tokens
   ↓
3. Frontend stores tokens and sets Supabase session
   ↓
4. useSupabaseAuth detects session change
   ↓
5. useSupabaseUser fetches user record from users table
   ↓
6. AuthContext combines Supabase auth + user record
   ↓
7. ProtectedRoute checks authentication
   ↓
8. User can access protected pages
```

### Session Management

- **Auto Refresh**: Session يتم تحديثه تلقائياً كل 5 دقائق
- **State Changes**: يتم الاستماع لتغييرات auth state في الوقت الفعلي
- **Token Refresh**: Tokens يتم تحديثها تلقائياً عند الحاجة

## المزايا

1. **Real-time Updates**: التحديثات في الوقت الفعلي عند تغيير authentication state
2. **Direct Supabase Integration**: استخدام Supabase client مباشرة
3. **Automatic Token Refresh**: تحديث تلقائي للـ tokens
4. **User Record Sync**: مزامنة مع جدول users في Supabase
5. **Fallback Support**: يعود إلى localStorage إذا لم يكن Supabase متاحاً

## أمثلة الاستخدام

### مثال 1: التحقق من Authentication

```tsx
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

function MyComponent() {
  const { isAuthenticated, user, isLoading } = useSupabaseAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {user?.email}</div>;
}
```

### مثال 2: الحصول على بيانات المستخدم

```tsx
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

function UserProfile() {
  const { user } = useSupabaseAuth();
  const { userRecord } = useSupabaseUser(user?.id);

  return (
    <div>
      <p>Email: {userRecord?.email}</p>
      <p>Role: {userRecord?.role}</p>
      <p>Status: {userRecord?.status}</p>
    </div>
  );
}
```

### مثال 3: تسجيل الخروج

```tsx
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useRouter } from 'next/navigation';

function LogoutButton() {
  const { signOut } = useSupabaseAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return <button onClick={handleLogout}>Sign Out</button>;
}
```

## استكشاف الأخطاء

### Session لا يتم تحديثه
- تحقق من أن Supabase client مُهيأ بشكل صحيح
- تحقق من console للأخطاء
- تحقق من أن tokens صحيحة

### User Record لا يتم جلبها
- تحقق من أن المستخدم موجود في جدول `users`
- تحقق من RLS policies
- تحقق من console للأخطاء

### Authentication لا يعمل
- تحقق من أن `NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_ANON_KEY` معرّفة
- تحقق من أن Supabase client يعمل
- تحقق من network requests في DevTools

