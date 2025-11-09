-- Settlement workflow enhancements for requests

ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS settlement_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS settlement_completed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS settlement_reference TEXT,
  ADD COLUMN IF NOT EXISTS settlement_notes TEXT;

ALTER TABLE attachments
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN attachments.category IS 'Categorises attachments (e.g. general, settlement, compliance)';
COMMENT ON COLUMN attachments.metadata IS 'Arbitrary JSON metadata depending on attachment category';

