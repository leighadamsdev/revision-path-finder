# Interactive Revision Knowledge Checker Guide

## Goal
Replace the current Revision Help content with a short, student-friendly walkthrough based on the uploaded RevPlan Knowledge Checker worksheet, while keeping the existing site navigation and rev.plan identity.

## What will change
- Rework `/revision-help` around the worksheet’s three-stage routine: set headings, closed-book brain dump, then open-book gap checking.
- Add a clickable three-step switcher with concise do/don’t guidance and clear active-state feedback.
- Add an interactive sample Biology row that switches between closed-book recall and highlighted open-book gaps, with a live secure-item/gap count and priority label.
- Explain retrieval practice, metacognition, and targeted keyword revision in short, GCSE-friendly sections.
- Add a “Myth vs. Science” comparison between repeated re-reading and one brain dump plus gap check.
- Keep the closing planner call-to-action and the full shared top navigation.

## Visual direction
- Use the worksheet palette through semantic site tokens: deep petrol teal `#0E333D`, mint-aqua `#94D8CA`, white/near-white surfaces, soft grey borders, and yellow only for identified gaps.
- Preserve the app’s rounded, calm, mobile-first style and existing sans-serif typography.
- Use restrained motion for step changes and revealed highlighted gaps, respecting reduced-motion preferences.

## Technical details
- Implement the guide as focused React components within the existing Revision Help route.
- Add semantic Knowledge Checker and highlight tokens to the global design system rather than hardcoding colours in page markup.
- Keep all interactions local to the page; no account, data, or scheduling changes.
- Retain unique page metadata for search and sharing.
- Verify desktop and mobile layouts, interactions, console output, and the latest preview build status.
