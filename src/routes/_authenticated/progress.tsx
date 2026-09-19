import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { useActivePlan, usePlanSessions, usePlanSubjects } from "@/hooks/useActivePlan";
import { subjectStyle } from "@/lib/subjects";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({
    meta: [
      { title: "Progress — RevisionPath" },
      {
        name: "description",
        content:
          "See how much of your GCSE revision plan you've rated and which topics you flagged as low confidence.",
      },
      { property: "og:title", content: "Progress — RevisionPath" },
      {
        property: "og:description",
        content: "How much of your revision plan you've rated, and what still needs work.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { plan } = useActivePlan();
  const sessions = usePlanSessions(plan?.id).data ?? [];
  const subjects = usePlanSubjects(plan?.id).data ?? [];

  const rated = sessions.filter((s) => s.confidence != null);
  const pct = sessions.length ? Math.round((rated.length / sessions.length) * 100) : 0;
  const low = rated.filter((s) => (s.confidence ?? 5) <= 2);

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold tracking-tight">Progress</h1>
      <p className="mt-1 text-[13px] font-medium text-muted-foreground">
        Rating sessions honestly is what makes the rest of the plan useful.
      </p>

      <div className="mt-5 rounded-[16px] bg-card p-5 ring-1 ring-black/5">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-extrabold tracking-tight">Sessions rated</p>
          <p className="text-2xl font-extrabold tabular-nums">{pct}%</p>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-background">
          <div className="h-full rounded-full bg-sci" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-[13px] font-medium text-muted-foreground">
          {rated.length} of {sessions.length} sessions across all {plan?.weeks ?? 0} weeks
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {subjects.map((subject) => {
          const own = sessions.filter((s) => s.subject_id === subject.id);
          const ownRated = own.filter((s) => s.confidence != null);
          const avg = ownRated.length
            ? (
                ownRated.reduce((sum, s) => sum + (s.confidence ?? 0), 0) / ownRated.length
              ).toFixed(1)
            : "—";
          const style = subjectStyle(subject.color_key);
          return (
            <div key={subject.id} className="rounded-[16px] bg-card p-4 ring-1 ring-black/5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${style.tag}`}
              >
                <span className={`size-1.5 rounded-full ${style.dot}`} />
                {subject.name} · {subject.exam_board}
              </span>
              <div className="mt-3 flex items-baseline gap-4">
                <p className="text-[13px] font-semibold text-muted-foreground">
                  {ownRated.length}/{own.length} rated
                </p>
                <p className="ml-auto text-[13px] font-extrabold">Avg {avg}/5</p>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mt-8 text-sm font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        Worth revisiting (rated 1–2)
      </h2>
      <div className="mt-3 space-y-2">
        {low.length === 0 ? (
          <p className="text-[13px] font-medium text-muted-foreground">
            Nothing rated 1 or 2 yet. Rate a few sessions and anything shaky will collect here.
          </p>
        ) : (
          low.map((s) => {
            const subject = subjects.find((x) => x.id === s.subject_id);
            const style = subjectStyle(subject?.color_key);
            return (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-[14px] bg-card p-3 ring-1 ring-black/5"
              >
                <span className={`size-2.5 shrink-0 rounded-full ${style.dot}`} />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold">
                    {s.topic_text || "Untitled topic"}
                  </p>
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Week {s.week_number} · {s.day_label}
                    {s.gap_notes ? ` · ${s.gap_notes}` : ""}
                  </p>
                </div>
                <span className={`ml-auto text-sm font-extrabold ${style.text}`}>
                  {s.confidence}/5
                </span>
              </div>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
