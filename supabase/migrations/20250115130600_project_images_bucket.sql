-- Storage bucket for project cover images
-- This bucket stores cover images for investment projects
-- It is public so images can be displayed on the public landing page

INSERT INTO storage.buckets (id, name, public)
SELECT 'project-images', 'project-images', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'project-images'
);

-- ============================================================================
-- Storage Policies for project-images bucket
-- ============================================================================

-- Policy 1: Public read access (for displaying images on public landing page)
-- Anyone (including anonymous users) can read/view images from this bucket
DROP POLICY IF EXISTS "Public can read project images" ON storage.objects;
CREATE POLICY "Public can read project images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'project-images');

-- Policy 2: Admin upload access
-- Only authenticated admins and super_admins can upload new images
DROP POLICY IF EXISTS "Admins can upload project images" ON storage.objects;
CREATE POLICY "Admins can upload project images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'project-images' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Policy 3: Admin update access
-- Only authenticated admins and super_admins can update existing images
DROP POLICY IF EXISTS "Admins can update project images" ON storage.objects;
CREATE POLICY "Admins can update project images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'project-images' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Policy 4: Admin delete access
-- Only authenticated admins and super_admins can delete images
DROP POLICY IF EXISTS "Admins can delete project images" ON storage.objects;
CREATE POLICY "Admins can delete project images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'project-images' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

