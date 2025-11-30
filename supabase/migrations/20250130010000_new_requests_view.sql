-- View for new requests (unread by any admin)
-- This view shows requests that haven't been viewed by any admin yet

CREATE OR REPLACE VIEW v_new_requests AS
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
  r.notes,
  r.metadata,
  r.created_at,
  r.updated_at,
  -- Check if request has been viewed by any admin
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM admin_request_views arv 
      WHERE arv.request_id = r.id
    ) THEN false
    ELSE true
  END as is_new
FROM requests r;

COMMENT ON VIEW v_new_requests IS 'View showing all requests with is_new flag indicating if they have been viewed by any admin';

-- Create index on admin_request_views for better performance
CREATE INDEX IF NOT EXISTS idx_admin_request_views_request_id 
  ON admin_request_views(request_id);

-- Function to get count of new requests (unread by any admin)
CREATE OR REPLACE FUNCTION get_new_requests_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM requests r
  WHERE NOT EXISTS (
    SELECT 1 
    FROM admin_request_views arv 
    WHERE arv.request_id = r.id
  );
$$;

COMMENT ON FUNCTION get_new_requests_count() IS 'Returns the count of requests that have not been viewed by any admin';

