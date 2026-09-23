CREATE TABLE public.plan_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id),
  topic text NOT NULL,
  confidence smallint,
  is_priority boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_topics TO authenticated;
GRANT ALL ON public.plan_topics TO service_role;

ALTER TABLE public.plan_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own plan topics all" ON public.plan_topics
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.plans p WHERE p.id = plan_topics.plan_id AND p.profile_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.plans p WHERE p.id = plan_topics.plan_id AND p.profile_id = auth.uid()));

CREATE INDEX plan_topics_plan_subject_idx ON public.plan_topics (plan_id, subject_id);

ALTER TABLE public.plans ADD COLUMN intensity_weeks integer;
ALTER TABLE public.plans ADD COLUMN intensity_sessions_per_day integer;
ALTER TABLE public.plans ADD COLUMN holiday_periods jsonb NOT NULL DEFAULT '[]'::jsonb;
