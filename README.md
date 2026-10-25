# Revplan

Build a web app called RevisionPath that generates personalised GCSE revision timetables for students. It replaces a manual spreadsheet with an interactive, multi-user tool.

Core concept

Each student sets up a revision plan by choosing:

Which subjects they're studying, and the exam board for each (e.g. "Combined Science – AQA", "Maths – Edexcel")

How many weeks until their exams

How many days per week they want to study

How long each session lasts (e.g. 45 min, 1 hr)

The app then generates a week-by-week timetable of study sessions, similar in structure to a spreadsheet: each row is one session, showing the day, subject & exam board, a specific topic to cover, a confidence rating, and space to note gaps to revisit.

Users & accounts

Full authentication (sign up / log in) using Supabase Auth (email + password, and Google OAuth if easy to add).

Each student has their own account and their own saved plan(s). A student can create more than one plan (e.g. redo for mocks vs. finals) and switch between them.

Data is private to each account — one student should never see another's plan.

Setup wizard (first-run flow)

A short multi-step wizard:

Add subjects — for each, pick a subject name and exam board from a searchable list (seed with: Maths, English Language, English Literature, Combined Science: Trilogy [with Biology/Chemistry/Physics sub-strands], History, PE, Business Studies, Media Studies — each mapped to common UK exam boards: AQA, Edexcel, OCR, WJEC Eduqas). Allow adding a custom subject/board if not listed. Offer the student two ways to complete this step:

Manual pick — search/select each subject and exam board themselves, as above.

Upload options booklet — let the student upload their school's GCSE options booklet (PDF, or a photo/scan as an image) and have the app auto-detect the subjects and exam boards from it. Parse the document with an AI call: extract the raw text (OCR the file first if it's a scanned image), then prompt an LLM to return a structured JSON list of {subject, exam_board} pairs found in the document, matching each against the app's known subject/board list where possible. Show the detected list to the student as an editable, pre-ticked checklist before confirming — booklets vary a lot in layout and wording, so detection should be treated as a fast starting draft, not a silent, final answer. Let the student add anything missed or remove anything wrongly detected, and fall back gracefully to manual pick if the upload fails to parse or the file contains no recognisable subject/board information.

Set timeframe — number of weeks until exams, number of study days per week (let them pick which days, e.g. Mon/Tue/Wed/Thu + weekend), and session length.

Choose how topics are populated — this is important, offer the student a clear choice of three modes:

AI-generated: the app calls an AI model to generate a sensible, spread-out sequence of topics per subject across the available sessions, based on the subject/exam board (avoid repeating a topic, cover breadth before exams, revisit weaker areas more often once confidence ratings come in).

Manual entry: sessions are created empty (just day/slot/subject) and the student types in their own topic for each one.

Pre-built library: topics are pulled in order from a curated topic list stored in the database for that subject + exam board (seed a handful of subjects with example topic lists based on the sample data below so the mode is demonstrably working; make it easy to add more via an admin/editor view later).

Generate the plan and land on the timetable view.

Timetable view

Organised by week (tabs or an accordion — one week at a time, with next/previous navigation), then by day, then by session slot.

Each session row/card shows: subject & exam board (as a coloured tag, one colour per subject), the topic text, a confidence rating (1–5, tappable/clickable, not a plain dropdown — e.g. five small buttons or a star-style control), and a free-text "gaps to revisit" field.

Confidence and gap notes save automatically as the student edits them (no explicit save button needed, but show a subtle "saved" indicator).

Let the student regenerate a single session's topic (useful in AI or library mode) or edit any topic inline (useful in manual mode) — don't lock modes rigidly, a student in AI mode should still be able to tweak an individual session afterward.

Include a simple progress view: percentage of sessions completed/rated, and a highlighted list of low-confidence topics (rated 1–2) across all weeks, since those are the ones worth revisiting.

Past Papers tab

A reference table, one row per subject/exam board combination the student has added to their plan, showing: spec code, a link to the official past-paper portal for that board, and a link to a good free topic-question bank. Seed this with real data for the subjects/boards listed above (Edexcel Maths, AQA English Language & Literature, AQA Combined Science Trilogy, Eduqas History, Edexcel PE, OCR Business, Eduqas Media — mirror the structure of the sample data, but verify links are current rather than inventing them).

Revision Sites tab

A reference list, grouped by subject, of recommended free revision websites/YouTube channels with a one-line note on why each is useful. Same subjects as above; seed with real, currently-active resources (e.g. Maths Genie, Corbettmaths, Physics & Maths Tutor, Cognito, Mr Bruff, BBC Bitesize, Seneca Learning, Quizlet, Tutor2u). Only show entries relevant to the subjects in the student's own plan, plus a small "universal platforms" section (like PMT and Seneca) shown to everyone regardless of subject.

Data model (suggested)

profiles — one per authenticated user

subjects — name, exam_board, is_custom

plans — belongs to a profile; weeks, days_per_week, session_length_minutes, content_mode, created_at

plan_subjects — join table linking a plan to its chosen subjects

sessions — belongs to a plan; week_number, day_label, session_slot, subject_id, topic_text, confidence (1–5 or null), gap_notes

topic_library — seed data for "pre-built library" mode: subject_id, exam_board, ordered topic list

past_papers — subject_id, exam_board, spec_code, official_portal_url, free_resource_url, free_resource_name

revision_sites — subject_id (nullable for universal entries), site_name, site_url, description

AI generation

For "AI-generated" mode, use an edge function that calls an LLM with the subject, exam board, number of sessions available for that subject, and (once available) the student's confidence ratings from previous weeks, to produce a JSON list of topic strings — one per session slot. Weight topics the student rated low back into later weeks more often.

Design

Clean, encouraging, low-clutter — this is used by teenagers under exam stress, so keep it calm rather than gamified or cluttered with badges/streaks.

Mobile-friendly first: most students will check today's session on their phone.

One consistent colour per subject, used across the timetable, past papers, and revision sites tabs so subjects are visually easy to track.

Use a legible, slightly rounded sans-serif and generous whitespace over dense tables.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://revisionplan.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2e4f0b05-d403-4862-8f64-c487f1bbcae8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
