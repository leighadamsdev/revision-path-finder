-- Premium subscriptions (paid through Stripe). One row per student, written only by the
-- backend functions (create-checkout / check-subscription); students can read their own row.
CREATE TABLE IF NOT EXISTS public.subscribers (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  stripe_customer_id text,
  subscribed boolean NOT NULL DEFAULT false,
  plan text,
  current_period_end timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscribers TO authenticated;
GRANT ALL ON public.subscribers TO service_role;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
DO $policy$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'subscribers' AND policyname = 'Read own subscription'
  ) THEN
    CREATE POLICY "Read own subscription" ON public.subscribers FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$policy$;
