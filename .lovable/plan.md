# Streamlined 3-step revision planner journey

Keep all current styling, components, navy/orange branding, the existing setup page and saved drafts. This is a rework of the flow, not a rebuild.

## What the student will see

```text
Step 1  Subjects & exams      ->  Step 2  Check what I know      ->  Step 3  Choose & build
(name, pick/toggle subjects,     (edit topic list inline,          (tick subjects + topics to
 tiers, exam dates, time)          rate red/amber/green)              include, then generate)
```

**Step 1 – Subjects & exams**
- A "Your subjects" checklist at the top lists every subject saved before (from your Topic Library and past plans), each with an on/off switch. Previously used tiers and exam dates fill in automatically.
- The full GCSE list stays below for adding new subjects. Nothing has to be re-uploaded.
- The existing short screens (name, subjects, exam dates, study time, confidence, review) stay, shown as parts of Step 1.

**Step 2 – Check what I know**
- One card per included subject with its topic list (from your library, the DfE list, or typed in).
- Every topic can be renamed in place, deleted, or have sub-topics added under it; a "+ Add topic" box sits at the bottom of each list.
- Each topic and sub-topic gets the red/amber/green rating next to it.
- A "Save these changes to my Topic Library" tick (on by default) so edits carry over to future plans and knowledge checkers.
- Still optional: "Skip – build a Quick Plan" remains.

**Step 3 – Choose & build**
- One clear checklist: subjects with their topics/sub-topics underneath, all ticked by default, with "Select all / none" per subject. Rated topics show their colour.
- The existing priority ordering (move up/down) stays on this screen for ticked topics.
- A summary ("4 subjects, 23 topics, 3 sessions a week…") then "Build my timetable". The rebuild preview for edited plans stays.
- Unticked topics are saved as "left out" (not deleted), so they can be ticked back in later from Edit plan.

**Knowledge Checker page**
- The topic/key-point list in each checker becomes fully editable inline (rename, delete, add sub-points), with the same controls as Step 2.

**Progress bar** changes from 5 steps to 3, with the same look.

## Technical details
- `setup.tsx`: map existing internal step numbers onto 3 stages (Stage 1 = steps 1/4/3/8/7, Stage 2 = steps 2+5 merged, Stage 3 = step 6 + generate). Keep the persisted `step` values so old drafts still load (old step 5/6 drafts land on the matching new stage).
- `JourneyProgress.tsx`: accept 3 stages.
- New shared `EditableTopicTree` component (rename/delete/add sub-topic/add topic + RAG rating), used in Step 2 and the Knowledge Checker.
- Subject toggle list sourced from `library_subjects` plus `plan_subjects` of the user's other plans; prefill tier and dates from the most recent plan.
- Library write-back via existing `src/lib/library.ts` helpers (`library_topics` / `library_items`).
- Inclusion: reuse `plan_topics.excluded` and `plan_subtopics` (already in the database) — save unticked items with `excluded = true` instead of dropping them; scheduler already filters excluded. Add a "left out topics" toggle list to Edit plan.
- No database schema changes expected.
- Update `AGENTS.md` (3-stage rule replacing the 5-step note) and `roadmap.md`; verify with Playwright signed in on desktop and 390px mobile.
