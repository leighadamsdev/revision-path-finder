-- Saved practice question sets: the settings a student used, so they can make a fresh
-- prompt from them later. Students see only their own; adding or changing needs Premium.
CREATE TABLE IF NOT EXISTS public.practice_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS practice_sets_user_idx ON public.practice_sets (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_sets TO authenticated;
GRANT ALL ON public.practice_sets TO service_role;
ALTER TABLE public.practice_sets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Own practice sets" ON public.practice_sets;
CREATE POLICY "Own practice sets" ON public.practice_sets FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Premium to add" ON public.practice_sets;
DROP POLICY IF EXISTS "Premium to change" ON public.practice_sets;
CREATE POLICY "Premium to add" ON public.practice_sets AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.has_premium(auth.uid()));
CREATE POLICY "Premium to change" ON public.practice_sets AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.has_premium(auth.uid())) WITH CHECK (public.has_premium(auth.uid()));
