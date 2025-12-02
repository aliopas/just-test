# إصلاحات أمان الدوال في قاعدة البيانات
# Database Functions Security Fixes

## 📋 نظرة عامة
## Overview

تم إصلاح مشاكل الأمان في جميع الدوال في قاعدة البيانات، خاصة مشكلة `search_path` التي قد تسبب ثغرات أمنية.

All security issues in database functions have been fixed, especially the `search_path` issue that could cause security vulnerabilities.

---

## 🔧 الدوال التي تم إصلاحها
## Fixed Functions

### ✅ 1. `generate_request_number()`
**المشكلة:** لم يكن لديها `SET search_path` مما قد يسبب مشاكل أمنية
**Problem:** Missing `SET search_path` which could cause security issues

**الإصلاح:**
```sql
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
```

### ✅ 2. `assign_request_number()`
**المشكلة:** لم يكن لديها `SET search_path`
**Problem:** Missing `SET search_path`

**الإصلاح:**
```sql
CREATE OR REPLACE FUNCTION assign_request_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
```

### ✅ 3. `cleanup_expired_otps()`
**المشكلة:** لم يكن لديها `SET search_path`
**Problem:** Missing `SET search_path`

**الإصلاح:**
```sql
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
```

### ✅ 4. `update_investor_profiles_updated_at()`
**المشكلة:** لم يكن لديها `SET search_path`
**Problem:** Missing `SET search_path`

**الإصلاح:**
```sql
CREATE OR REPLACE FUNCTION update_investor_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
```

### ✅ 5. `set_updated_at_timestamp()`
**المشكلة:** لم يكن لديها `SET search_path`
**Problem:** Missing `SET search_path`

**الإصلاح:**
```sql
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
```

### ✅ 6. `set_investor_signup_requests_updated_at()`
**المشكلة:** لم يكن لديها `SET search_path`
**Problem:** Missing `SET search_path`

**الإصلاح:**
```sql
CREATE OR REPLACE FUNCTION set_investor_signup_requests_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
```

### ✅ 7. `update_updated_at_column()`
**الحالة:** كانت لديها `SET search_path` بالفعل، لكن تم التأكد من الإعدادات
**Status:** Already had `SET search_path`, but verified settings

**التحقق:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
```

### ✅ 8. `fn_user_has_permission()`
**الحالة:** كانت لديها `SET search_path` بالفعل
**Status:** Already had `SET search_path`

---

## 🔒 لماذا هذا مهم؟
## Why This Matters

### مشكلة `search_path`:
### The `search_path` Issue:

عندما لا يتم تعيين `search_path` في دالة، قد يتم استدعاء دوال أو جداول من schemas أخرى غير متوقعة، مما قد يسبب:
When `search_path` is not set in a function, it might call functions or tables from unexpected schemas, which could cause:

1. **ثغرات أمنية:** قد يتم استدعاء دوال ضارة من schemas أخرى
   **Security vulnerabilities:** Malicious functions from other schemas might be called

2. **سلوك غير متوقع:** قد يتم الوصول إلى جداول خاطئة
   **Unexpected behavior:** Wrong tables might be accessed

3. **مشاكل في الأداء:** قد يتم البحث في schemas غير ضرورية
   **Performance issues:** Unnecessary schema searches

### الحل:
### Solution:

بإضافة `SET search_path = public`، نضمن أن الدالة تبحث فقط في schema `public`، مما يمنع أي مشاكل أمنية أو سلوك غير متوقع.

By adding `SET search_path = public`, we ensure the function only searches in the `public` schema, preventing any security issues or unexpected behavior.

---

## 📝 Migration المطبق
## Applied Migration

**الملف:** `supabase/migrations/20250130000000_fix_functions_security.sql`
**File:** `supabase/migrations/20250130000000_fix_functions_security.sql`

**الحالة:** ✅ تم تطبيقه بنجاح
**Status:** ✅ Successfully applied

---

## ✅ التحقق من الإصلاحات
## Verify Fixes

يمكنك التحقق من أن الدوال تم إصلاحها باستخدام:

You can verify that functions are fixed using:

```sql
SELECT 
  p.proname as function_name,
  CASE 
    WHEN p.prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security_type,
  CASE 
    WHEN p.proconfig IS NULL OR array_length(p.proconfig, 1) IS NULL THEN 'NO search_path SET'
    ELSE array_to_string(p.proconfig, ', ')
  END as search_path_config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'generate_request_number',
    'assign_request_number',
    'update_updated_at_column',
    'cleanup_expired_otps',
    'update_investor_profiles_updated_at',
    'fn_user_has_permission',
    'set_updated_at_timestamp',
    'set_investor_signup_requests_updated_at'
  )
ORDER BY p.proname;
```

---

## ⚠️ ملاحظات
## Notes

### الدوال التي لا تزال تحتاج إصلاح:
### Functions that still need fixing:

هذه الدوال ليست في migrations، بل في Supabase Edge Functions أو في مكان آخر:
These functions are not in migrations, but in Supabase Edge Functions or elsewhere:

- `enqueue_email`
- `notify_status_change`
- `notify_comment_added`
- `handle_new_user`
- `auto_confirm_email`
- `reset_password_by_national_id`
- `update_conversation_last_message`

**ملاحظة:** هذه الدوال قد تكون في Supabase Dashboard أو في Edge Functions، وليست في migrations المحلية.
**Note:** These functions might be in Supabase Dashboard or Edge Functions, not in local migrations.

---

## 📚 المراجع
## References

- [PostgreSQL Function Security](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Supabase Function Security](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- [Migration File](../supabase/migrations/20250130000000_fix_functions_security.sql)

---

**آخر تحديث:** 2025-01-30
**Last Updated:** 2025-01-30

