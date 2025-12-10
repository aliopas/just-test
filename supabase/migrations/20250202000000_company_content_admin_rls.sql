-- Epic 9: Company Content Admin RLS Policies
-- Story 9.2: إضافة RLS policies للمسؤولين للحذف والتعديل
-- Generated: 2025-02-02

-- ============================================================================
-- Admin RLS Policies for company_content tables
-- Admins with 'admin.content.manage' permission can INSERT, UPDATE, DELETE
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
GRANT EXECUTE ON FUNCTION fn_user_has_permission(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_user_has_permission(UUID, TEXT) TO anon;

