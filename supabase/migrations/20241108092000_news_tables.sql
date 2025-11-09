-- News content schema (Story 5.1)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'news_status') THEN
    CREATE TYPE news_status AS ENUM ('draft', 'scheduled', 'published');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS news_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  body_md TEXT NOT NULL,
  cover_key TEXT,
  category_id UUID REFERENCES news_categories(id) ON DELETE SET NULL,
  status news_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_category_id ON news(category_id);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_scheduled_at ON news(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at);

CREATE INDEX IF NOT EXISTS idx_news_search_fts
  ON news
  USING GIN (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(body_md, '')));

ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read news categories" ON news_categories;
DROP POLICY IF EXISTS "Admins can manage news categories" ON news_categories;

CREATE POLICY "Admins can read news categories"
  ON news_categories
  FOR SELECT
  USING (fn_user_has_permission(auth.uid(), 'admin.content.manage'));

CREATE POLICY "Admins can manage news categories"
  ON news_categories
  USING (fn_user_has_permission(auth.uid(), 'admin.content.manage'))
  WITH CHECK (fn_user_has_permission(auth.uid(), 'admin.content.manage'));

DROP POLICY IF EXISTS "Admins can read news" ON news;
DROP POLICY IF EXISTS "Admins can manage news" ON news;

CREATE POLICY "Admins can read news"
  ON news
  FOR SELECT
  USING (fn_user_has_permission(auth.uid(), 'admin.content.manage'));

CREATE POLICY "Admins can manage news"
  ON news
  USING (fn_user_has_permission(auth.uid(), 'admin.content.manage'))
  WITH CHECK (fn_user_has_permission(auth.uid(), 'admin.content.manage'));

