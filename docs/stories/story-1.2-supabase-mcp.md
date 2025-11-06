# Story 1.2: إعداد قاعدة البيانات والهجرات عبر Supabase MCP

## Context
- Epic: Epic 1 - البنية الأساسية والمصادقة
- Goal: تهيئة Supabase وربطه بـ MCP، وإنشاء الهجرات الأولية والجداول الأساسية وفحصها.

## Scope
- ربط المشروع مع Supabase MCP Server
- إنشاء الهجرات الأولية (users, sessions, audit_logs)
- تنفيذ أوامر MCP (list_tables, execute_sql, apply_migration)
- إعداد بيانات أولية (seed) للاختبار

## Out of Scope
- تكامل واجهة المستخدم مع البيانات
- بناء Endpoints خارج ما يلزم للفحص

## Dependencies
- إتمام Story 1.1 (تهيئة المشروع والبيئة)
- توفر مفاتيح Supabase (URL, ANON, SERVICE_ROLE)

## Acceptance Criteria
1. ربط Supabase Project مع MCP Server بنجاح
2. تنفيذ أوامر MCP: `mcp_supabase_list_tables`, `mcp_supabase_execute_sql`, `mcp_supabase_apply_migration`
3. إنشاء هجرة أولية تتضمن جداول: `users`, `sessions`, `audit_logs`
4. التأكد من وجود الجداول باستخدام `mcp_supabase_list_tables`
5. إدراج بيانات seed مبدئية عبر `mcp_supabase_execute_sql` (مستخدم اختباري)
6. توثيق أوامر التشغيل في README (قسم Supabase)
7. جميع الاختبارات تمر بنجاح

## Tables (Initial)

### users
- id (UUID, PK, default gen_random_uuid())
- email (varchar, unique, not null)
- phone (varchar)
- phone_cc (varchar)
- role (varchar, default 'investor')
- status (varchar, default 'pending')
- mfa_enabled (boolean, default false)
- mfa_secret (varchar)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

### sessions
- id (UUID, PK, default gen_random_uuid())
- user_id (UUID, FK -> users.id on delete cascade)
- refresh_token (text, not null)
- ip_address (inet)
- user_agent (text)
- created_at (timestamptz, default now())
- expires_at (timestamptz)

### audit_logs
- id (UUID, PK, default gen_random_uuid())
- actor_id (UUID, FK -> users.id)
- action (varchar, not null)
- target_type (varchar)
- target_id (uuid)
- diff (jsonb)
- ip_address (inet)
- user_agent (text)
- created_at (timestamptz, default now())

## Migration SQL (apply via MCP)

```sql
-- users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  phone_cc VARCHAR(5),
  role VARCHAR(20) NOT NULL DEFAULT 'investor',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  diff JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
```

## Seed SQL (execute via MCP)

```sql
INSERT INTO users (email, phone, phone_cc, role, status)
VALUES ('seed@example.com', '555000111', '+966', 'investor', 'active')
ON CONFLICT (email) DO NOTHING;
```

## MCP Commands (Guidance)
- List tables:
  - Tool: `mcp_supabase_list_tables`
- Apply migration:
  - Tool: `mcp_supabase_apply_migration` (name: `20241106_initial_core`)
  - Query: (المحتوى أعلاه في قسم Migration SQL)
- Execute SQL:
  - Tool: `mcp_supabase_execute_sql` (seed أعلاه)

## Definition of Done
- تم تنفيذ الهجرة بدون أخطاء والجداول ظاهرة في `list_tables`
- تم إدراج سجل seed للمستخدم التجريبي
- تم توثيق خطوات MCP في README
- جميع الاختبارات المتعلقة بالاتصال بقاعدة البيانات تمر

## Test Cases (High-level)
- التحقق من وجود الجداول الثلاثة عبر `list_tables`
- تنفيذ `SELECT COUNT(*)` على `users` يعيد ≥ 1 بعد seed
- تحديث سجل مستخدم يتحرك `updated_at` تلقائياً
