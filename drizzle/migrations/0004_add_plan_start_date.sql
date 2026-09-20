ALTER TABLE public.plans
ADD COLUMN start_date date;

UPDATE public.plans
SET start_date = created_at::date
WHERE start_date IS NULL;