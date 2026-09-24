CREATE TYPE public.library_source AS ENUM ('image','pdf','manual');
CREATE TABLE public.library_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  exam_board text,
  qualification_level text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.library_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  subject_id uuid NOT NULL REFERENCES public.library_subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  source_type public.library_source NOT NULL DEFAULT 'manual',
  source_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  topic_id uuid NOT NULL REFERENCES public.library_topics(id) ON DELETE CASCADE,
  title text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  uncertain boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_subjects, public.library_topics, public.library_items TO authenticated;
GRANT ALL ON public.library_subjects, public.library_topics, public.library_items TO service_role;
ALTER TABLE public.library_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subjects" ON public.library_subjects FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own topics" ON public.library_topics FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own items" ON public.library_items FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX ON public.library_topics(subject_id);
CREATE INDEX ON public.library_items(topic_id);
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER t_ls BEFORE UPDATE ON public.library_subjects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_lt BEFORE UPDATE ON public.library_topics FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_li BEFORE UPDATE ON public.library_items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER TABLE public.profiles ADD COLUMN onboarding_completed_at timestamptz;
ALTER TABLE public.plan_topics ADD COLUMN library_topic_id uuid REFERENCES public.library_topics(id) ON DELETE SET NULL;
ALTER TABLE public.plan_subtopics ADD COLUMN library_item_id uuid REFERENCES public.library_items(id) ON DELETE SET NULL;