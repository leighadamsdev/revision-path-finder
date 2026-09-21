ALTER TABLE public.plan_subjects
  ADD COLUMN IF NOT EXISTS exam_date date,
  ADD COLUMN IF NOT EXISTS confidence smallint;

ALTER TABLE public.plan_subjects
  ADD CONSTRAINT plan_subjects_confidence_range CHECK (confidence IS NULL OR (confidence BETWEEN 1 AND 5));

COMMENT ON COLUMN public.sessions.confidence IS 'DEPRECATED: replaced by plan_subjects.confidence (subject-level rating)';
COMMENT ON COLUMN public.sessions.confidence_before IS 'DEPRECATED: replaced by plan_subjects.confidence (subject-level rating)';