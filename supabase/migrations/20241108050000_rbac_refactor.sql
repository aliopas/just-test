-- RBAC refactor to align with Story 2.1 requirements
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_grant_type') THEN
    CREATE TYPE permission_grant_type AS ENUM ('allow', 'deny');
  END IF;
END $$;

-- Roles adjustments
ALTER TABLE roles ADD COLUMN IF NOT EXISTS slug TEXT;
UPDATE roles SET slug = lower(name) WHERE slug IS NULL;
ALTER TABLE roles ALTER COLUMN slug SET NOT NULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'roles_slug_unique'
  ) THEN
    ALTER TABLE roles ADD CONSTRAINT roles_slug_unique UNIQUE (slug);
  END IF;
END $$;

ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_system BOOLEAN;
UPDATE roles SET is_system = true WHERE is_system IS NULL;
ALTER TABLE roles ALTER COLUMN is_system SET NOT NULL;
ALTER TABLE roles ALTER COLUMN is_system SET DEFAULT true;

ALTER TABLE roles ALTER COLUMN created_at SET DEFAULT NOW();
UPDATE roles SET created_at = NOW() WHERE created_at IS NULL;
ALTER TABLE roles ALTER COLUMN created_at SET NOT NULL;

-- Permissions adjustments
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS slug TEXT;
UPDATE permissions SET slug = replace(lower(name), ':', '.') WHERE slug IS NULL;
ALTER TABLE permissions ALTER COLUMN slug SET NOT NULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'permissions_slug_unique'
  ) THEN
    ALTER TABLE permissions ADD CONSTRAINT permissions_slug_unique UNIQUE (slug);
  END IF;
END $$;

ALTER TABLE permissions ADD COLUMN IF NOT EXISTS name TEXT;
UPDATE permissions SET name = initcap(replace(replace(slug, '.', ' '), '_', ' ')) WHERE name IS NULL;
ALTER TABLE permissions ALTER COLUMN name SET NOT NULL;

ALTER TABLE permissions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS category TEXT;
UPDATE permissions SET category = split_part(slug, '.', 1) WHERE category IS NULL;

ALTER TABLE permissions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE;
UPDATE permissions SET created_at = NOW() WHERE created_at IS NULL;
ALTER TABLE permissions ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE permissions ALTER COLUMN created_at SET DEFAULT NOW();

ALTER TABLE permissions DROP COLUMN IF EXISTS resource;
ALTER TABLE permissions DROP COLUMN IF EXISTS action;

-- Role permissions adjustments
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS grant_type permission_grant_type;
UPDATE role_permissions SET grant_type = 'allow' WHERE grant_type IS NULL;
ALTER TABLE role_permissions ALTER COLUMN grant_type SET DEFAULT 'allow';
ALTER TABLE role_permissions ALTER COLUMN grant_type SET NOT NULL;

-- User roles adjustments
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS assigned_by UUID;
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;
UPDATE user_roles SET assigned_at = COALESCE(assigned_at, created_at, NOW());
ALTER TABLE user_roles ALTER COLUMN assigned_at SET NOT NULL;
ALTER TABLE user_roles ALTER COLUMN assigned_at SET DEFAULT NOW();

ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_assigned_by_fkey;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES users(id);

ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);

-- Seed roles
INSERT INTO roles (slug, name, description, is_system)
VALUES
  ('investor', 'Investor', 'مستثمر - يمكنه إدارة ملفه وطلبات الاستثمار', true),
  ('admin', 'Admin', 'مدير النظام - صلاحيات كاملة لإدارة المستخدمين والطلبات', true)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_system = EXCLUDED.is_system;

