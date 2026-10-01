# Five-step GCSE revision planner journey

## Goal
Turn the existing planner setup into one clear, saved five-step journey without replacing the current exams, Topic Library, Knowledge Checker, timetable, flashcards, or plan-management features.

The first step will always be enough to create a useful Quick Plan. Topics and the knowledge check remain optional, and students can return later without losing work or deleting an existing timetable.

## 1. Guided journey and saved progress

- Replace the current four-step setup screen with the requested persistent five-step progress bar:
  1. Exams and availability
  2. Add topics — Optional
  3. Knowledge check — Optional
  4. Priorities — locked until the knowledge check is completed
  5. My timetable
- Show current, completed, optional, skipped, and locked states with text as well as colour/icons.
- Keep one primary task per screen, with Back, primary action, Save and exit, and concise validation.
- Autosave the in-progress setup to the signed-in student’s account so refreshes and later visits resume safely.
- Let students reopen completed steps and explain when a change requires timetable regeneration. Never replace an existing plan without confirmation.

## 2. Step 1 — exams and availability

- Reuse the grouped GCSE subject catalogue, tier controls, optional exam-board data, per-paper exam editor, holiday settings, and current day/session controls.
- Put each selected subject in an editable card with tier, exam dates, and a required labelled subject-confidence choice: Low, Medium, or High, with red/amber/green styling and explanatory text.
- Calculate the suggested number of weeks from the earliest known exam date, while allowing a manual value when dates are unknown.
- Require at least one subject, confidence for every subject, and at least one available study day/session. Encourage but do not require exam dates.
- End with two equally prominent choices: **Create my quick timetable** or **Make my plan more personalised**.

## 3. Quick Plan

- Fix the existing quick-plan path so it uses subject confidence rather than skipping confidence.
- Create the timetable immediately after Step 1 and label it **Quick Plan**.
- Schedule subject-level sessions only, weighted by confidence, exam urgency, available days, session count/duration, and holidays.
- Show the supplied Quick Plan explanation and a **Personalise my timetable** action that resumes at Step 2 while preserving the existing plan.

## 4. Step 2 — optional topics

- Reuse the Topic Library and current upload/manual tools: topic list, contents-page image/document, or manual entry.
- Keep extracted topics in an editable review before saving, including rename, remove, reorder, add, and uncertainty handling.
- Work one subject at a time and preserve unfinished work.
- Offer **Check what I know**, **Create my timetable now**, and **Save and finish later**.
- Creating here produces a **Topic Plan**: topic-level sessions distributed broadly, with subject confidence and exam dates controlling frequency.

## 5. Step 3 — optional knowledge check

- Add a focused subject-by-subject/topic-by-topic confidence check inside the planner journey, reusing the existing confidence controls and saved topic data.
- Use the requested three labelled choices: red “I do not know this yet”, amber “I partly understand this”, green “I feel confident with this”.
- Save progress after every answer and allow any order or multiple visits.
- **Skip for now** goes directly to the timetable and records a skipped state; **Finish knowledge check** unlocks priorities.
- Keep the existing detailed Knowledge Checker page and saved-checker library unchanged; link to it as an optional deeper exercise rather than replacing it.

## 6. Step 4 — review priorities

- Add the conditional priorities screen only after the guided knowledge check is complete.
- Rank topics using confidence, exam proximity, and available time; divide them into High priority, Medium priority, and Maintain confidence.
- Show the subject, topic, confidence label, ranking, and a plain-language reason.
- Let students move topics up/down, mark more/less important, temporarily exclude them, change confidence, or return to topics/availability.
- Generate a **Personalised Plan** from the reviewed order.

## 7. Step 5 — timetable and plan types

- Display the plan type and matching explanation: Quick Plan, Topic Plan, or Personalised Plan.
- Keep the current weekly navigation, dated sessions, countdown, confidence/mastery, flashcard review, printing, sharing, and plan selector.
- Add a compact session view that shows date, duration, subject, topic where known, recommended activity, and priority.
- Add safe session controls for move/reschedule, delete, add extra, change duration, complete, and missed. Confirm destructive or regeneration actions.
- Preserve completed sessions during regeneration and clearly preview what will change.
- Keep the existing urgency, confidence, spaced-review, holiday, and subject-balancing rules; use subject-level scheduling for Quick Plans and topic-level scheduling only when topics exist.

## Data and technical changes

- Extend `plans` with plan type and journey status fields; add a private per-user setup-draft table for autosaved wizard data and skipped/completed step states. Every new table gets authenticated/service grants and owner-scoped access rules.
- Extend `plan_topics` with explicit manual priority ordering/weight and temporary exclusion state.
- Extend `sessions` with scheduled date/time metadata, recommended activity, explicit priority, and missed/rescheduled state while retaining existing completed sessions and notes.
- Reuse `plan_subjects`, `exams`, `exam_topics`, Topic Library tables, Knowledge Checker storage, flashcards, and existing plan rows rather than replacing them.
- Update scheduling so all three plan types share the current engine but use only the information legitimately available for that type.
- Break the large setup screen into focused reusable step components while keeping `/setup` as the existing entry point and using URL step state for back/forward navigation.
- Fix the current root error-boundary type regression before verification so the updated app starts cleanly.

## Verification

- Test a Quick Plan with no topics or exam dates, a Topic Plan with uploaded/manual topics, and a Personalised Plan with completed confidence ratings and reordered priorities.
- Confirm refresh/resume, Save and exit, skipped and locked states, returning to earlier steps, and upgrading a Quick Plan without losing it.
- Verify add/move/delete/miss/complete session actions and regeneration preserving completed sessions.
- Check the full journey at mobile and desktop sizes, including validation, loading, empty, success, and error states.
