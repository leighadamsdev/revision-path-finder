ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS day_plan jsonb;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS length_minutes integer;