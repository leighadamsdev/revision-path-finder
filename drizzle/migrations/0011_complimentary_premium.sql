-- Free Premium that an admin gives (for schools, testers or friends). Stripe checks never
-- change it, so it stays until an admin removes it.
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS complimentary boolean NOT NULL DEFAULT false;

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
          AND (
            s.complimentary
            OR (
              s.subscribed
              AND (s.current_period_end IS NULL OR s.current_period_end > now() - interval '3 days')
            )
          )
      )
      OR EXISTS (
        SELECT 1 FROM public.user_roles r WHERE r.user_id = uid AND r.role::text = 'admin'
      )
    );
$fn$;

-- Only signed-in students and the backend need to call it.
REVOKE ALL ON FUNCTION public.has_premium(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_premium(uuid) TO authenticated, service_role;
