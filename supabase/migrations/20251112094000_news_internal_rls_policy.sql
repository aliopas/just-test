-- RLS Policy for investors to read internal news
-- This allows investors with the 'investor.news.read' permission to read published internal news

DROP POLICY IF EXISTS "Investors can read internal news" ON news;

CREATE POLICY "Investors can read internal news"
  ON news
  FOR SELECT
  USING (
    status = 'published' 
    AND audience = 'investor_internal'
    AND fn_user_has_permission(auth.uid(), 'investor.news.read')
  );

-- Also allow reading public news for everyone (authenticated users)
DROP POLICY IF EXISTS "Everyone can read public news" ON news;

CREATE POLICY "Everyone can read public news"
  ON news
  FOR SELECT
  USING (
    status = 'published' 
    AND audience = 'public'
    AND auth.uid() IS NOT NULL
  );

COMMENT ON POLICY "Investors can read internal news" ON news IS 
  'Allows investors with investor.news.read permission to read published internal news';

COMMENT ON POLICY "Everyone can read public news" ON news IS 
  'Allows all authenticated users to read published public news';

