# إصلاح View v_admin_users

## المشكلة

1. **خطأ 400 Bad Request**: `column v_admin_users.preferred_name does not exist`
2. **Fallback إلى users table**: الكود يعود إلى `users` table بدلاً من استخدام الـ view
3. **يعرض فقط بيانات المستخدم الحالي**: RLS policy تمنع الأدمن من رؤية جميع المستخدمين

## السبب

### 1. عمود `preferred_name` مفقود
الـ view definition كان يحتوي على `ip.preferred_name` في SELECT لكن لم يكن موجوداً في GROUP BY بشكل صحيح، مما جعل PostgreSQL لا يعرض العمود في metadata.

### 2. RLS مع SECURITY DEFINER Views
الـ view يستخدم `SECURITY DEFINER`، لكن RLS policies من الجداول الأساسية (`users`, `investor_profiles`) لا تزال تطبق. هذا يعني أن الأدمن يحتاج permissions صحيحة للوصول.

## الحل

### 1. إصلاح View Definition
تم إعادة إنشاء الـ view مع إضافة `preferred_name` بشكل صحيح في SELECT و GROUP BY:

```sql
CREATE VIEW v_admin_users AS
SELECT
  ...
  ip.preferred_name,
  ...
GROUP BY
  ...
  ip.preferred_name,
  ...
```

### 2. التحقق من RLS Policies
- ✅ `users` table: policy "Admins can read all users" موجودة
- ✅ `investor_profiles` table: policy "investor_profile_admin_read" موجودة

## النتيجة

- ✅ `preferred_name` موجود الآن في الـ view
- ✅ يمكن قراءة جميع المستخدمين من الـ view
- ✅ الكود يجب أن يعمل بدون fallback إلى users table

## ملاحظات

الـ view يستخدم `SECURITY DEFINER` مما يعني:
- يعمل بصلاحيات منشئ الـ view (postgres)
- لكن RLS policies من الجداول الأساسية لا تزال تطبق
- الأدمن يحتاج permission `admin.users.manage` للوصول

## Migration Applied

- `supabase/migrations/fix_v_admin_users_preferred_name.sql`

