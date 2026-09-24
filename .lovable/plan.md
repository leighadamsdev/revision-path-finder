# Topic Library + required onboarding

Add a per-student "My Topic Library" (Subject > Topic > Content item) filled during a required 3-step onboarding, and feed it into the existing Knowledge Checker and Revision Planner. No priority, confidence, scoring or scheduling rules change.

## How it fits with what already exists (conflicts flagged)

- **Plans already hold their own topic list** (`plan_topics` / `plan_subtopics`, copied from the built-in GCSE lists or an uploaded list). To avoid a second system, the library becomes the *source* those lists are picked from: the setup wizard and "edit topics" gain a "From my Topic Library" option, and each plan topic/subtopic keeps a link back to the library record it came from. Plan topic ratings, priorities and history stay on the plan exactly as today.
- **Content item = the existing subtopic layer.** Library content items map to plan subtopics, so confidence and Leitner flashcards keep working unchanged.
- **Knowledge Checker currently saves in the browser only.** It gains Subject > Topic > Content item pickers that fill its subject/topic fields and rows from the library. Its closed-book / check-gaps logic, counts and feedback stay identical. Completed checks already saved are untouched.
- **Built-in GCSE topic lists** stay available as a quick way to fill a library subject ("Use the standard GCSE list"), alongside import and manual entry.
- **Existing users** (who already have plans) are not forced through onboarding; they can open the library any time. New accounts, and existing accounts with no plan and an empty library, go through onboarding first.
- **Image correction limits:** rotation (auto-detected + manual), cropping, brightness/contrast and deskew will be done in the browser. True perspective "flattening" of angled photos isn't reliably possible without heavy image tools that can't run here; instead the AI reader is told to read skewed/angled pages, and the student sees and can crop the preview. HEIC photos are converted in the browser; PDFs show page 1 (with a page picker) as an image.

## What the student sees

1. **Onboarding** (`/onboarding`, after sign-up, before planner/checker): intro screen with the supplied copy, progress "Step 1 of 3".
   - Step 1 Add subjects: manual (name, optional board, optional level), import a contents page, or pick existing subjects. Edit/delete; need at least one.
   - Step 2 Topics and content: one card per subject with topic/item counts and actions Import from a Contents Page, Add Topic Manually, Edit Subject, Remove Subject. A subject can be skipped if another has content.
   - Step 3 Review and finish: expandable overview with the supplied message; "Save and Finish Setup" needs 1 subject, 1 topic, 1 item. Then goes to the existing start page (plan or setup). No sessions or priorities are created.
2. **Import panel** (slide-over, stays inside the flow): drag-and-drop / upload / take photo (JPG, PNG, HEIC, PDF) > preview with Rotate Left/Right, Reset, Crop > "Extract Topics" > editable review (edit, delete, add, drag to reorder, move items between topics, uncertain text highlighted, back to image, cancel) > "Choose Topics to Add" (unchecked by default, select all/clear all, "3 of 8 Topics selected", "Add 3 Selected Topics"). Nothing is saved until then; cancelling deletes the upload.
3. **My Topic Library** (`/library`): same subject cards and editors after onboarding; view original source file; delete warns if the topic is used in future planned sessions and offers "Remove from future sessions only".
4. **"Manage Subjects and Topics"** button on the Knowledge Checker and Revision Planner pages.

## Technical details

- Migration (additive): `library_subjects` (user_id, name, exam_board, qualification_level, timestamps), `library_topics` (subject_id, user_id, title, position, source_type enum image/pdf/manual, source_path, timestamps), `library_items` (topic_id, user_id, title, position, uncertain bool, timestamps); `profiles.onboarding_completed_at`; nullable `library_topic_id` on `plan_topics`, `library_item_id` on `plan_subtopics`. GRANTs + RLS `user_id = auth.uid()`. Updated-at trigger.
- Private storage bucket `topic-sources`, path `<user_id>/...`, owner-only policies; uploads removed on cancel.
- Server function `extractTopics` (authenticated) sends the prepared image to Lovable AI (Gemini vision) with the strict extraction rules and a structured tool schema returning `{ topics: [{ title, items[] }] }` plus a separate uncertain-text list and detected rotation; enforces the exclusions again server-side (drops lines starting "Revision", Practical Skills, Working Scientifically, non-"Topic" headings, page numbers).
- Client: canvas-based rotate/crop/contrast, `heic2any` for HEIC, `pdfjs-dist` for PDF page render, `@dnd-kit` for drag reordering.
- Onboarding gate in `/auth` redirect and `/plan`, `/setup`, `/knowledge-checker` (redirect to `/onboarding` when not completed and no plans exist).
- Setup wizard: new topic source "My Topic Library" copies selected library topics/items into `plan_topics`/`plan_subtopics` with link ids; existing sources unchanged. `scheduling.ts`, `leitner.ts`, `mastery.ts` untouched.
- Library edits propagate titles to linked future plan topics only; completed sessions keep their stored `topic_text`.
