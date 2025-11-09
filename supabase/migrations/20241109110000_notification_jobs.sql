-- Enum for job status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'notification_job_status'
  ) THEN
    CREATE TYPE notification_job_status AS ENUM ('queued', 'processing', 'completed', 'failed');
  END IF;
END $$;

-- Table for email notification jobs
CREATE TABLE IF NOT EXISTS notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id notification_type NOT NULL,
  channel notification_channel NOT NULL DEFAULT 'email',
  language TEXT NOT NULL DEFAULT 'en',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status notification_job_status NOT NULL DEFAULT 'queued',
  attempts SMALLINT NOT NULL DEFAULT 0,
  max_attempts SMALLINT NOT NULL DEFAULT 5,
  last_error TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  dispatched_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_jobs_status_scheduled
  ON notification_jobs (status, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_notification_jobs_user
  ON notification_jobs (user_id);

-- Reuse timestamp trigger
CREATE TRIGGER trg_notification_jobs_updated_at
BEFORE UPDATE ON notification_jobs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- Enable RLS
ALTER TABLE notification_jobs ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/update/delete
CREATE POLICY "Service role manages notification jobs"
  ON notification_jobs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


