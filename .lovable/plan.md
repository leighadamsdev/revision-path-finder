# Extend rev.plan: exams, scope, Leitner, prioritisation, mastery, digest

Everything that works today stays. Nothing is deleted or renamed; new data sits alongside the old and old fields keep working as fallbacks.

## What already exists (and will be extended, not duplicated)

| Your list | Current state | Approach |
|---|---|---|
| "Weeks until exam" | Already replaced by plan start date + up to 3 exam dates per subject (Exam timetable page, setup) | Extend each date into a proper "exam" with type (mock/final) and its own topic scope |
| Two 45-min sessions/day | Already configurable: study days, sessions per day, minutes, per-day overrides | Keep; add weekly time budget |
| Holiday / pre-exam boost | Already exists as holiday periods and a "final N weeks" intensity setting | Keep; add simple on/off toggles that map onto these, default 4 weeks |
| Confidence 1–5 + red/amber/green | Already per topic, traffic-light colours in place | Add Likert labels (1 = not confident at all, 5 = very confident) and band chips everywhere |
| Gaps note, confidence before/after | On each session | Keep; completing a session drives flashcards |
| Weak topics come back | Weighting in the scheduler | Replaced in place by the new prioritisation engine |
| Knowledge Checker flashcards | Browser-only, separate page | Stays as is; the new Leitner cards live in the plan (see conflict 3) |

## Conflicts to flag

1. **No subtopics exist.** Topic lists are flat. I will add a light optional subtopic layer: each topic can hold subtopics (typed or AI-suggested). Where none exist, the topic itself acts as its single subtopic, so ratings and cards still work.
2. **Exam dates are currently three plain date columns per subject.** I will move them into a new exams list, copy existing dates across as finals-or-mocks (marked "untagged, please confirm"), and keep the old columns updated so print, share and countdown keep working.
3. **Knowledge Checker has its own flashcards (stored only in the browser).** I won't merge them. Leitner cards are auto-created from ratings; I'll add a "send gaps to my plan's flashcards" button later if you want.
4. **Final exam dates need an admin list.** A new admin-managed list of official papers (subject, board, tier, paper, date). Students pick from it; if their paper isn't listed they can ask to type it, marked as unverified. I'll seed it empty — you'll need to supply the real 2027 dates.
5. **Weekly digest email needs a domain you own.** Emails can't send until one is set up; I'll build everything and prompt you for the domain.
6. **Schools list** — I'll create an admin-editable list with a few placeholder schools; please send the real ones.

## Build order (phases, each usable on its own)

1. **Exams + scope**: mock/final exams per subject (up to 3 papers each), finals picked from the admin list, tick which topics each exam covers.
2. **Bands + subtopics**: Likert labels, band chips, subtopic layer and per-subtopic ratings.
3. **Leitner**: cards for subtopics rated 1–4; Box 1 daily, Box 2 weekly, Box 3 fortnightly, Bench. Wrong answer back to Box 1. Bench wakes on lowered rating, occasional random decay card, or once when a linked exam is 4 weeks away. Card reviews appear as short blocks inside the day view.
4. **Prioritisation engine**: urgency 1.0 beyond 28 days, rising linearly to 4.0 on exam day; score = weakness (red 3, amber 2, green 0.5) × urgency; exams within 72 hours pinned to the top with bumped items sliding to the next day; weekly subject share proportional with a floor of 1 session and a 45% cap; topics interleaved within sessions.
5. **Capacity + pace prompt**: weekly time budget, the two boost toggles, and "You're behind pace for [subject] — add a session?" (accept/dismiss, max 2 per week).
6. **Completion + mastery**: "Mark session complete" button; per-subject mastery ring (bands + card box spread) on the plan page and Exam timetable.
7. **Account + digest**: school dropdown on signup, optional parent email in settings, weekly digest (sessions done vs planned, mastery trend, exam countdown) to student and parent.

## Technical details

New tables (all with GRANTs + owner-scoped RLS; reference tables admin-write):
- `exams` (plan_id, subject_id, paper_no 1–3, kind mock|final, exam_date, official_exam_id nullable, verified bool)
- `official_exams` (subject_id, exam_board, tier, paper, exam_date, series) — admin-managed
- `exam_topics` (exam_id, plan_topic_id) — scope, reusing `plan_topics`
- `plan_subtopics` (plan_topic_id, name, confidence, position)
- `flashcards` (plan_id, subtopic_id, box 1|2|3|bench, due_on, last_reviewed_at, correct_streak)
- `flashcard_reviews` (flashcard_id, session_id nullable, correct, reviewed_at)
- `pace_prompts` (plan_id, subject_id, week_start, status suggested|accepted|dismissed)
- `schools` (name) — admin-managed; `profiles` gains `school_id`, `parent_email`, `digest_opt_in`
- `sessions` gains `completed_at`, `kind` (topic|flashcards, default topic), `pinned` bool; `plans` gains `weekly_minutes_budget`, `holiday_boost`, `pre_exam_boost`, `pre_exam_weeks` default 4
- `mastery_snapshots` (plan_id, subject_id, week_start, score) for trend lines

Code:
- `src/lib/scheduling.ts` rewritten in place with `urgencyMultiplier`, `weaknessWeight`, `score`, weekly allocation with floor/cap, pin + slide logic; unit tests with vitest.
- `src/lib/plan.ts` `buildSchedule`/`regeneratePlanSessions` use exams + subtopics when present, else current behaviour.
- `src/lib/leitner.ts` (box transitions, due dates, bench reactivation), triggered from "Mark complete".
- UI extended in `setup.tsx`, `edit-plan.tsx`, `exams.tsx`, `plan.tsx`, `SessionCard.tsx`, `admin.tsx` (official exams + schools), `auth.tsx` (school field).
- Digest: Lovable app emails, one template, weekly server route triggered by a once-a-week scheduled job; parent copies only to the address the student entered.
