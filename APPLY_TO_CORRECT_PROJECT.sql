-- ============================================
-- IMPORTANT: Apply this to project: wtvvzthfpusnqztltkkv
-- ============================================
-- Copy this file content and run it in Supabase Dashboard SQL Editor
-- for the project: wtvvzthfpusnqztltkkv.supabase.co

-- Step 1: Add missing columns
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS contract_date DATE;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100);

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS project_value DECIMAL(15, 2) CHECK (project_value >= 0);

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS company_resource_id UUID REFERENCES company_resources(id) ON DELETE SET NULL;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS cover_key TEXT;

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_company_resource_id ON projects(company_resource_id);
CREATE INDEX IF NOT EXISTS idx_projects_contract_date ON projects(contract_date);

-- Step 3: Add comments to trigger schema cache reload
COMMENT ON COLUMN projects.company_resource_id IS 'المورد المالي للشركة المرتبط بالمشروع';
COMMENT ON COLUMN projects.contract_date IS 'تاريخ العقد';
COMMENT ON COLUMN projects.completion_percentage IS 'نسبة الإنجاز (0-100)';
COMMENT ON COLUMN projects.project_value IS 'قيمة المشروع';
COMMENT ON COLUMN projects.cover_key IS 'مفتاح صورة الغلاف';

-- Step 4: Insert 5 test projects
INSERT INTO projects (
  name,
  name_ar,
  description,
  description_ar,
  operating_costs,
  annual_benefits,
  total_shares,
  share_price,
  status,
  contract_date,
  completion_percentage,
  project_value,
  company_resource_id,
  cover_key,
  created_by
) VALUES 
(
  'Smart City Development',
  'تطوير المدينة الذكية',
  'A comprehensive smart city project focusing on IoT infrastructure and sustainable urban development.',
  'مشروع شامل للمدينة الذكية يركز على البنية التحتية للإنترنت الأشياء والتنمية الحضرية المستدامة.',
  50000000,
  12000000,
  2000,
  50000,
  'active',
  '2024-01-15',
  75,
  100000000,
  NULL,
  NULL,
  (SELECT id FROM users WHERE role IN ('admin', 'super_admin') LIMIT 1)
),
(
  'Renewable Energy Park',
  'حديقة الطاقة المتجددة',
  'Large-scale solar and wind energy park generating clean electricity for the region.',
  'حديقة طاقة شمسية ورياح واسعة النطاق لتوليد الكهرباء النظيفة للمنطقة.',
  80000000,
  20000000,
  3000,
  50000,
  'active',
  '2024-03-20',
  60,
  150000000,
  NULL,
  NULL,
  (SELECT id FROM users WHERE role IN ('admin', 'super_admin') LIMIT 1)
),
(
  'Logistics Hub Expansion',
  'توسعة مركز الخدمات اللوجستية',
  'Expansion of logistics and distribution center to serve the growing e-commerce market.',
  'توسعة مركز الخدمات اللوجستية والتوزيع لخدمة سوق التجارة الإلكترونية المتنامي.',
  35000000,
  8500000,
  1500,
  50000,
  'active',
  '2024-05-10',
  45,
  70000000,
  NULL,
  NULL,
  (SELECT id FROM users WHERE role IN ('admin', 'super_admin') LIMIT 1)
),
(
  'Healthcare Technology Center',
  'مركز تقنيات الرعاية الصحية',
  'Advanced healthcare technology center providing telemedicine and AI-powered diagnostics.',
  'مركز تقنيات رعاية صحية متقدم يوفر الطب عن بُعد والتشخيص المدعوم بالذكاء الاصطناعي.',
  60000000,
  15000000,
  2500,
  50000,
  'active',
  '2024-07-01',
  30,
  120000000,
  NULL,
  NULL,
  (SELECT id FROM users WHERE role IN ('admin', 'super_admin') LIMIT 1)
),
(
  'Tourism Development Project',
  'مشروع تطوير السياحة',
  'Luxury resort and entertainment complex to boost regional tourism.',
  'مجمع منتجع وترفيه فاخر لتعزيز السياحة الإقليمية.',
  45000000,
  11000000,
  1800,
  50000,
  'active',
  '2024-09-15',
  25,
  90000000,
  NULL,
  NULL,
  (SELECT id FROM users WHERE role IN ('admin', 'super_admin') LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- Step 5: Verify projects were created
SELECT 
  COUNT(*) as total_projects,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects
FROM projects;

