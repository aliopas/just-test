# حل مشاكل تسجيل دخول الأدمن

## 🔍 خطوات التشخيص

### 1. فتح Console Logs

بعد تسجيل دخول الأدمن، افتح Console في المتصفح (F12) وابحث عن:

#### ✅ إذا كان كل شيء يعمل:
```
[Login] User data from database: { userId: "...", role: "admin" }
[Login] ✅ Role from database column: admin
[Login] Final determined role: { role: 'admin', ... }
[Login] Redirecting to: /admin/dashboard for role: admin
[AuthContext] Updating user from database: { userRecordRole: 'admin', determinedRole: 'admin' }
```

#### ❌ إذا كان هناك مشكلة:

**أ) RLS Policy تمنع القراءة:**
```
[Login] ❌ Failed to fetch role from users table (RLS or other issue): {
  error: "...",
  code: "42501",  // أو code آخر
  hint: "..."
}
```
**الحل:** تحقق من RLS policies في قاعدة البيانات

**ب) Role غير موجود في قاعدة البيانات:**
```
[Login] User data from database: { role: null }
[Login] Role from database column: null (defaulting to investor)
[Login] No admin role found in user_roles
```
**الحل:** أضف role 'admin' في قاعدة البيانات

**ج) Role موجود لكن لا يتم التوجيه:**
```
[Login] ✅ Role from database column: admin
[Login] Final determined role: { role: 'admin' }
[Login] Redirecting to: /admin/dashboard for role: admin
```
**الحل:** المشكلة في AuthContext أو التوجيه

---

## 🛠️ الحلول

### الحل 1: التحقق من Role في قاعدة البيانات

#### الطريقة 1: من Supabase Dashboard
1. افتح Supabase Dashboard
2. اذهب إلى **Table Editor** → `users`
3. ابحث عن المستخدم (بالبريد الإلكتروني)
4. تحقق من عمود `role`:
   - يجب أن يكون `admin` وليس `null` أو `investor`

#### الطريقة 2: من SQL Editor
```sql
-- تحقق من role المستخدم
SELECT id, email, role FROM users WHERE email = 'admin@example.com';

-- إذا كان role null أو investor، قم بتحديثه:
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

---

### الحل 2: التحقق من RLS Policies

#### تحقق من أن Policy "Users can read own data" موجودة:
```sql
SELECT * FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can read own data';
```

#### إذا لم تكن موجودة، قم بإنشائها:
```sql
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);
```

---

### الحل 3: التحقق من User Roles (RBAC)

إذا كنت تستخدم RBAC وليس عمود role مباشرة:

```sql
-- تحقق من user_roles
SELECT ur.user_id, r.name, r.slug
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = 'USER_ID_HERE';

-- إذا لم يكن موجوداً، أضفه:
INSERT INTO user_roles (user_id, role_id)
SELECT 'USER_ID_HERE', id FROM roles WHERE name = 'admin';
```

---

### الحل 4: التحقق من Session

تأكد من أن Session موجودة وصالحة:

```javascript
// في Console
const supabase = window.supabase; // أو getSupabaseBrowserClient()
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User:', session?.user);
```

---

### الحل 5: مسح Cache وإعادة المحاولة

1. **مسح localStorage:**
```javascript
localStorage.removeItem('auth_user');
localStorage.removeItem('sb-...'); // Session storage
```

2. **مسح Cookies:**
- افتح Developer Tools → Application → Cookies
- احذف جميع cookies المتعلقة بـ Supabase

3. **إعادة تسجيل الدخول**

---

### الحل 6: التحقق من Console Errors

ابحث عن أخطاء في Console:
- ❌ Network errors (CORS, 401, 403)
- ❌ RLS policy errors
- ❌ Authentication errors

---

## 📋 Checklist للتشخيص

- [ ] ✅ Role موجود في جدول `users` (عمود `role = 'admin'`)
- [ ] ✅ RLS Policy "Users can read own data" موجودة وتعمل
- [ ] ✅ Session موجودة وصالحة
- [ ] ✅ لا توجد أخطاء في Console
- [ ] ✅ Logs تظهر role 'admin' بشكل صحيح
- [ ] ✅ AuthContext يحتوي على role 'admin'
- [ ] ✅ التوجيه يحدث إلى `/admin/dashboard`

---

## 🔧 إصلاحات تم تطبيقها

### 1. تحسين Logging
- ✅ إضافة logs مفصلة في كل خطوة
- ✅ تسجيل role من كل مصدر (database, user_roles, metadata, JWT)

### 2. تحسين التوقيت
- ✅ تأخير بسيط (100ms) قبل التوجيه لضمان تحديث AuthContext
- ✅ حفظ role في localStorage فوراً

### 3. Fallback Chain محسّن
- ✅ Database column → user_roles table → metadata → JWT token

### 4. تحديث AuthContext
- ✅ Logging عند تحديث role
- ✅ التأكد من تحديث role بشكل صحيح

---

## 🧪 اختبار يدوي

### الخطوة 1: سجّل الدخول
```
1. افتح صفحة تسجيل الدخول
2. أدخل بيانات الأدمن
3. اضغط "تسجيل الدخول"
```

### الخطوة 2: فتح Console
```
1. اضغط F12
2. اذهب إلى Console
3. ابحث عن logs [Login]
```

### الخطوة 3: التحقق من Role
```javascript
// في Console
const { user } = useAuth(); // إذا كان متاحاً
// أو
console.log(JSON.parse(localStorage.getItem('auth_user')));
```

### الخطوة 4: التحقق من التوجيه
```
- يجب أن يكون URL: /admin/dashboard
- يجب أن تظهر صفحة AdminDashboardPage
- يجب أن يكون AdminSidebarNav مرئياً
```

---

## 📞 إذا لم يعمل بعد

### معلومات إضافية مطلوبة:
1. **Console Logs** - جميع logs من [Login]
2. **Network Tab** - طلبات Supabase (خاصة SELECT من users table)
3. **Database Query** - نتيجة `SELECT role FROM users WHERE email = '...'`
4. **RLS Policies** - نتيجة `SELECT * FROM pg_policies WHERE tablename = 'users'`

---

## ✅ النتيجة المتوقعة

بعد تطبيق جميع الحلول:
- ✅ الأدمن يسجل الدخول بنجاح
- ✅ Role يتم جلبها من قاعدة البيانات
- ✅ AuthContext يحتوي على role 'admin'
- ✅ التوجيه يحدث إلى `/admin/dashboard`
- ✅ صفحة لوحة تحكم الأدمن تظهر بشكل صحيح

