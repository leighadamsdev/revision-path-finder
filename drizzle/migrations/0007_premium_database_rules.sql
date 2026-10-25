-- Premium rules in the database, so they hold even if someone bypasses the website.
-- Students without Premium can still read and delete their own plan data (so nothing is
-- lost if a subscription lapses), but can't create or change it. Admins always can.
-- The backend functions use the service role and are not affected.

CREATE OR REPLACE FUNCTION public.has_premium(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT
    uid IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM public.subscribers s
        WHERE s.user_id = uid
          AND s.subscribed
          -- A lapsed subscription stops counting a few days after its paid period ends,
          -- even if the student hasn't opened RevPlan since.
          AND (s.current_period_end IS NULL OR s.current_period_end > now() - interval '3 days')
      )
      OR EXISTS (
        SELECT 1 FROM public.user_roles r WHERE r.user_id = uid AND r.role::text = 'admin'
      )
    );
$fn$;

REVOKE ALL ON FUNCTION public.has_premium(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_premium(uuid) TO authenticated, service_role;

-- Restrictive policies are added on top of each table's existing ones (both must pass),
-- so the current "only your own rows" rules stay exactly as they are.
DO $premium$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'plans', 'plan_subjects', 'plan_topics', 'plan_subtopics', 'sessions',
    'exams', 'exam_topics', 'knowledge_checkers', 'flashcards', 'flashcard_reviews',
    'pace_prompts', 'mastery_snapshots'
  ]
  LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      CONTINUE;
    END IF;
    EXECUTE format('DROP POLICY IF EXISTS "Premium to add" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Premium to change" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "Premium to add" ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.has_premium(auth.uid()))',
      t
    );
    EXECUTE format(
      'CREATE POLICY "Premium to change" ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.has_premium(auth.uid())) WITH CHECK (public.has_premium(auth.uid()))',
      t
    );
  END LOOP;
END
$premium$;
