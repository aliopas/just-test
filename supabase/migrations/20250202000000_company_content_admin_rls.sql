-- Epic 9: Company Content Admin RLS Policies
-- Story 9.2: إضافة RLS policies للمسؤولين للحذف والتعديل
-- Generated: 2025-02-02
--
-- This migration adds RLS policies that work with:
-- 1. Backend API (using service role - bypasses RLS)
-- 2. MCP Supabase (using authenticated user - respects RLS)
-- 3. Direct Supabase client (using authenticated user - respects RLS)
--
-- Policies use fn_user_has_permission() which checks if the authenticated user
-- (auth.uid()) has the 'admin.content.manage' permission.

-- ============================================================================
-- Admin RLS Policies for company_content tables
-- Admins with 'admin.content.manage' permission can INSERT, UPDATE, DELETE
-- These policies work with authenticated users (MCP Supabase, direct client)
-- ============================================================================

-- company_profile Admin Policies
DROP POLICY IF EXISTS "Admins can manage company profile" ON company_profile;
CREATE POLICY "Admins can manage company profile"
  ON company_profile FOR ALL
  USING (fn_user_has_permission(auth.uid(), 'admin.content.manage'))
  WITH CHECK (fn_user_has_permission(auth.uid(), 'admin.content.manage'));

-- company_partners Admin Policies
DROP POLICY IF EXISTS "Admins can manage company partners" ON company_partners;
CREATE POLICY "Admins can manage company partners"
  ON company_partners FOR ALL
  USING (fn_user_has_permission(auth.uid(), 'admin.content.manage'))
  WITH CHECK (fn_user_has_permission(auth.uid(), 'admin.content.manage'));

-- company_clients Admin Policies
DROP POLICY IF EXISTS "Admins can manage company clients" ON company_clients;
CREATE POLICY "Admins can manage company clients"
  ON company_clients FOR ALL
  USING (fn_user_has_permission(auth.uid(), 'admin.content.manage'))
  WITH CHECK (fn_user_has_permission(auth.uid(), 'admin.content.manage'));

-- company_resources Admin Policies
DROP POLICY IF EXISTS "Admins can manage company resources" ON company_resources;
CREATE POLICY "Admins can manage company resources"
  ON company_resources FOR ALL
  USING (fn_user_has_permission(auth.uid(), 'admin.content.manage'))
  WITH CHECK (fn_user_has_permission(auth.uid(), 'admin.content.manage'));

-- company_strengths Admin Policies
DROP POLICY IF EXISTS "Admins can manage company strengths" ON company_strengths;
CREATE POLICY "Admins can manage company strengths"
  ON company_strengths FOR ALL
  USING (fn_user_has_permission(auth.uid(), 'admin.content.manage'))
  WITH CHECK (fn_user_has_permission(auth.uid(), 'admin.content.manage'));

-- partnership_info Admin Policies
DROP POLICY IF EXISTS "Admins can manage partnership info" ON partnership_info;
CREATE POLICY "Admins can manage partnership info"
  ON partnership_info FOR ALL
  USING (fn_user_has_permission(auth.uid(), 'admin.content.manage'))
  WITH CHECK (fn_user_has_permission(auth.uid(), 'admin.content.manage'));

-- market_value Admin Policies
DROP POLICY IF EXISTS "Admins can manage market value" ON market_value;
CREATE POLICY "Admins can manage market value"
  ON market_value FOR ALL
  USING (fn_user_has_permission(auth.uid(), 'admin.content.manage'))
  WITH CHECK (fn_user_has_permission(auth.uid(), 'admin.content.manage'));

-- company_goals Admin Policies
DROP POLICY IF EXISTS "Admins can manage company goals" ON company_goals;
CREATE POLICY "Admins can manage company goals"
  ON company_goals FOR ALL
  USING (fn_user_has_permission(auth.uid(), 'admin.content.manage'))
  WITH CHECK (fn_user_has_permission(auth.uid(), 'admin.content.manage'));

-- ============================================================================
-- Grant necessary permissions
-- ============================================================================
-- Ensure fn_user_has_permission function is accessible
-- This function is already granted in rbac_refactor migration, but we ensure it here
GRANT EXECUTE ON FUNCTION fn_user_has_permission(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_user_has_permission(UUID, TEXT) TO anon;

-- ============================================================================
-- How these policies work with different clients:
-- ============================================================================
-- 1. Backend API (service role):
--    - Uses requireSupabaseAdmin() which bypasses RLS
--    - Works regardless of policies (service role has full access)
--
-- 2. MCP Supabase (authenticated user):
--    - Uses authenticated Supabase client with JWT token
--    - auth.uid() returns the authenticated user ID from JWT
--    - fn_user_has_permission() checks if user has 'admin.content.manage'
--    - Policies are enforced - user must have permission
--
-- 3. Direct Supabase client (authenticated user):
--    - Same as MCP Supabase - uses authenticated client
--    - Policies are enforced based on user permissions
--
-- Requirements for MCP Supabase to work:
-- - User must be authenticated (have valid JWT token)
-- - User must have 'admin.content.manage' permission
-- - Permission must be granted through role_permissions table
-- - User must have role assigned through user_roles table

