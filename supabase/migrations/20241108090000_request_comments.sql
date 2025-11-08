-- Request comments for admin internal collaboration
CREATE TABLE IF NOT EXISTS request_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_comments_request_id ON request_comments(request_id);
CREATE INDEX IF NOT EXISTS idx_request_comments_actor_id ON request_comments(actor_id);

COMMENT ON TABLE request_comments IS 'Internal admin comments on investment requests';

ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage request comments" ON request_comments;

CREATE POLICY "Admins can manage request comments"
  ON request_comments
  USING (auth.uid() = actor_id)
  WITH CHECK (auth.uid() = actor_id);

