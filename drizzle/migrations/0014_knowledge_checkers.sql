CREATE TABLE public.knowledge_checkers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  subject text NOT NULL DEFAULT '',
  topic text NOT NULL DEFAULT '',
  rows jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_checkers TO authenticated;
GRANT ALL ON public.knowledge_checkers TO service_role;
ALTER TABLE public.knowledge_checkers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own knowledge checkers" ON public.knowledge_checkers FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER t_kc BEFORE UPDATE ON public.knowledge_checkers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();