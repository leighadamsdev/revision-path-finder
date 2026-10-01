CREATE TABLE public.setup_drafts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.setup_drafts TO authenticated;
GRANT ALL ON public.setup_drafts TO service_role;
ALTER TABLE public.setup_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own setup draft" ON public.setup_drafts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
ALTER TABLE public.plan_topics ADD COLUMN excluded boolean NOT NULL DEFAULT false;
ALTER TABLE public.sessions ADD COLUMN missed_at timestamptz;