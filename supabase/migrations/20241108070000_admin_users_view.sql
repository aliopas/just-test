-- Admin Users View for Story 2.4
DROP VIEW IF EXISTS v_admin_users;

CREATE VIEW v_admin_users AS
SELECT
  u.id,
  u.email,
  u.phone,
  u.phone_cc,
  u.role,
  u.status,
  u.created_at,
  u.updated_at,
  COALESCE(
    ARRAY_AGG(DISTINCT r.slug) FILTER (WHERE r.slug IS NOT NULL),
    ARRAY[]::text[]
  ) AS role_slugs,
  COALESCE(
    ARRAY_AGG(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL),
    ARRAY[]::text[]
  ) AS role_names,
  ip.full_name,
  ip.kyc_status,
  ip.language,
  ip.risk_profile,
  ip.city,
  ip.kyc_updated_at,
  ip.updated_at AS profile_updated_at,
  ip.communication_preferences,
  ip.id_type,
  ip.nationality,
  ip.residency_country
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
LEFT JOIN investor_profiles ip ON ip.user_id = u.id
GROUP BY
  u.id,
  ip.full_name,
  ip.kyc_status,
  ip.language,
  ip.risk_profile,
  ip.city,
  ip.kyc_updated_at,
  ip.updated_at,
  ip.communication_preferences,
  ip.id_type,
  ip.nationality,
  ip.residency_country;

COMMENT ON VIEW v_admin_users IS 'Aggregated user data for admin dashboards (roles, investor profile metadata)';

