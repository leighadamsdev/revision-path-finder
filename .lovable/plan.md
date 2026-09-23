# Update app navigation

## Changes
- Move the signed-in navigation from the fixed bottom bar into the shared top area so it appears consistently across all signed-in pages.
- Rename **Sites** to **Revision links** and **Exams** to **Exam timetable**.
- Remove **Progress** from navigation and delete the Progress page.
- Make the rev.plan logo a clear Home link to the timetable, and add a labelled back button on inner pages where returning is useful.
- Keep the navigation compact and horizontally scrollable on small screens so every link remains accessible.

## Verification
- Check all affected routes for broken links and confirm desktop and mobile navigation render without overlap.
- Confirm `/progress` is no longer part of the app and the current build is clean.
