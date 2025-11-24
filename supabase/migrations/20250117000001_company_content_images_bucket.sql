-- Storage bucket for company content images and icons
-- Epic 9: Story 9.2 - دعم رفع الأيقونات والصور
-- Generated: 2025-01-17

-- Create storage bucket for company content images/icons
INSERT INTO storage.buckets (id, name, public)
SELECT 'company-content-images', 'company-content-images', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'company-content-images'
);

-- ============================================================================
-- Storage Policies for company-content-images bucket
-- ============================================================================

-- Policy 1: Public read access (for displaying images/icons on public landing page)
-- Anyone (including anonymous users) can read/view images from this bucket
DROP POLICY IF EXISTS "Public can read company content images" ON storage.objects;
CREATE POLICY "Public can read company content images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'company-content-images');

-- Policy 2: Admin upload access
-- Only authenticated admins can upload new images/icons
DROP POLICY IF EXISTS "Admins can upload company content images" ON storage.objects;
CREATE POLICY "Admins can upload company content images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'company-content-images' AND
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid() 
        AND p.slug = 'admin.content.manage'
        AND rp.grant_type = 'allow'
    )
  );

-- Policy 3: Admin update access
-- Only authenticated admins can update existing images/icons
DROP POLICY IF EXISTS "Admins can update company content images" ON storage.objects;
CREATE POLICY "Admins can update company content images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'company-content-images' AND
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid() 
        AND p.slug = 'admin.content.manage'
        AND rp.grant_type = 'allow'
    )
  );

-- Policy 4: Admin delete access
-- Only authenticated admins can delete images/icons
DROP POLICY IF EXISTS "Admins can delete company content images" ON storage.objects;
CREATE POLICY "Admins can delete company content images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'company-content-images' AND
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid() 
        AND p.slug = 'admin.content.manage'
        AND rp.grant_type = 'allow'
    )
  );

