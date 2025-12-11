-- Fix RLS policy for admin requests access
-- This ensures admins can read requests whether they have role in users.role column OR in user_roles table

-- Drop existing admin policy
DROP POLICY IF EXISTS "Admins can view all requests" ON requests;

-- Create updated policy that checks both users.role column AND user_roles table
CREATE POLICY "Admins can view all requests"
  ON requests FOR SELECT
  USING (
    -- Check if user has role 'admin' in users.role column
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
    OR
    -- Check if user has admin role in user_roles table
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND (r.slug = 'admin' OR r.name = 'admin')
    )
  );

COMMENT ON POLICY "Admins can view all requests" ON requests IS 
  'Allows admins to view all requests. Checks both users.role column and user_roles table for admin role.';

