ALTER TABLE public.plan_subjects
  ADD COLUMN IF NOT EXISTS exam_date_2 date,
  ADD COLUMN IF NOT EXISTS exam_date_3 date;

COMMENT ON COLUMN public.plan_subjects.exam_date IS 'First exam/paper date for this subject in this plan.';
COMMENT ON COLUMN public.plan_subjects.exam_date_2 IS 'Optional second exam/paper date.';
COMMENT ON COLUMN public.plan_subjects.exam_date_3 IS 'Optional third exam/paper date.';