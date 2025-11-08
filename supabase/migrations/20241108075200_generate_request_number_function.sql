-- Regenerate request number helpers and trigger
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_request_number'
  ) THEN
    DROP TRIGGER set_request_number ON requests;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'assign_request_number'
  ) THEN
    DROP FUNCTION assign_request_number();
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'generate_request_number'
  ) THEN
    DROP FUNCTION generate_request_number();
  END IF;
END $$;

CREATE FUNCTION generate_request_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  seq BIGINT;
BEGIN
  SELECT nextval('request_number_seq') INTO seq;
  RETURN 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(seq::TEXT, 6, '0');
END;
$$;

CREATE FUNCTION assign_request_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.request_number IS NULL THEN
    NEW.request_number := generate_request_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_request_number
  BEFORE INSERT ON requests
  FOR EACH ROW
  EXECUTE FUNCTION assign_request_number();

COMMENT ON FUNCTION generate_request_number() IS 'Generates sequential request number like INV-2025-000123';
COMMENT ON FUNCTION assign_request_number() IS 'Trigger helper to assign request_number if missing';

