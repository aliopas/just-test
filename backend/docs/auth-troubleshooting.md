# استكشاف أخطاء Supabase Auth

## المشاكل الشائعة والحلول

### 1. المستخدم لا يتم إنشاؤه في جدول `users`

**المشكلة:** المستخدم يسجل الدخول بنجاح في Supabase Auth لكن لا يوجد له سجل في جدول `users`.

**الحل:**
- تم إضافة `ensureUserRecord` في login controller
- الدالة تتحقق من وجود المستخدم وتنشئه تلقائياً إذا لم يكن موجوداً
- إذا فشل الإنشاء، يتم رفض تسجيل الدخول

### 2. Session لا يتم حفظه في Frontend

**المشكلة:** بعد تسجيل الدخول، Session لا يتم حفظه في Supabase client.

**الحل:**
- تم تحسين `useLogin` hook لمعالجة Session بشكل أفضل
- يتم حفظ tokens في localStorage
- يتم تعيين Session في Supabase client تلقائياً
- إضافة verification للتحقق من أن Session تم تعيينه بشكل صحيح

### 3. التحقق من حالة المستخدم

**المشكلة:** المستخدمون غير النشطين يمكنهم تسجيل الدخول.

**الحل:**
- تم إضافة التحقق من `status` المستخدم
- فقط المستخدمون بحالة `active` يمكنهم تسجيل الدخول
- رسائل خطأ واضحة حسب الحالة:
  - `pending`: "Your account is pending activation"
  - `suspended`: "Your account has been suspended"
  - حالات أخرى: "Your account is not active"

## كيفية التحقق من أن Auth يعمل بشكل صحيح

### في Backend:

1. **التحقق من Logs:**
```bash
# في console backend، يجب أن ترى:
[Supabase] Environment check: { hasSupabaseUrl: true, ... }
```

2. **التحقق من أن ensureUserRecord يعمل:**
- بعد تسجيل الدخول، يجب أن ترى user في جدول `users`
- إذا لم يكن موجوداً، سيتم إنشاؤه تلقائياً

3. **التحقق من Status:**
- فقط المستخدمون بـ `status = 'active'` يمكنهم تسجيل الدخول

### في Frontend:

1. **التحقق من Console:**
```javascript
// بعد تسجيل الدخول، يجب أن ترى:
[Supabase Auth] Session initialized successfully
[Supabase Auth] Session verified successfully
```

2. **التحقق من localStorage:**
- يجب أن ترى `sb-<project-ref>-auth-token` في localStorage
- يجب أن يحتوي على `access_token` و `refresh_token`

3. **التحقق من Session:**
```javascript
const supabase = getSupabaseBrowserClient();
const { data } = await supabase.auth.getSession();
console.log('Current session:', data.session);
```

## Debugging Steps

1. **تحقق من Environment Variables:**
   - Backend: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - Frontend: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **تحقق من Network Requests:**
   - افتح DevTools > Network
   - ابحث عن requests إلى `/auth/login`
   - تحقق من response

3. **تحقق من Database:**
   - تأكد من وجود المستخدم في جدول `users`
   - تحقق من أن `status = 'active'`

4. **تحقق من Supabase Dashboard:**
   - افتح Supabase Dashboard > Authentication > Users
   - تحقق من وجود المستخدم
   - تحقق من أن email verified

## Common Errors

### "User account not found"
- **السبب:** المستخدم غير موجود في جدول `users` وفشل `ensureUserRecord`
- **الحل:** تحقق من logs backend لمعرفة سبب الفشل

### "ACCOUNT_INACTIVE"
- **السبب:** المستخدم موجود لكن `status` ليس `active`
- **الحل:** قم بتحديث `status` إلى `active` في جدول `users`

### "Session not set"
- **السبب:** فشل في تعيين Session في Supabase client
- **الحل:** تحقق من أن tokens صحيحة وأن Supabase client مُهيأ بشكل صحيح

