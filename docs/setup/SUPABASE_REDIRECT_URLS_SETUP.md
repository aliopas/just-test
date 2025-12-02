# إعداد Redirect URLs في Supabase
# Supabase Redirect URLs Setup

هذا الدليل يوضح كيفية إعداد Redirect URLs في Supabase Dashboard.
This guide explains how to set up Redirect URLs in Supabase Dashboard.

---

## المسار في Supabase Dashboard
## Path in Supabase Dashboard

**Authentication > URL Configuration**  
**المصادقة > إعدادات URL**

---

## Redirect URLs المطلوبة
## Required Redirect URLs

### للتطوير المحلي (Development)
### For Local Development

```
http://localhost:5173/auth/callback
http://localhost:5173/reset-password
```

### للإنتاج على Netlify (Production)
### For Production on Netlify

```
https://heartfelt-moxie-dfcdb4.netlify.app/auth/callback
https://heartfelt-moxie-dfcdb4.netlify.app/reset-password
```

**ملاحظة:** إذا كان لديك domain مخصص، استبدل `heartfelt-moxie-dfcdb4.netlify.app` برابطك الفعلي.

---

## خطوات الإعداد
## Setup Steps

### 1. فتح صفحة URL Configuration

1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. اختر مشروعك
3. من القائمة الجانبية، اضغط على **Authentication** (المصادقة)
4. اضغط على **URL Configuration** (إعدادات URL)

### 2. إضافة Redirect URLs

في قسم **Redirect URLs**:

1. **أضف كل URL في سطر منفصل:**
   ```
   http://localhost:5173/auth/callback
   http://localhost:5173/reset-password
   https://heartfelt-moxie-dfcdb4.netlify.app/auth/callback
   https://heartfelt-moxie-dfcdb4.netlify.app/reset-password
   ```

2. **أو أضفها واحدة تلو الأخرى:**
   - اضغط على **"Add URL"** (إضافة URL)
   - أدخل: `http://localhost:5173/auth/callback`
   - اضغط على **"Add URL"** مرة أخرى
   - أدخل: `http://localhost:5173/reset-password`
   - كرر العملية لروابط الإنتاج

3. **احفظ التغييرات:**
   - اضغط على **"Save"** (حفظ) في أسفل الصفحة

### 3. Site URL Configuration

في نفس الصفحة، تأكد من تعيين **Site URL**:

**للتطوير:**
```
http://localhost:5173
```

**للإنتاج:**
```
https://heartfelt-moxie-dfcdb4.netlify.app
```

**ملاحظة:** يمكنك تعيين Site URL للإنتاج، وستعمل Redirect URLs للتطوير والإنتاج معاً.

---

## استخدامات Redirect URLs
## Redirect URLs Usage

### `/auth/callback`
- يستخدم في OAuth authentication (Google, GitHub, etc.)
- يستخدم في email confirmation links
- يستخدم في magic link authentication

### `/reset-password`
- يستخدم في password reset emails
- يتم توجيه المستخدم إلى هذه الصفحة بعد النقر على رابط إعادة تعيين كلمة المرور

---

## التحقق من الإعداد
## Verifying the Setup

### 1. اختبار Password Reset

1. افتح `http://localhost:5173/login`
2. انقر على "نسيت كلمة المرور؟"
3. أدخل بريدك الإلكتروني
4. تحقق من البريد الإلكتروني
5. انقر على الرابط في البريد
6. يجب أن يتم توجيهك إلى `http://localhost:5173/reset-password?token_hash=...&type=recovery`

### 2. اختبار Email Confirmation

1. سجّل حساب جديد
2. تحقق من البريد الإلكتروني
3. انقر على رابط التأكيد
4. يجب أن يتم توجيهك إلى `http://localhost:5173/auth/callback?token=...&type=signup`

---

## الأخطاء الشائعة
## Common Errors

### خطأ: "Redirect URL not allowed"

**السبب:**
- URL غير مضاف في Redirect URLs
- URL غير متطابق تماماً (مثل: http vs https، أو وجود/عدم وجود trailing slash)

**الحل:**
1. تحقق من أن URL مضاف في Supabase Dashboard
2. تأكد من أن URL يتطابق تماماً (بما في ذلك http/https)
3. تأكد من عدم وجود مسافات إضافية

### خطأ: "Invalid or expired link"

**السبب:**
- الرابط منتهي الصلاحية (عادة ساعة واحدة)
- `token_hash` غير صحيح

**الحل:**
1. اطلب رابط جديد
2. تحقق من أن الرابط لم ينتهِ صلاحيته
3. تأكد من أن `token_hash` موجود في URL

---

## ملاحظات مهمة
## Important Notes

1. **Wildcards غير مدعومة:**
   - لا يمكنك استخدام `http://localhost:5173/*`
   - يجب إضافة كل URL بشكل منفصل

2. **http vs https:**
   - للتطوير المحلي: استخدم `http://`
   - للإنتاج: استخدم `https://`

3. **Port Numbers:**
   - للتطوير: `5173` (Vite default)
   - إذا كنت تستخدم port آخر، غيّر الرقم في URL

4. **Trailing Slashes:**
   - لا تضيف `/` في النهاية إلا إذا كان مطلوباً
   - مثال: `http://localhost:5173/auth/callback` (صحيح)
   - مثال: `http://localhost:5173/auth/callback/` (قد لا يعمل)

---

## قائمة كاملة بالـ Redirect URLs الموصى بها
## Complete List of Recommended Redirect URLs

```
# Development
http://localhost:5173/auth/callback
http://localhost:5173/reset-password
http://localhost:5173/verify

# Production (Netlify)
https://heartfelt-moxie-dfcdb4.netlify.app/auth/callback
https://heartfelt-moxie-dfcdb4.netlify.app/reset-password
https://heartfelt-moxie-dfcdb4.netlify.app/verify

# Production (Custom Domain - إذا كان لديك)
https://yourdomain.com/auth/callback
https://yourdomain.com/reset-password
https://yourdomain.com/verify
```

---

## المراجع
## References

- [Supabase Auth Deep Linking](https://supabase.com/docs/guides/auth/auth-deep-linking)
- [Supabase URL Configuration](https://supabase.com/docs/guides/auth/auth-redirects)
- [Supabase Password Reset](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail)

