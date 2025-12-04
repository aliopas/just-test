# اختبار تسجيل الدخول كأدمن

## معلومات تسجيل الدخول
- **Email**: oooomar11223300@gmail.com
- **Password**: Admin@123

## الخطوات المطلوبة للتحقق

### 1. التحقق من وجود المستخدم في Supabase Auth
- تأكد من أن المستخدم موجود في Supabase Auth Dashboard
- تأكد من أن البريد الإلكتروني: `oooomar11223300@gmail.com`
- تأكد من أن كلمة المرور صحيحة

### 2. التحقق من وجود المستخدم في جدول `users`
```sql
SELECT id, email, role, status 
FROM users 
WHERE email = 'oooomar11223300@gmail.com';
```

**المتوقع:**
- يجب أن يكون `status = 'active'`
- يجب أن يكون `role = 'admin'`

### 3. إذا كان المستخدم غير موجود في جدول `users`
سيتم إنشاؤه تلقائياً عند تسجيل الدخول عبر `ensureUserRecord`، لكن:
- قد لا يكون `role = 'admin'` إذا لم يكن موجوداً في `user_metadata` أو `app_metadata`
- قد يحتاج إلى تحديث يدوي

### 4. تحديث المستخدم يدوياً (إذا لزم الأمر)
```sql
-- تحديث role إلى admin
UPDATE users 
SET role = 'admin', status = 'active'
WHERE email = 'oooomar11223300@gmail.com';

-- أو تحديث user_metadata في Supabase Auth
-- في Supabase Dashboard > Authentication > Users > Edit User
-- أضف في user_metadata: { "role": "admin" }
```

### 5. اختبار تسجيل الدخول
1. افتح صفحة تسجيل الدخول
2. أدخل البريد الإلكتروني: `oooomar11223300@gmail.com`
3. أدخل كلمة المرور: `Admin@123`
4. اضغط تسجيل الدخول

### 6. مراقبة السجلات (Logs)
بعد إضافة التسجيل المفصل، ستظهر السجلات التالية:
- `[Login] Attempting login` - بداية محاولة تسجيل الدخول
- `[Login] Supabase auth successful` - نجاح المصادقة مع Supabase
- `[ensureUserRecord] Checking user` - التحقق من وجود المستخدم
- `[ensureUserRecord] User exists` أو `[ensureUserRecord] Creating/updating user record`
- `[Login] User data retrieved` - بيانات المستخدم المسترجعة
- `[Login] Final role determination` - تحديد الدور النهائي
- `[Login] Login successful` - نجاح تسجيل الدخول

### 7. المشاكل المحتملة وحلولها

#### المشكلة: "INVALID_CREDENTIALS"
- **السبب**: البريد الإلكتروني أو كلمة المرور غير صحيحة
- **الحل**: تأكد من صحة البيانات في Supabase Auth Dashboard

#### المشكلة: "USER_NOT_FOUND"
- **السبب**: المستخدم غير موجود في جدول `users`
- **الحل**: سيتم إنشاؤه تلقائياً، لكن قد يحتاج إلى تحديث `role` يدوياً

#### المشكلة: "ACCOUNT_INACTIVE"
- **السبب**: `status` في جدول `users` ليس `'active'`
- **الحل**: قم بتحديث `status` إلى `'active'`:
  ```sql
  UPDATE users SET status = 'active' WHERE email = 'oooomar11223300@gmail.com';
  ```

#### المشكلة: الدور غير صحيح (role != 'admin')
- **السبب**: `role` في جدول `users` ليس `'admin'`
- **الحل**: قم بتحديث `role` إلى `'admin'`:
  ```sql
  UPDATE users SET role = 'admin' WHERE email = 'oooomar11223300@gmail.com';
  ```
  
  أو أضف `role` في `user_metadata` في Supabase Auth Dashboard

### 8. التحقق من السجلات في Netlify
بعد إعادة النشر، يمكنك مراقبة السجلات في:
- Netlify Dashboard > Functions > server > Logs
- ابحث عن `[Login]` و `[ensureUserRecord]` في السجلات

## ملاحظات
- تم إضافة تسجيل مفصل في `auth.controller.ts` و `auth.middleware.ts`
- جميع العمليات يتم تسجيلها لتسهيل التشخيص
- في حالة وجود مشاكل، راجع السجلات أولاً

