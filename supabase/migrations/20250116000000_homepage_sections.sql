-- Homepage sections schema
-- Allows admin to manage content sections on the public landing page

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'homepage_section_type') THEN
    CREATE TYPE homepage_section_type AS ENUM (
      'company_profile',
      'business_model',
      'financial_resources',
      'company_strengths',
      'become_partner',
      'market_value',
      'company_goals'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type homepage_section_type NOT NULL UNIQUE,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  content_en TEXT NOT NULL,
  icon_svg TEXT, -- SVG content for the icon
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homepage_sections_type ON homepage_sections(type);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_display_order ON homepage_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_is_active ON homepage_sections(is_active);

ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Public can read active homepage sections" ON homepage_sections;
CREATE POLICY "Public can read active homepage sections"
  ON homepage_sections
  FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can read all homepage sections" ON homepage_sections;
CREATE POLICY "Admins can read all homepage sections"
  ON homepage_sections
  FOR SELECT
  USING (fn_user_has_permission(auth.uid(), 'admin.content.manage'));

DROP POLICY IF EXISTS "Admins can manage homepage sections" ON homepage_sections;
CREATE POLICY "Admins can manage homepage sections"
  ON homepage_sections
  USING (fn_user_has_permission(auth.uid(), 'admin.content.manage'))
  WITH CHECK (fn_user_has_permission(auth.uid(), 'admin.content.manage'));

-- Trigger for updated_at
CREATE TRIGGER update_homepage_sections_updated_at
  BEFORE UPDATE ON homepage_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default sections with placeholder content
INSERT INTO homepage_sections (type, title_ar, title_en, content_ar, content_en, display_order) VALUES
  ('company_profile', 'بروفايل تعريفي عن الشركة', 'Company Profile', 'محتوى البروفايل التعريفي عن الشركة وعملائها وشركائها', 'Company profile content about the company, clients, and partners', 1),
  ('business_model', 'نموذج العمل التجاري', 'Business Model', 'محتوى نموذج العمل التجاري للشركة', 'Company business model content', 2),
  ('financial_resources', 'الموارد المالية', 'Financial Resources', 'محتوى الموارد المالية للشركة', 'Company financial resources content', 3),
  ('company_strengths', 'نقاط قوة الشركة', 'Company Strengths', 'محتوى نقاط قوة الشركة', 'Company strengths content', 4),
  ('become_partner', 'كيف تكون شريك في باكورة', 'How to Become a Partner', 'محتوى كيفية أن تصبح شريكاً في باكورة', 'How to become a partner in Bakura content', 5),
  ('market_value', 'القيمة التسوقية المعتمدة', 'Approved Market Value', 'محتوى القيمة التسوقية المعتمدة للشركة', 'Company approved market value content', 6),
  ('company_goals', 'الأهداف العامة للشركة', 'Company Goals', 'محتوى الأهداف العامة للشركة', 'Company general goals content', 7)
ON CONFLICT (type) DO NOTHING;

