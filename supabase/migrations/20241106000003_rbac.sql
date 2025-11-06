-- RBAC Migration: roles, permissions, role_permissions, user_roles
-- Generated: 2024-11-06

-- roles
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- permissions
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- role_permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- user_roles
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('investor', 'مستثمر - يمكنه إنشاء وإدارة طلبات الاستثمار'),
  ('admin', 'مدير - يمكنه إدارة النظام والمستخدمين')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, resource, action) VALUES
  -- Investor permissions
  ('investor:profile:read', 'profile', 'read'),
  ('investor:profile:update', 'profile', 'update'),
  ('investor:requests:create', 'requests', 'create'),
  ('investor:requests:read', 'requests', 'read'),
  ('investor:requests:update', 'requests', 'update'),
  ('investor:requests:delete', 'requests', 'delete'),
  -- Admin permissions
  ('admin:users:read', 'users', 'read'),
  ('admin:users:create', 'users', 'create'),
  ('admin:users:update', 'users', 'update'),
  ('admin:users:delete', 'users', 'delete'),
  ('admin:requests:read', 'requests', 'read'),
  ('admin:requests:update', 'requests', 'update'),
  ('admin:content:read', 'content', 'read'),
  ('admin:content:create', 'content', 'create'),
  ('admin:content:update', 'content', 'update'),
  ('admin:content:delete', 'content', 'delete')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
DO $$
DECLARE
  investor_role_id UUID;
  admin_role_id UUID;
  perm_ids RECORD;
BEGIN
  -- Get role IDs
  SELECT id INTO investor_role_id FROM roles WHERE name = 'investor';
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';

  -- Assign investor permissions
  FOR perm_ids IN SELECT id FROM permissions WHERE name LIKE 'investor:%' LOOP
    INSERT INTO role_permissions (role_id, permission_id)
    VALUES (investor_role_id, perm_ids.id)
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Assign admin permissions (all permissions)
  FOR perm_ids IN SELECT id FROM permissions LOOP
    INSERT INTO role_permissions (role_id, permission_id)
    VALUES (admin_role_id, perm_ids.id)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

