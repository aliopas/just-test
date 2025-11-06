-- User OTPs Migration: user_otps table for OTP verification
-- Generated: 2024-11-06

-- user_otps
CREATE TABLE IF NOT EXISTS user_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_otps_user_id ON user_otps(user_id);
CREATE INDEX IF NOT EXISTS idx_user_otps_code ON user_otps(code);
CREATE INDEX IF NOT EXISTS idx_user_otps_expires_at ON user_otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_otps_verified ON user_otps(verified);

-- Function to clean up expired OTPs (optional, can be run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM user_otps
  WHERE expires_at < NOW() OR verified = TRUE;
END;
$$ LANGUAGE plpgsql;

