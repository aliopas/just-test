-- Fix security issues in database functions
-- This migration fixes search_path issues and ensures proper security settings

-- Fix generate_request_number() - Add search_path for security
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seq BIGINT;
BEGIN
  SELECT nextval('request_number_seq') INTO seq;
  RETURN 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(seq::TEXT, 6, '0');
END;
$$;

COMMENT ON FUNCTION generate_request_number() IS 'Generates sequential request number like INV-2025-000123. Uses SECURITY DEFINER with fixed search_path for security.';

-- Fix assign_request_number() - Add search_path for security
CREATE OR REPLACE FUNCTION assign_request_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.request_number IS NULL THEN
    NEW.request_number := generate_request_number();
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION assign_request_number() IS 'Trigger helper to assign request_number if missing. Uses SECURITY DEFINER with fixed search_path for security.';

-- Fix cleanup_expired_otps() - Add search_path for security
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM user_otps
  WHERE expires_at < NOW() OR verified = TRUE;
END;
$$;

COMMENT ON FUNCTION cleanup_expired_otps() IS 'Cleans up expired and verified OTPs. Uses SECURITY DEFINER with fixed search_path for security.';

-- Fix update_investor_profiles_updated_at() - Add search_path for security
CREATE OR REPLACE FUNCTION update_investor_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_investor_profiles_updated_at() IS 'Updates updated_at timestamp for investor_profiles. Uses SECURITY DEFINER with fixed search_path for security.';

-- Fix set_updated_at_timestamp() - Add search_path for security
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION set_updated_at_timestamp() IS 'Updates updated_at timestamp for notification tables. Uses SECURITY DEFINER with fixed search_path for security.';

-- Fix set_investor_signup_requests_updated_at() - Add search_path for security
CREATE OR REPLACE FUNCTION set_investor_signup_requests_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION set_investor_signup_requests_updated_at() IS 'Updates updated_at timestamp for investor_signup_requests. Uses SECURITY DEFINER with fixed search_path for security.';

-- Ensure update_updated_at_column() has proper security settings
-- (It already has SECURITY DEFINER and search_path, but let's make sure)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_updated_at_column() IS 'Updates updated_at timestamp for various tables. Uses SECURITY DEFINER with fixed search_path for security.';

