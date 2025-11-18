-- Storage bucket for project cover images

INSERT INTO storage.buckets (id, name, public)
SELECT 'project-images', 'project-images', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'project-images'
);

-- Storage policies for project-images bucket
-- Allow authenticated admins to upload
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

-- Allow authenticated admins to update
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

-- Allow authenticated admins to delete
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

-- Allow public to read project images
DROP POLICY IF EXISTS "Public can read project images" ON storage.objects;
CREATE POLICY "Public can read project images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'project-images');

