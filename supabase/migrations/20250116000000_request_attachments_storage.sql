-- Storage bucket for request attachments
-- This bucket stores files uploaded by investors for their investment requests

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'request-attachments',
  'request-attachments',
  FALSE,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'request-attachments'
);

-- Storage policy: Users can upload files for their own requests
-- The path structure is: request_id/year/month/uuid.ext
-- We verify ownership by checking if the request_id belongs to the user
DROP POLICY IF EXISTS "Users can upload attachments to their own requests" ON storage.objects;
CREATE POLICY "Users can upload attachments to their own requests"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'request-attachments' AND
  EXISTS (
    SELECT 1 FROM requests
    WHERE requests.id::text = (string_to_array(name, '/'))[1]
    AND requests.user_id = auth.uid()
  )
);

-- Storage policy: Users can read attachments from their own requests
DROP POLICY IF EXISTS "Users can read attachments from their own requests" ON storage.objects;
CREATE POLICY "Users can read attachments from their own requests"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'request-attachments' AND
  EXISTS (
    SELECT 1 FROM requests
    WHERE requests.id::text = (string_to_array(name, '/'))[1]
    AND requests.user_id = auth.uid()
  )
);

-- Storage policy: Admins can read all attachments
DROP POLICY IF EXISTS "Admins can read all attachments" ON storage.objects;
CREATE POLICY "Admins can read all attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'request-attachments' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

-- Storage policy: Admins can delete attachments
DROP POLICY IF EXISTS "Admins can delete attachments" ON storage.objects;
CREATE POLICY "Admins can delete attachments"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'request-attachments' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

