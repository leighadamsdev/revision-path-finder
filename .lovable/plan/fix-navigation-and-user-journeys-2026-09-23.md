# Fix navigation and user journeys

## Navigation and access
- Standardise public and signed-in labels, rename the signed-in home to **My plan**, and identify `/revision-help` clearly as the **Knowledge Checker Guide**.
- Keep Past Papers and Revision Links useful before sign-in by moving them to public routes, while showing signed-in visitors their chosen subjects first and the full catalogue below.
- Replace crowded mobile navigation with four primary destinations plus a **More** menu containing the remaining pages and sign-out.
- Make plan creation labels state-aware: **Create plan** without a plan and **Create another plan** when one already exists.

## Sign-in journey and empty states
- Carry a safe `returnTo` and entry context through sign-in, including contextual headings and opening account creation directly from every create-plan action.
- After authentication, return to the intended safe page; when no destination was supplied, send users with no plan to setup and users with a plan to My plan.
- Add direct setup actions for empty Edit Plan, Exam Timetable, and Print Plan views, while preserving clear no-plan explanations.
- Keep exam dates sourced from the active plan so the timetable and countdown remain consistent.

## Page flow and safety
- Add state-aware closing actions to Revision Tools and the Knowledge Checker, plus a secondary Effective Revision link on the homepage and the requested “upload” wording.
- Separate plan deletion from everyday actions and require typing the plan name before deletion.
- Explain every disabled setup continuation, state that generating creates another selectable plan when plans already exist, and block invalid holiday date ranges with inline feedback.
- Replace plain plan-loading text and premature zero counts with stable checking/skeleton states.
- Let long session topics expand without clipping or losing editability.

## Verification
- Test logged-out home, create-account context, protected Exam Timetable return, and all no-plan paths.
- Test signed-in plan exam dates, reference-page ordering, delete confirmation, setup guidance, and holiday validation.
- Check desktop and 390px layouts for readable navigation, visible setup actions, and uncrowded plan actions.
- Confirm all content routes retain unique metadata and the preview build has no errors.

## Technical details
- Preserve TanStack file-based routing and the existing Lovable Cloud authentication gate; validate `returnTo` against local app paths before navigation.
- Move protected reference route files rather than duplicating route IDs, and render signed-in/public shells based on the current session.
- Reuse existing query and plan hooks so private planner data remains protected while catalogue content remains public.
