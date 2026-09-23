# Update app navigation

## Changes
- Move the signed-in navigation from the fixed bottom bar into the shared top area so it appears consistently across all signed-in pages.
- Rename **Sites** to **Revision links** and **Exams** to **Exam timetable**.
- Remove **Progress** from navigation and delete the Progress page.
- Add a clear **Home** link to the timetable in the shared top navigation, and make the rev.plan logo return home too.
- Keep the navigation compact and horizontally scrollable on small screens so every link remains accessible.
- Add **Revision Links** and **Revision Help** links to the public landing-page header; Revision Links will take signed-out visitors through sign-in before showing saved-plan resources.

## Verification
- Check all affected routes for broken links and confirm desktop and mobile navigation render without overlap.
- Confirm `/progress` is no longer part of the app and the current build is clean.
