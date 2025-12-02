# حل مشكلة عدم إرسال بريد استعادة كلمة المرور
# Troubleshooting Password Reset Email Not Sending

## المشكلة
البريد الإلكتروني لاستعادة كلمة المرور لا يُرسل عند طلب استعادة كلمة المرور.

## الحلول خطوة بخطوة

### 1. التحقق من تفعيل Email Provider

**في Supabase Dashboard:**
1. اذهب إلى **Authentication > Providers**
2. تأكد من أن **Email** provider مفعّل (Enabled)
3. إذا لم يكن مفعلاً، فعّله واحفظ التغييرات

### 2. التحقق من سجلات Supabase

**في Supabase Dashboard:**
1. اذهب إلى **Logs > Auth**
2. ابحث عن محاولات استعادة كلمة المرور
3. تحقق من وجود أخطاء في السجلات

**الأخطاء الشائعة:**
- `Email rate limit exceeded` - تم تجاوز الحد المسموح
- `SMTP configuration error` - مشكلة في إعدادات SMTP
- `Email template not found` - قالب البريد غير موجود

### 3. التحقق من إعدادات SMTP

**للإنتاج (Production):**

في Supabase Dashboard:
1. اذهب إلى **Authentication > Settings > SMTP Settings**
2. تأكد من إعداد SMTP مخصص:
   - **Host**: smtp provider (مثل smtp.sendgrid.net)
   - **Port**: 587 (TLS) أو 465 (SSL)
   - **Username**: SMTP username
   - **Password**: SMTP password
   - **Sender email**: البريد الإلكتروني المرسل
   - **Sender name**: اسم المرسل

**للتطوير (Development):**

Supabase يستخدم SMTP افتراضي، لكن:
- قد يكون هناك حد على عدد الرسائل (rate limit)
- الرسائل قد تذهب إلى مجلد Spam
- قد تحتاج إلى التحقق من البريد في Supabase Dashboard

### 4. التحقق من Email Template

**في Supabase Dashboard:**
1. اذهب إلى **Authentication > Email Templates**
2. اختر **Reset Password**
3. تأكد من:
   - وجود قالب (template) محدد
   - تعيين **From** address
   - تعيين **Reply-To** address (اختياري)
   - استخدام `{{ .ConfirmationURL }}` في القالب

### 5. التحقق من Redirect URLs

**في Supabase Dashboard:**
1. اذهب إلى **Authentication > URL Configuration**
2. تأكد من إضافة:
   - `http://localhost:5173/reset-password` (للتطوير)
   - `https://your-domain.com/reset-password` (للإنتاج)

### 6. التحقق من الكود

**في الكود:**
- تأكد من أن `useResetPassword` يستدعي `supabase.auth.resetPasswordForEmail()` بشكل صحيح
- تحقق من console للأخطاء
- تأكد من أن البريد الإلكتروني المدخل صحيح

### 7. اختبار يدوي

**استخدم Supabase Dashboard:**
1. اذهب إلى **Authentication > Users**
2. اختر مستخدم
3. انقر على **Send password reset email**
4. تحقق من إرسال البريد

---

## حلول إضافية

### إذا كان البريد يذهب إلى Spam:

1. تحقق من مجلد Spam/Junk في البريد الإلكتروني
2. أضف عنوان Supabase إلى قائمة المرسلين الموثوقين
3. للإنتاج، استخدم SMTP مخصص مع domain verification

### إذا كان هناك Rate Limit:

1. انتظر بضع دقائق قبل المحاولة مرة أخرى
2. Supabase يحد من عدد طلبات استعادة كلمة المرور
3. الحد الافتراضي: 3 طلبات لكل ساعة لكل بريد إلكتروني

### إذا كان البريد لا يُرسل في التطوير:

1. استخدم بريد إلكتروني حقيقي (ليس fake email)
2. تحقق من سجلات Supabase Auth
3. جرب استخدام SMTP مخصص حتى في التطوير

---

## التحقق من الإعدادات باستخدام MCP

يمكنك استخدام MCP للتحقق من:
- سجلات Auth: `mcp_supabase_get_logs(service: "auth")`
- إعدادات المشروع: `mcp_supabase_get_project_url()`

---

## الخطوات التالية

إذا استمرت المشكلة:

1. تحقق من سجلات Supabase Auth
2. تحقق من إعدادات SMTP
3. جرب إرسال بريد يدوياً من Supabase Dashboard
4. تحقق من أن البريد الإلكتروني المستخدم موجود في قاعدة البيانات
5. راجع [Supabase Auth Documentation](https://supabase.com/docs/guides/auth/auth-email-templates)

---

## معلومات مفيدة

### Project URL:
```
https://wtvvzthfpusnqztltkkv.supabase.co
```

### Rate Limits:
- Password reset requests: 3 per hour per email
- يمكن تغيير هذا في Supabase Dashboard > Authentication > Settings

### Email Provider Status:
- تحقق من Authentication > Providers > Email
- يجب أن يكون Status: **Enabled**

