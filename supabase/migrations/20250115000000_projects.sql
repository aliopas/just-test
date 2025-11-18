-- Projects table for admin to manage investment projects
-- Each project has operating costs and annual benefits
-- Share price is fixed at 50,000 SAR per share

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  operating_costs DECIMAL(15, 2) NOT NULL CHECK (operating_costs >= 0),
  annual_benefits DECIMAL(15, 2) NOT NULL CHECK (annual_benefits >= 0),
  total_shares INTEGER NOT NULL CHECK (total_shares > 0),
  share_price DECIMAL(15, 2) NOT NULL DEFAULT 50000 CHECK (share_price > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can manage projects (check if user has admin role)
DROP POLICY IF EXISTS "Admins can manage projects" ON projects;
CREATE POLICY "Admins can manage projects"
  ON projects
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Public can read active projects (no auth required)
DROP POLICY IF EXISTS "Public can read active projects" ON projects;
CREATE POLICY "Public can read active projects"
  ON projects
  FOR SELECT
  USING (status = 'active');

-- Trigger for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

