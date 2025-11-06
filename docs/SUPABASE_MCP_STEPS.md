# Supabase MCP Execution Guide (Story 1.2)

## 1) Create and link Supabase Project
- من لوحة Supabase أنشئ مشروعاً جديداً
- احصل على `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- أضفها إلى `.env`

## 2) تطبيق الهجرات عبر MCP

### الهجرة 1: النواة الأساسية
- الملف: `supabase/migrations/20241106000000_initial_core.sql`
- الأمر (MCP):
```
# Apply migration
mcp_supabase_apply_migration(name="20241106000000_initial_core", query=FILE_CONTENTS)
```

### الهجرة 2: نواة العمل
- الملف: `supabase/migrations/20241106000001_business_core.sql`
- الأمر (MCP):
```
# Apply migration
mcp_supabase_apply_migration(name="20241106000001_business_core", query=FILE_CONTENTS)
```

## 3) التحقق من الجداول
```
mcp_supabase_list_tables()
```
تأكد من وجود: `users`, `sessions`, `audit_logs`, `requests`, `request_events`, `attachments`

## 4) إدراج بيانات Seed
- الملف: `supabase/SEED.sql`
- الأمر (MCP):
```
mcp_supabase_execute_sql(query=FILE_CONTENTS)
```

## 5) استكشاف الأخطاء
- راجع `mcp_supabase_get_logs(service="postgres")`
- أعد تشغيل الأوامر عند الحاجة

---

ملاحظة: يمكنك استخدام CLI لـ Supabase محلياً كبديل:
```
supabase db push
supabase db reset --seed
```
