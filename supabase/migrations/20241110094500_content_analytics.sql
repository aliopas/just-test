-- Content analytics events (Story 7.5)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'news_content_event_type'
  ) THEN
    CREATE TYPE news_content_event_type AS ENUM ('impression', 'detail_view');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS news_content_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  event_type news_content_event_type NOT NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_content_events_news
  ON news_content_events (news_id);

CREATE INDEX IF NOT EXISTS idx_news_content_events_event_type
  ON news_content_events (event_type);

CREATE INDEX IF NOT EXISTS idx_news_content_events_created_at
  ON news_content_events (created_at);

COMMENT ON TABLE news_content_events IS 'Tracks impressions and detail views for published news content.';
COMMENT ON COLUMN news_content_events.context IS 'Source context such as list feed or detail page.';


