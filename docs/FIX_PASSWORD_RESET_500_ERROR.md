# حل خطأ 500 في إعادة تعيين كلمة المرور
# Fix Password Reset 500 Error

## المشكلة
## Problem

```
AuthApiError: Unable to process request
Failed to load resource: the server responded with a status of 500
```

---

## الحلول خطوة بخطوة
## Step-by-Step Solutions

### ✅ الحل 1: تم إصلاح redirectTo في الكود

تم تحديث `frontend/src/hooks/useResetPassword.ts`:
- ❌ كان: `redirectTo: ${window.location.origin}/login`
- ✅ أصبح: `redirectTo: ${window.location.origin}/reset-password`

**⚠️ مهم:** أعد تشغيل خادم التطوير بعد هذا التغيير.

---

### الحل 2: تفعيل Email Provider في Supabase

1. **اذهب إلى Supabase Dashboard:**
   - [Supabase Dashboard](https://app.supabase.com)
   - اختر مشروعك

2. **افتح إعدادات Authentication:**
   - من القائمة الجانبية: **Authentication** → **Providers**

3. **فعّل Email Provider:**
   - ابحث عن **Email** في قائمة Providers
   - تأكد من أن **Enabled** مفعّل ✓
   - إذا لم يكن مفعّلاً، فعّله واحفظ التغييرات

---

### الحل 3: إضافة Redirect URLs في Supabase

1. **اذهب إلى URL Configuration:**
   - **Authentication** → **URL Configuration**

2. **أضف Redirect URLs التالية:**
   ```
   http://localhost:5173/reset-password
   https://heartfelt-moxie-dfcdb4.netlify.app/reset-password
   ```

3. **تحقق من Site URL:**
   - **Site URL** يجب أن يكون: `http://localhost:5173` (للتطوير)
   - أو `https://heartfelt-moxie-dfcdb4.netlify.app` (للإنتاج)

4. **احفظ التغييرات**

---

### الحل 4: التحقق من SMTP Settings (للإنتاج)

للإنتاج، يُنصح بإعداد SMTP مخصص:

1. **اذهب إلى SMTP Settings:**
   - **Authentication** → **Settings** → **SMTP Settings**

2. **إعداد SMTP Provider:**
   - **Host**: smtp provider (مثل SendGrid, AWS SES, etc.)
   - **Port**: 587 (TLS) أو 465 (SSL)
   - **Username**: SMTP username
   - **Password**: SMTP password
   - **Sender email**: البريد الإلكتروني المرسل
   - **Sender name**: اسم المرسل

**ملاحظة:** في التطوير، Supabase يستخدم SMTP افتراضي (محدود).

---

### الحل 5: التحقق من Email Templates

1. **اذهب إلى Email Templates:**
   - **Authentication** → **Email Templates** → **Reset Password**

2. **تحقق من القالب:**
   - يجب أن يحتوي على `{{ .ConfirmationURL }}`
   - تأكد من أن **From** و **Reply-To** معرّفين

3. **احفظ التغييرات**

---

## خطوات التحقق
## Verification Steps

### 1. أعد تشغيل خادم التطوير

```bash
# أوقف الخادم (Ctrl + C)
# ثم:
cd frontend
npm run dev
```

### 2. اختبر Password Reset

1. افتح `http://localhost:5173/login`
2. انقر على "نسيت كلمة المرور؟"
3. أدخل بريد إلكتروني صحيح
4. اضغط "إرسال"

### 3. تحقق من النتيجة

**إذا نجح:**
- ✅ يجب أن ترى رسالة نجاح
- ✅ يجب أن تتلقى بريد إلكتروني من Supabase
- ✅ الرابط في البريد يجب أن يوجهك إلى `/reset-password`

**إذا فشل:**
- راجع Console للأخطاء
- راجع Supabase Dashboard → Logs → Auth
- تحقق من أن Email provider مفعّل

---

## الأخطاء الشائعة
## Common Errors

### خطأ: "Email provider is disabled"

**الحل:**
- اذهب إلى **Authentication** → **Providers** → **Email**
- فعّل **Enabled** واحفظ

### خطأ: "Redirect URL not allowed"

**الحل:**
- تأكد من إضافة `http://localhost:5173/reset-password` في Redirect URLs
- تأكد من التطابق التام (بما في ذلك http/https)

### خطأ: "Rate limit exceeded"

**الحل:**
- انتظر بضع دقائق قبل المحاولة مرة أخرى
- Supabase يحد من عدد طلبات استعادة كلمة المرور

### خطأ: "SMTP configuration error" (للإنتاج)

**الحل:**
- أعد إعداد SMTP settings
- تحقق من صحة بيانات SMTP provider
- تأكد من أن Port و Host صحيحة

---

## التحقق من Logs في Supabase

1. **اذهب إلى Logs:**
   - **Logs** → **Auth**

2. **ابحث عن:**
   - `password_reset` events
   - أي أخطاء مرتبطة بـ email sending

3. **راجع التفاصيل:**
   - تحقق من error messages
   - تحقق من status codes

---

## ملخص التحقق
## Checklist

- [ ] ✅ تم إصلاح `redirectTo` في `useResetPassword.ts`
- [ ] ✅ Email provider مفعّل في Supabase
- [ ] ✅ Redirect URLs مضاف في Supabase Dashboard
- [ ] ✅ Site URL معرّف بشكل صحيح
- [ ] ✅ Email template موجود ومضبوط
- [ ] ✅ تم إعادة تشغيل خادم التطوير
- [ ] ✅ تم اختبار Password Reset

---

## إذا استمرت المشكلة

1. **راجع Supabase Logs:**
   - **Logs** → **Auth** → ابحث عن أخطاء

2. **تحقق من Network Tab:**
   - افتح Developer Tools → Network
   - ابحث عن request إلى Supabase
   - راجع Response للتفاصيل

3. **راجع Console:**
   - افتح Developer Tools → Console
   - ابحث عن أخطاء JavaScript

4. **اتصل بالدعم:**
   - إذا كانت المشكلة مستمرة، راجع [Supabase Support](https://supabase.com/support)

---

## المراجع
## References

- [Supabase Password Reset](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)

