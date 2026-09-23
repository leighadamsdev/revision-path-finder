# Online and Downloadable Knowledge Checker

## Goal
Add a real Knowledge Checker students can complete online, plus a matching printable PDF worksheet they can download.

## Online checker
- Add a public `/knowledge-checker` page using the worksheet’s subject, topic and date headings.
- Let students add, rename and remove component rows.
- Give each row a large space for a closed-book brain dump, then a separate highlighted gap/correction area revealed in checking mode.
- Include a 30-minute timer with start, pause and reset controls.
- Show a live summary of secure items and highlighted gaps, with a clear next-priority message.
- Provide reset and print controls, with a confirmation before clearing work.
- Keep entered work in that browser automatically so an accidental refresh does not lose it.

## Downloadable checker
- Create a clean A4 PDF worksheet matching the uploaded RevPlan document and the app’s petrol, mint and yellow palette.
- Include subject, topic and date fields, multiple component/brain-dump rows, checking instructions and the 30-minute reminder.
- Add a prominent PDF download button on both the guide and online checker.

## Navigation and design
- Add “Knowledge Checker” to both public and signed-in top navigation.
- Keep the existing Revision Help guide available as the onboarding walkthrough.
- Use semantic design tokens and the existing button components throughout.

## Verification
- Visually inspect every PDF page after rendering it to an image.
- Test adding/removing rows, editing fields, switching to gap-check mode, timer controls, reset, browser refresh recovery, PDF download, and mobile/desktop layouts.
- Confirm page metadata and the latest preview build are healthy.
