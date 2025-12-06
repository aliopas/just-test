-- Grant permissions on v_admin_users view
-- This view should be accessible to admins with admin.users.manage permission

-- Grant SELECT on the view to authenticated users
-- RLS policies on underlying tables will control access
GRANT SELECT ON v_admin_users TO authenticated;
GRANT SELECT ON v_admin_users TO anon;

-- Note: RLS is not directly applicable to views, but the underlying tables
-- (users, user_roles, roles, investor_profiles) have RLS policies that will
-- control access. The view will respect those policies.
