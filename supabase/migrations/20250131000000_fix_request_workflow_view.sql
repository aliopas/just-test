-- Fix v_request_workflow view and add proper permissions
-- This ensures the view exists and is accessible to authenticated users

-- Drop view if exists to recreate it
DROP VIEW IF EXISTS v_request_workflow CASCADE;

-- Create the view
CREATE OR REPLACE VIEW v_request_workflow AS
SELECT
  r.id,
  r.request_number,
  r.user_id,
  r.type,
  r.amount,
  r.currency,
  r.target_price,
  r.expiry_at,
  r.status,
  r.created_at,
  r.updated_at,
  COALESCE(
    (
      SELECT jsonb_build_object(
        'id', ev.id,
        'from_status', ev.from_status,
        'to_status', ev.to_status,
        'actor_id', ev.actor_id,
        'note', ev.note,
        'created_at', ev.created_at
      )
      FROM request_events ev
      WHERE ev.request_id = r.id
      ORDER BY ev.created_at DESC
      LIMIT 1
    ),
    jsonb_build_object(
      'id', NULL,
      'from_status', NULL,
      'to_status', r.status,
      'actor_id', NULL,
      'note', NULL,
      'created_at', r.created_at
    )
  ) AS last_event
FROM requests r;

COMMENT ON VIEW v_request_workflow IS 'Latest status/event snapshot per request for workflow monitoring';

-- Grant access to authenticated users
-- Note: Views in Supabase inherit RLS from underlying tables
-- We need to ensure users can only see their own requests
-- This is handled by RLS policies on the requests table

-- Enable RLS on the view (if supported) or rely on underlying table policies
-- Since views don't support RLS directly, we rely on the requests table RLS policies
-- But we can create a security definer function for better control

-- Create a function to get requests for a specific user
CREATE OR REPLACE FUNCTION get_user_requests(_user_id UUID)
RETURNS TABLE (
  id UUID,
  request_number TEXT,
  user_id UUID,
  type TEXT,
  amount NUMERIC,
  currency TEXT,
  target_price NUMERIC,
  expiry_at TIMESTAMP WITH TIME ZONE,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  last_event JSONB
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    r.id,
    r.request_number,
    r.user_id,
    r.type,
    r.amount,
    r.currency,
    r.target_price,
    r.expiry_at,
    r.status,
    r.created_at,
    r.updated_at,
    COALESCE(
      (
        SELECT jsonb_build_object(
          'id', ev.id,
          'from_status', ev.from_status,
          'to_status', ev.to_status,
          'actor_id', ev.actor_id,
          'note', ev.note,
          'created_at', ev.created_at
        )
        FROM request_events ev
        WHERE ev.request_id = r.id
        ORDER BY ev.created_at DESC
        LIMIT 1
      ),
      jsonb_build_object(
        'id', NULL,
        'from_status', NULL,
        'to_status', r.status,
        'actor_id', NULL,
        'note', NULL,
        'created_at', r.created_at
      )
    ) AS last_event
  FROM requests r
  WHERE r.user_id = _user_id;
$$;

COMMENT ON FUNCTION get_user_requests(UUID) IS 'Get requests for a specific user with workflow events';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_requests(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_requests(UUID) TO anon;

-- Ensure the view is accessible (views inherit permissions from underlying tables)
-- The main issue is that Supabase PostgREST needs the view to be in the public schema
-- and accessible via the API. Since we're using the view directly, we need to ensure
-- RLS policies on requests table allow users to see their own requests

-- Verify that requests table has proper RLS policies
-- If not, we'll add them here
DO $$
BEGIN
  -- Check if RLS is enabled on requests table
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'requests'
    AND rowsecurity = true
  ) THEN
    -- Enable RLS if not already enabled
    ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create or replace RLS policy for users to see their own requests
DROP POLICY IF EXISTS "Users can view own requests" ON requests;
CREATE POLICY "Users can view own requests"
  ON requests FOR SELECT
  USING (auth.uid() = user_id);

-- Create or replace RLS policy for admins to see all requests
DROP POLICY IF EXISTS "Admins can view all requests" ON requests;
CREATE POLICY "Admins can view all requests"
  ON requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.slug = 'admin'
    )
  );
