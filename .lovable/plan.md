# Add dated and editable revision plans

## What will change
- Remove the exam-board selection step; students choose subjects without assigning boards.
- Add a required start date when a student creates a plan.
- Calculate and show the real calendar date for every study day across all weeks.
- Include those dates in the dedicated print/PDF view.
- Add an Edit plan screen accessible from the timetable, including after printing.
- Let students change the plan name and start date without losing topics, ratings, or notes; existing inline topic, confidence, and gap editing remains available.

## Technical details
- Keep the existing subject records compatible while removing board selection and board labels from the student experience.
- Store `start_date` on each plan in Lovable Cloud, defaulting existing plans to their creation date.
- Derive session dates from the start date, week number, and selected weekday so dates stay consistent without duplicating data.
- Update plan queries and types, add a date picker to setup/editing, and refresh cached plan data after saving.
- Verify the timetable, edit flow, and printable view on desktop and mobile, then check the latest build status.
