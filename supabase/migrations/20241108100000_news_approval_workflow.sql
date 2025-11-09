-- Extend news_status enum with review workflow states
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'news_status'
      AND e.enumlabel = 'pending_review'
  ) THEN
    ALTER TYPE news_status ADD VALUE 'pending_review';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'news_status'
      AND e.enumlabel = 'rejected'
  ) THEN
    ALTER TYPE news_status ADD VALUE 'rejected';
  END IF;
END $$;

-- Review decision enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'news_review_action') THEN
    CREATE TYPE news_review_action AS ENUM ('approve', 'reject');
  END IF;
END $$;

-- Reviewer history table
CREATE TABLE IF NOT EXISTS news_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  action news_review_action NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_reviews_news_id ON news_reviews(news_id);
CREATE INDEX IF NOT EXISTS idx_news_reviews_reviewer_id ON news_reviews(reviewer_id);

COMMENT ON TABLE news_reviews IS 'Review decisions (approve/reject) for news articles';

ALTER TABLE news_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage news reviews" ON news_reviews;

CREATE POLICY "Admins manage news reviews"
  ON news_reviews
  FOR ALL
  USING (fn_user_has_permission(auth.uid(), 'admin.content.manage'))
  WITH CHECK (fn_user_has_permission(auth.uid(), 'admin.content.manage'));

