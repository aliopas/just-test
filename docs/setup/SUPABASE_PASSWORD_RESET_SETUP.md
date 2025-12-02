# إعداد استعادة كلمة المرور في Supabase
# Supabase Password Reset Setup

## نظرة عامة / Overview

هذا المستند يوضح كيفية إعداد استعادة كلمة المرور في Supabase باستخدام MCP.
This document explains how to set up password reset in Supabase using MCP.

---

## الإعدادات المطلوبة في Supabase Dashboard
## Required Settings in Supabase Dashboard

### 1. Site URL Configuration

**المسار:** Authentication > URL Configuration  
**Path:** Authentication > URL Configuration

يجب تعيين:
- **Site URL**: `https://your-domain.com` (أو `http://localhost:5173` للتطوير)
- **Redirect URLs**: أضف التالي:
  - `http://localhost:5173/reset-password` (للتطوير)
  - `https://your-domain.com/reset-password` (للإنتاج)

### 2. Email Template Configuration

**المسار:** Authentication > Email Templates > Reset Password  
**Path:** Authentication > Email Templates > Reset Password

**Subject (العنوان):**
```
استعادة كلمة المرور / Reset Your Password
```

**Content (المحتوى):**
```html
<h2>استعادة كلمة المرور</h2>
<p>مرحباً،</p>
<p>لقد طلبت إعادة تعيين كلمة المرور لحسابك. انقر على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
<p><a href="{{ .ConfirmationURL }}">إعادة تعيين كلمة المرور</a></p>
<p>إذا لم تطلب هذا التغيير، يمكنك تجاهل هذا البريد الإلكتروني.</p>
<p>هذا الرابط صالح لمدة ساعة واحدة.</p>
<hr>
<h2>Reset Your Password</h2>
<p>Hello,</p>
<p>You have requested to reset your password. Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you did not request this change, you can ignore this email.</p>
<p>This link is valid for one hour.</p>
```

**ملاحظة:** يمكنك تخصيص القالب حسب احتياجاتك. المتغيرات المتاحة:
- `{{ .ConfirmationURL }}` - رابط التأكيد الكامل
- `{{ .TokenHash }}` - hash الرمز (للبناء المخصص)
- `{{ .SiteURL }}` - عنوان الموقع
- `{{ .Email }}` - عنوان البريد الإلكتروني للمستخدم

---

## إعدادات الكود
## Code Configuration

### Frontend Configuration

الكود الحالي في `frontend/src/hooks/useResetPassword.ts` يستخدم:
```typescript
redirectTo: `${window.location.origin}/reset-password`
```

هذا يعني أن الرابط سيكون:
- للتطوير: `http://localhost:5173/reset-password`
- للإنتاج: `https://your-domain.com/reset-password`

**يجب أن يتطابق هذا مع Redirect URLs في Supabase Dashboard.**

### Reset Password Page

الصفحة `frontend/src/pages/ResetPasswordPage.tsx` تتعامل مع:
- التحقق من `token_hash` من URL
- التحقق من الرابط باستخدام `supabase.auth.verifyOtp()`
- تحديث كلمة المرور باستخدام `supabase.auth.updateUser()`

---

## خطوات الإعداد
## Setup Steps

### 1. تفعيل Email Provider في Supabase Dashboard:

**المسار:** Authentication > Providers > Email  
**Path:** Authentication > Providers > Email

1. تأكد من أن **Email** provider مفعّل (Enabled)
2. إذا لم يكن مفعلاً، فعّله واحفظ التغييرات

### 2. إعداد SMTP (اختياري - للإنتاج):

**المسار:** Authentication > Settings > SMTP Settings  
**Path:** Authentication > Settings > SMTP Settings

للإنتاج، يُنصح بإعداد SMTP مخصص:
- **Host**: smtp provider (مثل SendGrid, AWS SES, etc.)
- **Port**: 587 (TLS) أو 465 (SSL)
- **Username**: SMTP username
- **Password**: SMTP password
- **Sender email**: البريد الإلكتروني المرسل
- **Sender name**: اسم المرسل

**ملاحظة:** في التطوير، Supabase يستخدم SMTP افتراضي، لكن قد يكون محدود.

### 3. إعداد URL Configuration:

1. اذهب إلى **Authentication > URL Configuration**
2. أضف `http://localhost:5173/reset-password` إلى **Redirect URLs** (للتطوير)
3. أضف `https://your-domain.com/reset-password` إلى **Redirect URLs** (للإنتاج)
4. احفظ التغييرات

### 4. إعداد Email Template:

1. اذهب إلى **Authentication > Email Templates**
2. اختر **Reset Password**
3. عدّل القالب حسب الحاجة (أو استخدم القالب أعلاه)
4. تأكد من تعيين **From** و **Reply-To** addresses
5. احفظ التغييرات

### 3. التحقق من الكود:

تأكد من أن:
- `frontend/src/hooks/useResetPassword.ts` يستخدم `redirectTo` الصحيح
- `frontend/src/pages/ResetPasswordPage.tsx` موجودة ومضاف route لها في `App.tsx`
- `frontend/src/utils/supabase-client.ts` لديه `detectSessionInUrl: true`

---

## اختبار الوظيفة
## Testing the Feature

### 1. اختبار في التطوير:

1. افتح `http://localhost:5173/login`
2. انقر على "نسيت كلمة المرور؟"
3. أدخل بريدك الإلكتروني
4. تحقق من البريد الإلكتروني
5. انقر على الرابط في البريد
6. يجب أن يتم توجيهك إلى `http://localhost:5173/reset-password?token_hash=...&type=recovery`
7. أدخل كلمة المرور الجديدة
8. يجب أن يتم تحديث كلمة المرور بنجاح

### 2. الأخطاء الشائعة:

**المشكلة: البريد الإلكتروني لا يُرسل**
- ✅ تحقق من أن Email provider مفعّل في Authentication > Providers > Email
- ✅ تحقق من سجلات Supabase Auth في Dashboard > Logs > Auth
- ✅ تحقق من أن البريد الإلكتروني المدخل صحيح
- ✅ في التطوير، قد يكون هناك حد على عدد الرسائل (rate limit)
- ✅ للإنتاج، يُنصح بإعداد SMTP مخصص
- ✅ تحقق من مجلد Spam/Junk في البريد الإلكتروني

**خطأ: "Invalid or expired link"**
- تحقق من أن Redirect URL مضاف في Supabase Dashboard
- تحقق من أن الرابط لم ينتهِ صلاحيته (عادة ساعة واحدة)
- تحقق من أن `token_hash` موجود في URL

**خطأ: "Redirect URL not allowed"**
- تأكد من إضافة URL إلى Redirect URLs في Supabase Dashboard
- تأكد من أن URL يتطابق تماماً (بما في ذلك http/https)

**خطأ: "Rate limit exceeded"**
- انتظر بضع دقائق قبل المحاولة مرة أخرى
- Supabase يحد من عدد طلبات استعادة كلمة المرور لكل بريد إلكتروني

---

## معلومات إضافية
## Additional Information

### Project URL:
```
https://wtvvzthfpusnqztltkkv.supabase.co
```

### Redirect URLs المطلوبة:
- `http://localhost:5173/reset-password` (Development)
- `https://your-production-domain.com/reset-password` (Production)

### مدة صلاحية الرابط:
- الرابط صالح لمدة **1 ساعة** افتراضياً
- يمكن تغيير هذا في Supabase Dashboard > Authentication > Settings

---

## المراجع
## References

- [Supabase Auth Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase Password Reset](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail)
- [Supabase URL Configuration](https://supabase.com/docs/guides/auth/auth-deep-linking)

