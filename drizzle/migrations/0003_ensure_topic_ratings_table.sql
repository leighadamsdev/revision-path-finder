-- Idempotent safety net for topic_ratings (a pending migration may already create it).
CREATE TABLE IF NOT EXISTS public.topic_ratings (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  topic text NOT NULL,
  confidence smallint NOT NULL CHECK (confidence BETWEEN 1 AND 5),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, subject, topic)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.topic_ratings TO authenticated;
GRANT ALL ON public.topic_ratings TO service_role;
ALTER TABLE public.topic_ratings ENABLE ROW LEVEL SECURITY;
DO $policy$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'topic_ratings' AND policyname = 'Own topic ratings'
  ) THEN
    CREATE POLICY "Own topic ratings" ON public.topic_ratings FOR ALL TO authenticated
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END
$policy$;