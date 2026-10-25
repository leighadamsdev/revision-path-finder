ALTER TABLE public.library_topics ADD COLUMN archived boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.library_topics.archived IS 'True when the student has filed the topic away in the "Kept for later" folder; hidden from planners and pickers until restored.';
CREATE INDEX library_topics_archived_idx ON public.library_topics (subject_id) WHERE archived;