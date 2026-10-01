ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'personalised';
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS journey jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.plans ADD CONSTRAINT plans_plan_type_check CHECK (plan_type IN ('quick','topic','personalised'));