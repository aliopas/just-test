-- RLS Policies Migration: Row Level Security policies for RBAC
-- Generated: 2024-11-06

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update all users
CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Roles table policies
-- Everyone can read roles (for display purposes)
CREATE POLICY "Everyone can read roles"
  ON roles FOR SELECT
  USING (true);

-- Permissions table policies
-- Everyone can read permissions (for display purposes)
CREATE POLICY "Everyone can read permissions"
  ON permissions FOR SELECT
  USING (true);

-- Role permissions table policies
-- Everyone can read role permissions (for display purposes)
CREATE POLICY "Everyone can read role permissions"
  ON role_permissions FOR SELECT
  USING (true);

-- User roles table policies
-- Users can read their own roles
CREATE POLICY "Users can read own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all user roles
CREATE POLICY "Admins can read all user roles"
  ON user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Admins can manage user roles
CREATE POLICY "Admins can manage user roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

