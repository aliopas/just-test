-- Investor profiles schema for Story 2.2
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'investor_id_type') THEN
    CREATE TYPE investor_id_type AS ENUM ('national_id', 'iqama', 'passport', 'other');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'investor_kyc_status') THEN
    CREATE TYPE investor_kyc_status AS ENUM ('pending', 'in_review', 'approved', 'rejected');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'investor_language') THEN
    CREATE TYPE investor_language AS ENUM ('ar', 'en');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'investor_risk_profile') THEN
    CREATE TYPE investor_risk_profile AS ENUM ('conservative', 'balanced', 'aggressive');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS investor_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  preferred_name TEXT,
  id_type investor_id_type,
  id_number TEXT UNIQUE,
  id_expiry DATE,
  nationality CHAR(2),
  residency_country CHAR(2),
  city TEXT,
  kyc_status investor_kyc_status NOT NULL DEFAULT 'pending',
  kyc_updated_at TIMESTAMP WITH TIME ZONE,
  language investor_language NOT NULL DEFAULT 'ar',
  communication_preferences JSONB NOT NULL DEFAULT jsonb_build_object('email', true, 'sms', false, 'push', true),
  risk_profile investor_risk_profile,
  kyc_documents JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investor_profiles_user_id ON investor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_kyc_status ON investor_profiles(kyc_status);

CREATE OR REPLACE FUNCTION update_investor_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_investor_profiles_updated_at'
  ) THEN
    CREATE TRIGGER trg_investor_profiles_updated_at
      BEFORE UPDATE ON investor_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_investor_profiles_updated_at();
  END IF;
END $$;

CREATE OR REPLACE VIEW v_investor_profiles AS
SELECT
  ip.user_id,
  ip.full_name,
  ip.preferred_name,
  ip.id_type,
  ip.id_number,
  ip.id_expiry,
  ip.nationality,
  ip.residency_country,
  ip.city,
  ip.kyc_status,
  ip.kyc_updated_at,
  ip.language,
  ip.communication_preferences,
  ip.risk_profile,
  ip.kyc_documents,
  ip.created_at,
  ip.updated_at,
  u.email,
  u.phone,
  u.status AS user_status,
  u.created_at AS user_created_at
FROM investor_profiles ip
JOIN users u ON u.id = ip.user_id;

ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "investor_profile_read_own" ON investor_profiles;
DROP POLICY IF EXISTS "investor_profile_write_own" ON investor_profiles;
DROP POLICY IF EXISTS "investor_profile_admin_read" ON investor_profiles;
DROP POLICY IF EXISTS "investor_profile_admin_write" ON investor_profiles;

CREATE POLICY "investor_profile_read_own"
  ON investor_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "investor_profile_write_own"
  ON investor_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "investor_profile_admin_read"
  ON investor_profiles FOR SELECT
  USING (fn_user_has_permission(auth.uid(), 'admin.users.manage'));

CREATE POLICY "investor_profile_admin_write"
  ON investor_profiles FOR ALL
  USING (fn_user_has_permission(auth.uid(), 'admin.users.manage'))
  WITH CHECK (fn_user_has_permission(auth.uid(), 'admin.users.manage'));

