-- Some subjects have more than 3 papers (AQA Combined Science Trilogy has 6), and students
-- can add mocks on top. The app allows up to 8 per subject, so the database must too.
-- Without this, building a plan with Combined Science fails on the 4th paper.
ALTER TABLE public.exams DROP CONSTRAINT IF EXISTS exams_paper_no_check;
ALTER TABLE public.exams ADD CONSTRAINT exams_paper_no_check CHECK (paper_no BETWEEN 1 AND 20);

-- Plans now default to the weeks until the student's last exam, which in autumn is
-- around 30 weeks. Allow up to a full school year.
ALTER TABLE public.plans DROP CONSTRAINT IF EXISTS plans_weeks_check;
ALTER TABLE public.plans ADD CONSTRAINT plans_weeks_check CHECK (weeks BETWEEN 1 AND 52);
