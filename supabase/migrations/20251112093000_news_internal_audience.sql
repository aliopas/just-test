-- Internal investor news support: audience + attachments columns

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'news_audience') THEN
    CREATE TYPE news_audience AS ENUM ('public', 'investor_internal');
  END IF;
END $$;

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS audience news_audience NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_news_audience ON news(audience);

COMMENT ON COLUMN news.audience IS 'Target audience for the news item (public or investor_internal).';
COMMENT ON COLUMN news.attachments IS 'JSON array of attachment metadata (documents, images) stored in Supabase Storage.';

-- Storage bucket for internal news assets (documents + images uploaded by admins)
INSERT INTO storage.buckets (id, name, public)
SELECT 'internal-news-assets', 'internal-news-assets', FALSE
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'internal-news-assets'
);

-- Permission for investors to read internal news
INSERT INTO permissions (slug, name, description, category)
SELECT
  'investor.news.read',
  'قراءة أخبار المستثمر',
  'السماح للمستثمر بالاطلاع على الأخبار الداخلية والمستندات',
  'investor'
WHERE NOT EXISTS (
  SELECT 1 FROM permissions WHERE slug = 'investor.news.read'
);

INSERT INTO role_permissions (role_id, permission_id, grant_type)
SELECT r.id, p.id, 'allow'
FROM roles r
JOIN permissions p ON p.slug = 'investor.news.read'
WHERE r.slug = 'investor'
ON CONFLICT (role_id, permission_id) DO NOTHING;

