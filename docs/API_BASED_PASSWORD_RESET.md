# إعادة تعيين كلمة المرور عبر API
# API-Based Password Reset

## ✅ ما تم تطبيقه
## What Was Implemented

تم تحويل صفحة إعادة تعيين كلمة المرور لاستخدام API بدلاً من Supabase مباشرة.

---

## 🔧 API Endpoints الجديدة
## New API Endpoints

### 1. طلب رابط إعادة تعيين كلمة المرور
### Request Password Reset Link

**Endpoint:** `POST /api/v1/auth/reset-password-request`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

**Error Responses:**
- `429 RATE_LIMIT_EXCEEDED` - Too many requests
- `500 INTERNAL_ERROR` - Server error

---

### 2. التحقق من رابط إعادة التعيين
### Verify Reset Token

**Endpoint:** `POST /api/v1/auth/verify-reset-token`

**Request Body:**
```json
{
  "token_hash": "token_hash_from_url",
  "email": "user@example.com" // optional
}
```

**Response (200):**
```json
{
  "verified": true,
  "session": {
    "access_token": "...",
    "refresh_token": "..."
  },
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `400 INVALID_OR_EXPIRED_TOKEN` - Invalid or expired token
- `500 INTERNAL_ERROR` - Server error

---

### 3. تحديث كلمة المرور
### Update Password

**Endpoint:** `POST /api/v1/auth/update-password`

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "password": "NewPassword123"
}
```

**Response (200):**
```json
{
  "updated": true,
  "message": "Password updated successfully"
}
```

**Error Responses:**
- `401 UNAUTHORIZED` - Authentication required
- `400 PASSWORD_UPDATE_FAILED` - Failed to update password
- `500 INTERNAL_ERROR` - Server error

---

## 📁 الملفات الجديدة
## New Files

### Backend:

1. **`backend/src/schemas/auth.schema.ts`** (تم التحديث):
   - `resetPasswordRequestSchema`
   - `verifyResetTokenSchema`
   - `updatePasswordSchema`

2. **`backend/src/controllers/auth.controller.ts`** (تم التحديث):
   - `resetPasswordRequest` - يرسل رابط إعادة التعيين
   - `verifyResetToken` - يتحقق من الرابط
   - `updatePassword` - يحدث كلمة المرور

3. **`backend/src/routes/auth.routes.ts`** (تم التحديث):
   - `POST /auth/reset-password-request`
   - `POST /auth/verify-reset-token`
   - `POST /auth/update-password`

### Frontend:

1. **`frontend/src/hooks/useResetPasswordRequest.ts`** (جديد):
   - Hook لطلب رابط إعادة التعيين عبر API

2. **`frontend/src/hooks/useVerifyResetToken.ts`** (جديد):
   - Hook للتحقق من الرابط عبر API

3. **`frontend/src/hooks/useUpdatePasswordViaAPI.ts`** (جديد):
   - Hook لتحديث كلمة المرور عبر API

4. **`frontend/src/pages/ResetPasswordPage.tsx`** (تم التحديث):
   - يستخدم API بدلاً من Supabase مباشرة

5. **`frontend/src/pages/LoginPage.tsx`** (تم التحديث):
   - يستخدم API لطلب رابط إعادة التعيين

---

## 🔄 كيف يعمل الآن
## How It Works Now

### 1. طلب رابط إعادة التعيين:

**من LoginPage:**
```typescript
const resetPasswordMutation = useResetPasswordRequest();
await resetPasswordMutation.mutateAsync(email);
```

**من ResetPasswordPage (عند انتهاء الصلاحية):**
```typescript
await resetPasswordMutation.mutateAsync(expiredEmail);
```

### 2. التحقق من الرابط:

**عند فتح رابط إعادة التعيين:**
```typescript
const verifyTokenMutation = useVerifyResetToken();
const result = await verifyTokenMutation.mutateAsync({
  token_hash: tokenHash,
  email: email,
});
```

### 3. تحديث كلمة المرور:

**بعد التحقق من الرابط:**
```typescript
const updatePasswordMutation = useUpdatePasswordViaAPI();
await updatePasswordMutation.mutateAsync(newPassword);
```

---

## ✅ المزايا
## Benefits

1. **مركزية المنطق:**
   - كل المنطق في Backend
   - Frontend فقط يستدعي API

2. **أمان أفضل:**
   - Supabase credentials في Backend فقط
   - Frontend لا يحتاج إلى Supabase client مباشرة

3. **سهولة الصيانة:**
   - تغييرات في Backend فقط
   - Frontend لا يحتاج تحديثات

4. **معالجة أخطاء أفضل:**
   - رسائل خطأ موحدة من API
   - معالجة أفضل للأخطاء

---

## 🔍 التحقق من النجاح
## Verify Success

### 1. اختبار طلب رابط جديد:

1. افتح صفحة Login
2. انقر على "نسيت كلمة المرور؟"
3. أدخل بريد إلكتروني
4. يجب أن ترى رسالة نجاح

### 2. اختبار التحقق من الرابط:

1. افتح رابط إعادة التعيين من البريد
2. يجب أن يتم التحقق تلقائياً
3. يجب أن تظهر صفحة إدخال كلمة المرور الجديدة

### 3. اختبار تحديث كلمة المرور:

1. أدخل كلمة المرور الجديدة
2. اضغط "تحديث كلمة المرور"
3. يجب أن ترى رسالة نجاح
4. يجب أن يتم توجيهك إلى صفحة تسجيل الدخول

---

## 📝 ملاحظات مهمة
## Important Notes

1. **Authentication للـ update-password:**
   - Endpoint `/auth/update-password` يتطلب authentication
   - Session يتم تعيينه بعد التحقق من الرابط
   - يجب أن يكون المستخدم مسجلاً دخولاً

2. **Session Management:**
   - بعد التحقق من الرابط، يتم تعيين session في Supabase client
   - هذا يسمح بتحديث كلمة المرور

3. **Error Handling:**
   - جميع الأخطاء يتم معالجتها بشكل موحد
   - رسائل خطأ واضحة للمستخدم

---

## 🆘 استكشاف الأخطاء
## Troubleshooting

### إذا فشل التحقق من الرابط:

1. **تحقق من Backend Logs:**
   - راجع logs في Backend
   - تحقق من أن Supabase credentials صحيحة

2. **تحقق من Network Tab:**
   - افتح Developer Tools → Network
   - ابحث عن request إلى `/auth/verify-reset-token`
   - راجع Response للتفاصيل

### إذا فشل تحديث كلمة المرور:

1. **تحقق من Authentication:**
   - تأكد من أن session موجود
   - تحقق من أن access_token صحيح

2. **تحقق من Backend Logs:**
   - راجع logs في Backend
   - تحقق من أخطاء Supabase

---

## 📚 المراجع
## References

- [Supabase Password Reset](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail)
- [Supabase Verify OTP](https://supabase.com/docs/reference/javascript/auth-verifyotp)
- [Supabase Update User](https://supabase.com/docs/reference/javascript/auth-updateuser)