-- Seed permissions
WITH perms AS (
  SELECT * FROM (VALUES
    ('investor.profile.read', 'قراءة الملف الشخصي', 'السماح للمستثمر بقراءة ملفه الشخصي', 'investor'),
    ('investor.profile.update', 'تحديث الملف الشخصي', 'السماح للمستثمر بتحديث ملفه الشخصي وبيانات KYC', 'investor'),
    ('investor.requests.create', 'إنشاء طلب', 'السماح للمستثمر بإنشاء طلب استثماري جديد', 'investor'),
    ('investor.requests.read', 'عرض الطلبات', 'السماح للمستثمر بقراءة طلباته الاستثمارية', 'investor'),
    ('investor.requests.update', 'تعديل الطلبات', 'السماح للمستثمر بتعديل الطلب قبل الإرسال', 'investor'),
    ('investor.requests.submit', 'إرسال الطلب', 'السماح للمستثمر بإرسال الطلب للمراجعة', 'investor'),
    ('investor.notifications.read', 'قراءة الإشعارات', 'السماح للمستثمر بعرض مركز الإشعارات', 'investor'),
    ('admin.users.manage', 'إدارة المستخدمين', 'السماح للأدمن بإدارة المستخدمين وأدوارهم وصلاحياتهم', 'admin'),
    ('admin.roles.manage', 'إدارة الأدوار', 'السماح للأدمن بإدارة الأدوار والصلاحيات', 'admin'),
    ('admin.audit.read', 'عرض سجل التدقيق', 'السماح للأدمن بمراجعة سجلات التدقيق', 'admin'),
    ('admin.requests.review', 'مراجعة الطلبات', 'السماح للأدمن بمراجعة ومعالجة طلبات الاستثمار', 'admin'),
    ('admin.content.manage', 'إدارة المحتوى', 'السماح للأدمن بإدارة المحتوى والأخبار', 'admin'),
    ('system.health.read', 'فحص صحة النظام', 'السماح للمراقبة بقراءة مؤشرات صحة الأنظمة الداخلية', 'system')
  ) AS t(slug, name, description, category)
)
INSERT INTO permissions (slug, name, description, category)
SELECT slug, name, description, category
FROM perms
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category;

-- Map permissions to roles
WITH role_map AS (
  SELECT r.id AS role_id, p.id AS permission_id, 'allow'::permission_grant_type AS grant_type
  FROM roles r
  JOIN permissions p ON (
    (r.slug = 'investor' AND p.slug IN (
      'investor.profile.read',
      'investor.profile.update',
      'investor.requests.create',
      'investor.requests.read',
      'investor.requests.update',
      'investor.requests.submit',
      'investor.notifications.read'
    ))
    OR (r.slug = 'admin')
  )
)
INSERT INTO role_permissions (role_id, permission_id, grant_type)
SELECT role_id, permission_id, grant_type
FROM role_map
ON CONFLICT (role_id, permission_id) DO UPDATE
SET grant_type = EXCLUDED.grant_type;

-- View aggregating user permissions
CREATE OR REPLACE VIEW v_user_permissions AS
SELECT
  ur.user_id,
  r.slug AS role_slug,
  p.slug AS permission_slug,
  p.category,
  rp.grant_type,
  ur.assigned_at,
  rp.role_id,
  rp.permission_id
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id
JOIN role_permissions rp ON rp.role_id = ur.role_id
JOIN permissions p ON p.id = rp.permission_id;

-- Helper function to verify permissions
CREATE OR REPLACE FUNCTION fn_user_has_permission(_user_id UUID, _permission_slug TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_deny BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM v_user_permissions
    WHERE user_id = _user_id
      AND permission_slug = _permission_slug
      AND grant_type = 'deny'
  ) INTO has_deny;

  IF has_deny THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM v_user_permissions
    WHERE user_id = _user_id
      AND permission_slug = _permission_slug
      AND grant_type = 'allow'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION fn_user_has_permission(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_user_has_permission(UUID, TEXT) TO anon;

-- Refresh RLS policies to use slug-based checks
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can read all user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;

CREATE POLICY "Users can read own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read user roles"
  ON user_roles FOR SELECT
  USING (
    fn_user_has_permission(auth.uid(), 'admin.users.manage')
  );

CREATE POLICY "Admins can manage user roles"
  ON user_roles FOR ALL
  USING (
    fn_user_has_permission(auth.uid(), 'admin.roles.manage')
  );

DROP POLICY IF EXISTS "Everyone can read role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Admins can read role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Admins can manage role permissions" ON role_permissions;

CREATE POLICY "Admins can read role permissions"
  ON role_permissions FOR SELECT
  USING (
    fn_user_has_permission(auth.uid(), 'admin.roles.manage')
  );

CREATE POLICY "Admins can manage role permissions"
  ON role_permissions FOR ALL
  USING (
    fn_user_has_permission(auth.uid(), 'admin.roles.manage')
  );

DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  USING (
    fn_user_has_permission(auth.uid(), 'admin.users.manage')
  );

CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  USING (
    fn_user_has_permission(auth.uid(), 'admin.users.manage')
  );

