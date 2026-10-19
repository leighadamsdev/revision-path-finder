-- Red/amber/green (1–5) confidence ratings a student gives their topics, kept outside any
-- plan so they can rate before building one. Keyed by subject name and the topic text the
-- planner uses, so ratings carry into plans.
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
CREATE POLICY "Own topic ratings" ON public.topic_ratings FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
