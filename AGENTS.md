<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use the semantic light-grey, deep-navy (#14133e), and orange (#fe9a00) palette across the app so every page shares one accessible visual system.
- The planner is a 3-stage journey (Subjects & exams with five short screens, Check what I know, Choose & build) inside the existing setup route; internal step numbers stay persisted so old drafts and edit/copy journeys remain compatible.
- Left-out plan topics are stored as plan_topics rows with excluded=true (fetchPlanTopics skips them) so they can be re-included later; sub-topics are stored as "Parent › Sub" topic text so they schedule like topics.
- Keep subjects and topics in the same reusable library data, but present them on separate My Subjects and My Topics routes so students add subjects first without duplicating records.
- Any npm package an Edge Function imports must also be installed in the project (devDependency is enough) with the same version, because the sandbox type-checks Edge Function sources against the project's node_modules and a missing package fails the build even though the hosted function would resolve it itself.
