ALTER TABLE public.plans
ALTER COLUMN start_date SET DEFAULT CURRENT_DATE;

UPDATE public.plans
SET start_date = created_at::date
WHERE start_date IS NULL;

ALTER TABLE public.plans
ALTER COLUMN start_date SET NOT NULL;