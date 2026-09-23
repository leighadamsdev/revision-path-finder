# Topic-level confidence, exam-date uploads, intensity and holidays

## 1. Confidence colours

Ratings become traffic-light coloured everywhere they appear (setup, edit plan, timetable, progress):

- 1 and 2 — red
- 3 and 4 — amber
- 5 — green

The dots keep their current calm, rounded style; only the colour changes. New red/amber/green tokens are added alongside the existing teal and mint so nothing is hardcoded.

## 2. Confidence per topic, not per subject

- The single "How confident are you?" control per subject is removed.
- When a student ticks topics for a subject, each ticked topic gets its own 1–5 rating, left blank by default.
- Topic ratings drive the schedule: shaky topics come round more often and earlier; solid ones get fewer sessions. This works together with the existing exam-date weighting.
- Topic ratings can be changed later from Edit plan, and stay with the plan when it is rebuilt.

## 3. Subject-only fallback

If a student picks no specific topics for a subject, they are asked to rate the subject as a whole instead, and that subject's sessions are planned at subject level exactly as they are today.

## 4. Exam dates from a document

On the exam-dates step and in Edit plan, students can:

- upload their exam timetable (PDF, Word or photo) and have the dates read out of it, shown for review before anything is saved — each detected date matched to a subject, unmatched ones listed so they can be assigned or ignored;
- or type dates in manually, as now;
- and edit or clear any date afterwards, however it arrived.

## 5. Revision intensity before exams

A new optional setting: "In the final N weeks before my first exam, study this much." The student picks the number of weeks (1–8) and the sessions per day for that stretch. Those weeks are built with the heavier (or lighter) pattern, the rest of the plan keeps the normal one.

## 6. Holiday plan

An optional list of holiday periods, entered by hand (name, first day, last day). Each period gets its own daily pattern — days of the week and sessions per day — defaulting to a normal school day's amount. Sessions falling inside a holiday period follow that pattern instead of the term-time one. Periods can be added, edited and removed at any time from setup and Edit plan.

## Technical details

- Migration: new `plan_topics` table (plan_id, subject_id, topic, confidence, is_priority, position) with GRANTs and owner-scoped RLS via the plan's profile; `plans` gains `intensity_weeks`, `intensity_sessions_per_day`, and `holiday_periods` (jsonb, default `[]`). `plan_subjects.confidence` stays for the subject-only fallback. Types regenerated.
- `src/lib/scheduling.ts`: `SubjectWeighting` gains optional `topics: Array<{ topic: string; confidence: number | null }>`; subject weight becomes the mean of its topic weights when topics exist, otherwise the existing subject confidence weight. Topic ordering inside a subject sorts by confidence ascending with priorities first.
- `src/lib/plan.ts`: `PlanDraft` gains `topicConfidence`, `intensity`, `holidays`; `buildSchedule` builds each week's day slots from a resolver that picks term-time, intensity-window or holiday pattern for each calendar date (using `start_date` + week + weekday), so slot counts vary per week. `createPlan`, `savePlanSubjects`, `regeneratePlanSessions`, `updatePlanSettings` read and write the new fields; topic pools come from `plan_topics` when present.
- New server fn `extractExamDates` in `src/lib/revision.functions.ts` (same Lovable AI pattern as `parseOptionsBooklet`) returning `{ subject, date, paper }[]`, with a review UI component before commit.
- New shared `confidenceTone(value)` helper for the traffic-light classes, used by `ConfidencePicker` and the read-only dots in the timetable, print and share views.
- UI touch points: `setup.tsx` (topic ratings, upload + review, intensity, holidays), `edit-plan.tsx` (same controls), `plan.tsx` / `progress.tsx` / `print-plan.tsx` / `share.$token.tsx` (colours and any subject-confidence references).
- Verify with Playwright in the preview: create a plan with mixed topic ratings, upload a sample timetable, set a 4-week intensity window and one holiday, then check the generated weeks and the printable view.
