# حل مشاكل تسجيل الدخول مع Supabase

**التاريخ:** 2025-01-16

---

## 🔍 المشكلة الحالية

عند محاولة تسجيل الدخول، يظهر الخطأ:
```
POST https://wtvvzthfpusnqztltkkv.supabase.co/auth/v1/token?grant_type=password 400 (Bad Request)
[Login] خطأ في تسجيل الدخول: {code: '400', message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'}
```

---

## ✅ التحقق من البيانات

### المستخدمون الموجودون في Supabase Auth:

| Email | Role | Status | Email Confirmed | User ID |
|-------|------|--------|-----------------|---------|
| `oooomar896@gmail.com` | admin | active | ✅ | `3dc0314b-edfe-4e52-ac96-741867e278a3` |
| `oooomar11223300@gmail.com` | admin | active | ✅ | `ea1852c3-be02-4b67-bcfb-a97ef5c18074` |
| `bacuratec2030@gmail.com` | investor | active | ✅ | `0847da8d-3160-41f9-9954-af139b8fcfc3` |

**الخلاصة:** جميع المستخدمين موجودون ومؤكدون في Supabase Auth.

---

## 🔐 الحلول الممكنة

### 1. إعادة تعيين كلمة المرور (الأفضل)

إذا كنت لا تعرف كلمة المرور الصحيحة:

#### الطريقة 1: استخدام Supabase Dashboard
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **Authentication** > **Users**
4. ابحث عن المستخدم
5. اضغط على **Edit** (أو الثلاث نقاط)
6. اختر **Reset Password**
7. سيتم إرسال رابط إعادة تعيين كلمة المرور إلى البريد الإلكتروني

#### الطريقة 2: استخدام Script المدمج (الأسهل) ⭐
```bash
# إعادة تعيين كلمة المرور للمستخدم
npm run reset-password -- --email bacuratec2030@gmail.com --password NewPassword123!
```

**مثال:**
```bash
# للمستخدم bacuratec2030@gmail.com
npm run reset-password -- --email bacuratec2030@gmail.com --password MyNewPassword123!

# للمستخدم oooomar896@gmail.com (admin)
npm run reset-password -- --email oooomar896@gmail.com --password AdminPassword123!
```

#### الطريقة 3: استخدام Supabase Admin API مباشرة
```typescript
// في backend script
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// إعادة تعيين كلمة المرور
await supabaseAdmin.auth.admin.updateUserById(
  '0847da8d-3160-41f9-9954-af139b8fcfc3', // User ID
  { password: 'NewPassword123!' }
);
```

#### الطريقة 3: استخدام Backend API
```bash
# إذا كان لديك endpoint لإعادة تعيين كلمة المرور
POST /api/v1/auth/reset-password-request
{
  "email": "bacuratec2030@gmail.com"
}
```

### 2. التحقق من كلمة المرور الحالية

إذا كنت تعتقد أنك تعرف كلمة المرور:

1. **تأكد من عدم وجود مسافات** في البداية أو النهاية
2. **تأكد من الحساسية لحالة الأحرف** (Case Sensitive)
3. **جرب كلمات المرور المحتملة:**
   - `000000` (للمستخدمين من seed script)
   - `Admin@123` (للمستخدمين من admin-login-testing.md)
   - كلمة المرور الأصلية التي تم إنشاء الحساب بها

### 3. إنشاء حساب جديد

إذا لم تكن بحاجة للحساب القديم:

```typescript
// استخدام seed script
cd backend
npm run seed:users
```

هذا سينشئ:
- `oooomar896@gmail.com` / `000000` (admin)
- `oooomar124466@gmail.com` / `000000` (investor)

---

## 🛠️ إصلاح المشكلة فوراً

### الحل السريع: إعادة تعيين كلمة المرور للمستخدم

```sql
-- في Supabase SQL Editor
-- استبدل USER_ID و NEW_PASSWORD بالقيم الصحيحة

-- للمستخدم bacuratec2030@gmail.com
-- User ID: 0847da8d-3160-41f9-9954-af139b8fcfc3
```

أو استخدام Supabase Admin API:

```typescript
// في backend/scripts/reset-password.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function resetPassword() {
  const userId = '0847da8d-3160-41f9-9954-af139b8fcfc3'; // bacuratec2030@gmail.com
  const newPassword = 'NewPassword123!';
  
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Password reset successfully!');
    console.log('New password:', newPassword);
  }
}

resetPassword();
```

---

## 📝 خطوات التحقق

### 1. التحقق من وجود المستخدم في Supabase Auth
```sql
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'bacuratec2030@gmail.com';
```

### 2. التحقق من وجود المستخدم في جدول users
```sql
SELECT id, email, role, status 
FROM users 
WHERE email = 'bacuratec2030@gmail.com';
```

### 3. اختبار تسجيل الدخول
- استخدم البريد الإلكتروني وكلمة المرور الجديدة
- تأكد من عدم وجود أخطاء في Console

---

## 🔒 حسابات Admin المتاحة

### الحسابات المؤكدة والعاملة:

1. **Email:** `oooomar896@gmail.com`
   - **Password:** `000000` (من seed script)
   - **Role:** `admin`
   - **Status:** `active`
   - **Email Confirmed:** ✅

2. **Email:** `oooomar11223300@gmail.com`
   - **Password:** `Admin@123` (من admin-login-testing.md)
   - **Role:** `admin`
   - **Status:** `active`
   - **Email Confirmed:** ✅

3. **Email:** `bacuratec2030@gmail.com`
   - **Password:** غير معروف (يحتاج إعادة تعيين)
   - **Role:** `investor`
   - **Status:** `active`
   - **Email Confirmed:** ✅

---

## 🚨 ملاحظات مهمة

1. **كلمات المرور حساسة لحالة الأحرف** - تأكد من كتابتها بشكل صحيح
2. **لا توجد مسافات** - تأكد من عدم وجود مسافات في البداية أو النهاية
3. **Email Confirmed** - جميع المستخدمين مؤكدون، لذا المشكلة ليست هنا
4. **RLS Policies** - قد تحتاج للتحقق من RLS policies إذا كان المستخدم موجوداً لكن لا يستطيع الوصول

---

## 📚 المراجع

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Admin API](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid)
- [إعادة بناء Login](./SUPABASE_AUTH_IMPLEMENTATION.md)

---

## ✅ الخلاصة

المشكلة: **كلمة المرور غير صحيحة**

الحل: **إعادة تعيين كلمة المرور** باستخدام أحد الطرق المذكورة أعلاه

البديل: **استخدام حساب admin موجود** (`oooomar896@gmail.com` / `000000`)

