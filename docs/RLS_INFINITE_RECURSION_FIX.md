# إصلاح Infinite Recursion في RLS Policies

## المشكلة

كانت هناك أخطاء 500 عند محاولة جلب البيانات من Supabase:
- `GET /rest/v1/users` → 500 Internal Server Error
- `GET /rest/v1/requests` → 500 Internal Server Error

### السبب

**Infinite Recursion** في RLS policy لجدول `users`:
```
ERROR: infinite recursion detected in policy for relation "users"
```

Policy "Admins can read all users by role" كانت تحاول قراءة من جدول `users` للتحقق من role:
```sql
WHERE ((u.id = auth.uid()) AND ((u.role)::text = 'admin'::text))
```

لكن عند قراءة جدول `users`، يتم تشغيل RLS policy مرة أخرى، مما يسبب recursion لا نهائي.

---

## الحل

تم حذف policy المسببة للمشكلة:
- `DROP POLICY "Admins can read all users by role" ON users;`

Policy المتبقية تستخدم `fn_user_has_permission()` والتي لا تسبب recursion:
- `"Admins can read all users"` - يستخدم `fn_user_has_permission(auth.uid(), 'admin.users.manage')`
- `"Admins can update all users"` - يستخدم `fn_user_has_permission(auth.uid(), 'admin.users.manage')`

---

## التحقق

بعد الإصلاح:
1. ✅ لا توجد أخطاء recursion في logs
2. ✅ يمكن قراءة بيانات المستخدم
3. ✅ يمكن جلب requests

---

## Migration Applied

- `supabase/migrations/fix_users_rls_infinite_recursion.sql`

