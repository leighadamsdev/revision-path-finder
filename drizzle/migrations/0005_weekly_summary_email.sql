-- Weekly summary email: remember when each student's summary (and a test copy) was last sent,
-- so the Sunday run sends at most one a week even if it is triggered more than once.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_digest_sent_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_digest_test_at timestamptz;
