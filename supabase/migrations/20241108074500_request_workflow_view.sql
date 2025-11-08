-- View exposing latest workflow event per request
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

