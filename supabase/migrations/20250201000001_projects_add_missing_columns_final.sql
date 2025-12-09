-- Add missing columns to projects table
-- These columns are used by the frontend but were missing from the schema
-- IMPORTANT: Apply this migration to the correct Supabase project (wtvvzthfpusnqztltkkv)

-- Add contract_date column
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS contract_date DATE;

-- Add completion_percentage column (0-100)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100);

-- Add project_value column
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS project_value DECIMAL(15, 2) CHECK (project_value >= 0);

-- Add company_resource_id column (foreign key to company_resources)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS company_resource_id UUID REFERENCES company_resources(id) ON DELETE SET NULL;

-- Add cover_key column if it doesn't exist
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS cover_key TEXT;

-- Create index for company_resource_id for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_company_resource_id ON projects(company_resource_id);

-- Create index for contract_date for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_contract_date ON projects(contract_date);

-- Add comments to help PostgREST reload schema cache
COMMENT ON COLUMN projects.company_resource_id IS 'المورد المالي للشركة المرتبط بالمشروع';
COMMENT ON COLUMN projects.contract_date IS 'تاريخ العقد';
COMMENT ON COLUMN projects.completion_percentage IS 'نسبة الإنجاز (0-100)';
COMMENT ON COLUMN projects.project_value IS 'قيمة المشروع';
COMMENT ON COLUMN projects.cover_key IS 'مفتاح صورة الغلاف';

