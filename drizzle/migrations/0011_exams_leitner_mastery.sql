CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.schools TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.schools TO authenticated;
GRANT ALL ON public.schools TO service_role;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read schools" ON public.schools FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins write schools" ON public.schools FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.profiles ADD COLUMN school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN parent_email text;
ALTER TABLE public.profiles ADD COLUMN digest_opt_in boolean NOT NULL DEFAULT true;

CREATE TABLE public.official_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  exam_board text NOT NULL DEFAULT '',
  tier text,
  paper text NOT NULL,
  series text NOT NULL DEFAULT '',
  exam_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.official_exams TO authenticated;
GRANT ALL ON public.official_exams TO service_role;
ALTER TABLE public.official_exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read official exams" ON public.official_exams FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins write official exams" ON public.official_exams FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  paper_no smallint NOT NULL DEFAULT 1 CHECK (paper_no BETWEEN 1 AND 3),
  kind text NOT NULL DEFAULT 'untagged' CHECK (kind IN ('mock','final','untagged')),
  label text NOT NULL DEFAULT '',
  exam_date date NOT NULL,
  official_exam_id uuid REFERENCES public.official_exams(id) ON DELETE SET NULL,
  verified boolean NOT NULL DEFAULT false,
  all_topics boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exams TO authenticated;
GRANT ALL ON public.exams TO service_role;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own exams" ON public.exams FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.plans p WHERE p.id = exams.plan_id AND p.profile_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.plans p WHERE p.id = exams.plan_id AND p.profile_id = auth.uid()));

CREATE TABLE public.exam_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  plan_topic_id uuid NOT NULL REFERENCES public.plan_topics(id) ON DELETE CASCADE,
  UNIQUE (exam_id, plan_topic_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_topics TO authenticated;
GRANT ALL ON public.exam_topics TO service_role;
ALTER TABLE public.exam_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own exam topics" ON public.exam_topics FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e JOIN public.plans p ON p.id = e.plan_id WHERE e.id = exam_topics.exam_id AND p.profile_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e JOIN public.plans p ON p.id = e.plan_id WHERE e.id = exam_topics.exam_id AND p.profile_id = auth.uid()));

CREATE TABLE public.plan_subtopics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_topic_id uuid NOT NULL REFERENCES public.plan_topics(id) ON DELETE CASCADE,
  name text NOT NULL,
  confidence smallint CHECK (confidence BETWEEN 1 AND 5),
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_subtopics TO authenticated;
GRANT ALL ON public.plan_subtopics TO service_role;
ALTER TABLE public.plan_subtopics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subtopics" ON public.plan_subtopics FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.plan_topics t JOIN public.plans p ON p.id = t.plan_id WHERE t.id = plan_subtopics.plan_topic_id AND p.profile_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.plan_topics t JOIN public.plans p ON p.id = t.plan_id WHERE t.id = plan_subtopics.plan_topic_id AND p.profile_id = auth.uid()));

CREATE TABLE public.flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  plan_topic_id uuid REFERENCES public.plan_topics(id) ON DELETE CASCADE,
  subtopic_id uuid REFERENCES public.plan_subtopics(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  box text NOT NULL DEFAULT '1' CHECK (box IN ('1','2','3','bench')),
  due_on date NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed_at timestamptz,
  refreshed_for_exam_id uuid REFERENCES public.exams(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX flashcards_topic_unique ON public.flashcards(plan_topic_id) WHERE subtopic_id IS NULL AND plan_topic_id IS NOT NULL;
CREATE UNIQUE INDEX flashcards_subtopic_unique ON public.flashcards(subtopic_id) WHERE subtopic_id IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcards TO authenticated;
GRANT ALL ON public.flashcards TO service_role;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own flashcards" ON public.flashcards FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.plans p WHERE p.id = flashcards.plan_id AND p.profile_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.plans p WHERE p.id = flashcards.plan_id AND p.profile_id = auth.uid()));

CREATE TABLE public.flashcard_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flashcard_id uuid NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  correct boolean NOT NULL,
  from_box text NOT NULL,
  to_box text NOT NULL,
  reviewed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcard_reviews TO authenticated;
GRANT ALL ON public.flashcard_reviews TO service_role;
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own flashcard reviews" ON public.flashcard_reviews FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.flashcards f JOIN public.plans p ON p.id = f.plan_id WHERE f.id = flashcard_reviews.flashcard_id AND p.profile_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.flashcards f JOIN public.plans p ON p.id = f.plan_id WHERE f.id = flashcard_reviews.flashcard_id AND p.profile_id = auth.uid()));

CREATE TABLE public.pace_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  status text NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested','accepted','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_id, subject_id, week_start)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pace_prompts TO authenticated;
GRANT ALL ON public.pace_prompts TO service_role;
ALTER TABLE public.pace_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pace prompts" ON public.pace_prompts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.plans p WHERE p.id = pace_prompts.plan_id AND p.profile_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.plans p WHERE p.id = pace_prompts.plan_id AND p.profile_id = auth.uid()));

CREATE TABLE public.mastery_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  score integer NOT NULL,
  UNIQUE (plan_id, subject_id, week_start)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mastery_snapshots TO authenticated;
GRANT ALL ON public.mastery_snapshots TO service_role;
ALTER TABLE public.mastery_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own mastery" ON public.mastery_snapshots FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.plans p WHERE p.id = mastery_snapshots.plan_id AND p.profile_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.plans p WHERE p.id = mastery_snapshots.plan_id AND p.profile_id = auth.uid()));

ALTER TABLE public.sessions ADD COLUMN completed_at timestamptz;
ALTER TABLE public.sessions ADD COLUMN kind text NOT NULL DEFAULT 'topic';
ALTER TABLE public.sessions ADD COLUMN pinned boolean NOT NULL DEFAULT false;
ALTER TABLE public.plans ADD COLUMN weekly_minutes_budget integer;
ALTER TABLE public.plans ADD COLUMN holiday_boost boolean NOT NULL DEFAULT false;
ALTER TABLE public.plans ADD COLUMN pre_exam_boost boolean NOT NULL DEFAULT false;
ALTER TABLE public.plans ADD COLUMN pre_exam_weeks integer NOT NULL DEFAULT 4;

INSERT INTO public.exams (plan_id, subject_id, paper_no, exam_date)
SELECT plan_id, subject_id, n, d FROM (
  SELECT plan_id, subject_id, 1 AS n, exam_date AS d FROM public.plan_subjects WHERE exam_date IS NOT NULL
  UNION ALL SELECT plan_id, subject_id, 2, exam_date_2 FROM public.plan_subjects WHERE exam_date_2 IS NOT NULL
  UNION ALL SELECT plan_id, subject_id, 3, exam_date_3 FROM public.plan_subjects WHERE exam_date_3 IS NOT NULL
) s;

INSERT INTO public.schools (name) VALUES ('My school is not listed');