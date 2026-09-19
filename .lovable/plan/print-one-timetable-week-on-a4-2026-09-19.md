# Print one timetable week on A4

## What will change
- Add a clear **Print week** button beside the week controls.
- Print only the week currently selected, with the plan name and week number as a compact heading.
- Reformat timetable days and sessions into a dense, readable A4 layout while keeping subject colours visible.
- Hide navigation, progress summaries, editing controls, placeholders, and save indicators from paper.

## Technical details
- Use the browser's standard print dialog so students can print or save as PDF.
- Add dedicated print classes and an `@media print` stylesheet using A4 portrait sizing, controlled margins, fixed two-column day layout, smaller type, and page-break protection within sessions.
- Keep the normal mobile and desktop timetable unchanged.
- Verify the current week appears alone and fits on one A4 sheet in print preview.
