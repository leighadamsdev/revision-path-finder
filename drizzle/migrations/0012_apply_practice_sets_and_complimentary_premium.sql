-- Ensure both requested changes are applied even if an older journal timestamp was skipped.
CREATE TABLE IF NOT EXISTS public.practice_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_sets TO authenticated;
GRANT ALL ON public.practice_sets TO service_role;
ALTER TABLE public.practice_sets ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS practice_sets_user_idx ON public.practice_sets (user_id, created_at DESC);
DROP POLICY IF EXISTS "Own practice sets" ON public.practice_sets;
CREATE POLICY "Own practice sets" ON public.practice_sets FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Premium to add" ON public.practice_sets;
DROP POLICY IF EXISTS "Premium to change" ON public.practice_sets;
CREATE POLICY "Premium to add" ON public.practice_sets AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.has_premium(auth.uid()));
CREATE POLICY "Premium to change" ON public.practice_sets AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.has_premium(auth.uid())) WITH CHECK (public.has_premium(auth.uid()));
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS complimentary boolean NOT NULL DEFAULT false;
CREATE OR REPLACE FUNCTION public.has_premium(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT uid IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.subscribers s
      WHERE s.user_id = uid AND (
        s.complimentary OR (
          s.subscribed AND (s.current_period_end IS NULL OR s.current_period_end > now() - interval '3 days')
        )
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles r WHERE r.user_id = uid AND r.role::text = 'admin'
    )
  );
$fn$;
REVOKE ALL ON FUNCTION public.has_premium(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_premium(uuid) TO authenticated, service_role;