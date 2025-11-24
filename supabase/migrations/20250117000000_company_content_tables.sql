-- Epic 9: Company Content Tables Migration
-- Story 9.1: إنشاء جداول المحتوى العام
-- Generated: 2025-01-17

-- ============================================================================
-- Table 1: company_profile
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  content_en TEXT NOT NULL,
  icon_key TEXT, -- Reference to Supabase Storage bucket
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_profile_display_order ON company_profile(display_order);
CREATE INDEX IF NOT EXISTS idx_company_profile_is_active ON company_profile(is_active);

-- ============================================================================
-- Table 2: company_partners
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  logo_key TEXT, -- Reference to Supabase Storage bucket
  description_ar TEXT,
  description_en TEXT,
  website_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_partners_display_order ON company_partners(display_order);

-- ============================================================================
-- Table 3: company_clients
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  logo_key TEXT, -- Reference to Supabase Storage bucket
  description_ar TEXT,
  description_en TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_clients_display_order ON company_clients(display_order);

-- ============================================================================
-- Table 4: company_resources
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  icon_key TEXT, -- Reference to Supabase Storage bucket
  value NUMERIC, -- Financial value
  currency VARCHAR(3) DEFAULT 'SAR', -- ISO currency code
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_resources_display_order ON company_resources(display_order);

-- ============================================================================
-- Table 5: company_strengths
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_strengths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  icon_key TEXT, -- Reference to Supabase Storage bucket
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_strengths_display_order ON company_strengths(display_order);

-- ============================================================================
-- Table 6: partnership_info
-- ============================================================================
CREATE TABLE IF NOT EXISTS partnership_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  content_en TEXT NOT NULL,
  steps_ar JSONB, -- Array of steps in Arabic
  steps_en JSONB, -- Array of steps in English
  icon_key TEXT, -- Reference to Supabase Storage bucket
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partnership_info_display_order ON partnership_info(display_order);

-- ============================================================================
-- Table 7: market_value
-- ============================================================================
CREATE TABLE IF NOT EXISTS market_value (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value NUMERIC NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'SAR', -- ISO currency code
  valuation_date DATE NOT NULL,
  source TEXT, -- Source/authority of the valuation
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_value_valuation_date ON market_value(valuation_date DESC);
CREATE INDEX IF NOT EXISTS idx_market_value_is_verified ON market_value(is_verified);

-- ============================================================================
-- Table 8: company_goals
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  target_date DATE,
  icon_key TEXT, -- Reference to Supabase Storage bucket
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_goals_display_order ON company_goals(display_order);
CREATE INDEX IF NOT EXISTS idx_company_goals_target_date ON company_goals(target_date);

-- ============================================================================
-- Triggers for updated_at
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_company_profile_updated_at'
  ) THEN
    CREATE TRIGGER update_company_profile_updated_at
      BEFORE UPDATE ON company_profile
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_company_partners_updated_at'
  ) THEN
    CREATE TRIGGER update_company_partners_updated_at
      BEFORE UPDATE ON company_partners
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_company_clients_updated_at'
  ) THEN
    CREATE TRIGGER update_company_clients_updated_at
      BEFORE UPDATE ON company_clients
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_company_resources_updated_at'
  ) THEN
    CREATE TRIGGER update_company_resources_updated_at
      BEFORE UPDATE ON company_resources
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_company_strengths_updated_at'
  ) THEN
    CREATE TRIGGER update_company_strengths_updated_at
      BEFORE UPDATE ON company_strengths
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_partnership_info_updated_at'
  ) THEN
    CREATE TRIGGER update_partnership_info_updated_at
      BEFORE UPDATE ON partnership_info
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_market_value_updated_at'
  ) THEN
    CREATE TRIGGER update_market_value_updated_at
      BEFORE UPDATE ON market_value
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_company_goals_updated_at'
  ) THEN
    CREATE TRIGGER update_company_goals_updated_at
      BEFORE UPDATE ON company_goals
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================================
-- RLS Policies: Public read, Admin write
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_strengths ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_value ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_goals ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- company_profile RLS Policies
-- Note: RLS policies will be added in a separate migration after RBAC is set up
-- For now, we'll use service role for all operations
-- ============================================================================
DROP POLICY IF EXISTS "Public can read active company profile" ON company_profile;
CREATE POLICY "Public can read active company profile"
  ON company_profile FOR SELECT
  USING (is_active = TRUE);

-- ============================================================================
-- company_partners RLS Policies
-- ============================================================================
DROP POLICY IF EXISTS "Public can read company partners" ON company_partners;
CREATE POLICY "Public can read company partners"
  ON company_partners FOR SELECT
  USING (true);

-- ============================================================================
-- company_clients RLS Policies
-- ============================================================================
DROP POLICY IF EXISTS "Public can read company clients" ON company_clients;
CREATE POLICY "Public can read company clients"
  ON company_clients FOR SELECT
  USING (true);

-- ============================================================================
-- company_resources RLS Policies
-- ============================================================================
DROP POLICY IF EXISTS "Public can read company resources" ON company_resources;
CREATE POLICY "Public can read company resources"
  ON company_resources FOR SELECT
  USING (true);

-- ============================================================================
-- company_strengths RLS Policies
-- ============================================================================
DROP POLICY IF EXISTS "Public can read company strengths" ON company_strengths;
CREATE POLICY "Public can read company strengths"
  ON company_strengths FOR SELECT
  USING (true);

-- ============================================================================
-- partnership_info RLS Policies
-- ============================================================================
DROP POLICY IF EXISTS "Public can read partnership info" ON partnership_info;
CREATE POLICY "Public can read partnership info"
  ON partnership_info FOR SELECT
  USING (true);

-- ============================================================================
-- market_value RLS Policies
-- ============================================================================
DROP POLICY IF EXISTS "Public can read verified market value" ON market_value;
CREATE POLICY "Public can read verified market value"
  ON market_value FOR SELECT
  USING (is_verified = TRUE);

-- ============================================================================
-- company_goals RLS Policies
-- ============================================================================
DROP POLICY IF EXISTS "Public can read company goals" ON company_goals;
CREATE POLICY "Public can read company goals"
  ON company_goals FOR SELECT
  USING (true);

