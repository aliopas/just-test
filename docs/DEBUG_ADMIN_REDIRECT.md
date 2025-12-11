# تشخيص مشكلة التوجيه للأدمن

## المشكلة
الأدمن `oooomar11223300@gmail.com` يتم توجيهه إلى `/dashboard` بدلاً من `/admin/dashboard`

## بيانات المستخدم في Supabase

### ✅ users table:
- `role = 'admin'` ✅

### ✅ user_roles table:
- role `admin` موجود ✅

### ✅ auth.users.metadata:
- `raw_user_meta_data.role = 'admin'` ✅ (تم التحديث)

---

## التحقق من الكود

### 1. useSupabaseLogin.ts - تسلسل التحقق من Role

**التسلسل الحالي:**
1. ✅ فحص metadata أولاً (الأسرع)
2. ✅ محاولة قاعدة البيانات
3. ✅ user_roles table
4. ✅ JWT token

### 2. نقطة التوجيه (onSuccess callback)

```typescript
const userRole = data.user.role || 'investor';
const dashboardPath = userRole === 'admin' 
  ? '/admin/dashboard' 
  : '/dashboard';
router.replace(dashboardPath);
```

---

## خطوات التشخيص

### 1. افتح Console (F12)

### 2. ابحث عن هذه الـ Logs بالترتيب:

```
[Login] Checking metadata first: { userMetadataRole: '...', appMetadataRole: '...' }
[Login] ✅ Role from metadata: admin (using as primary source)
أو
[Login] User data from database: { role: 'admin' }
[Login] ✅ Role confirmed from database column: admin
```

### 3. ثم:

```
[Login] ========== FINAL ROLE DETERMINATION ==========
[Login] Final Role: ???
[Login] Will redirect to: ???
```

### 4. ثم:

```
[Login] ========== REDIRECT DECISION ==========
[Login] User Role: ???
[Login] Redirect Path: ???
```

---

## إذا كانت Logs تظهر role = 'investor'

### السبب المحتمل 1: RLS Policy تمنع القراءة
**الحل:** 
- تحقق من أن policy "Users can read own data" موجودة
- يجب أن يكون المستخدم قادراً على قراءة بياناته الخاصة

### السبب المحتمل 2: Metadata غير محدث
**الحل:**
- تم تحديث metadata، لكن قد يحتاج المستخدم لتسجيل خروج ودخول
- أو JWT token قديم

### السبب المحتمل 3: Cache قديم
**الحل:**
```javascript
localStorage.clear();
sessionStorage.clear();
// ثم سجّل الدخول مرة أخرى
```

---

## اختبار يدوي

### في Console بعد تسجيل الدخول:

```javascript
// 1. تحقق من localStorage
console.log('localStorage auth_user:', localStorage.getItem('auth_user'));

// 2. تحقق من Supabase session
const supabase = window.supabase || getSupabaseBrowserClient();
const { data: { session } } = await supabase.auth.getSession();
console.log('Session user:', session?.user);
console.log('Session metadata:', session?.user?.user_metadata);

// 3. تحقق من AuthContext (إذا كان متاحاً)
// يجب أن يكون role = 'admin'
```

---

## حلول إضافية

### إذا استمرت المشكلة:

1. **تأكد من أن metadata محدث:**
```sql
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'oooomar11223300@gmail.com';
```

2. **تأكد من أن RLS policy تعمل:**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'users' 
AND policyname = 'Users can read own data';
```

3. **اختبار جلب role مباشرة:**
```javascript
// في Console بعد تسجيل الدخول
const supabase = getSupabaseBrowserClient();
const { data, error } = await supabase
  .from('users')
  .select('role')
  .eq('id', 'YOUR_USER_ID')
  .single();
console.log('Role from DB:', data, error);
```

