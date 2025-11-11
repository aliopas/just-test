-- Investor signup requests queue
CREATE TABLE IF NOT EXISTS investor_signup_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  company TEXT,
  message TEXT,
  requested_role TEXT NOT NULL DEFAULT 'investor',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  approved_user_id UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_id UUID REFERENCES users(id),
  decision_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investor_signup_requests_status
  ON investor_signup_requests(status);

CREATE INDEX IF NOT EXISTS idx_investor_signup_requests_created_at
  ON investor_signup_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_investor_signup_requests_email
  ON investor_signup_requests((lower(email)));

COMMENT ON TABLE investor_signup_requests IS 'Queue of pending investor signup requests awaiting admin approval';
COMMENT ON COLUMN investor_signup_requests.payload IS 'Additional JSON payload supplied during signup request';

CREATE OR REPLACE FUNCTION set_investor_signup_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_investor_signup_requests_updated_at ON investor_signup_requests;

CREATE TRIGGER trg_investor_signup_requests_updated_at
  BEFORE UPDATE ON investor_signup_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_investor_signup_requests_updated_at();

