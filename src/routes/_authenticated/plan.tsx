import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { SessionCard } from "@/components/SessionCard";
import { Button } from "@/components/ui/button";
import { useActivePlan, usePlanSessions, usePlanSubjects } from "@/hooks/useActivePlan";
import type { SessionRow } from "@/lib/plan";
import { subjectStyle } from "@/lib/subjects";

export const Route = createFileRoute("/_authenticated/plan")({
  head: () => ({
    meta: [
      { title: "Your timetable — RevisionPath" },
      {
        name: "description",
        content:
          "Your week-by-week GCSE revision timetable: today's sessions, topics, confidence ratings and gaps to revisit.",
      },
      { property: "og:title", content: "Your timetable — RevisionPath" },
      {
        property: "og:description",
        content: "Your week-by-week GCSE revision timetable with confidence ratings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TimetablePage,
});

function TimetablePage() {
  const { plan, isLoading } = useActivePlan();
  const [week, setWeek] = useState(1);
  const subjectsQuery = usePlanSubjects(plan?.id);
  const sessionsQuery = usePlanSessions(plan?.id);
  const queryClient = useQueryClient();

  const subjects = subjectsQuery.data ?? [];
  const sessions = sessionsQuery.data ?? [];

  const weekSessions = useMemo(
    () => sessions.filter((s) => s.week_number === week),
    [sessions, week],
  );

  const days = plan?.study_days ?? [];
  const rated = weekSessions.filter((s) => s.confidence != null).length;
  const pct = weekSessions.length ? Math.round((rated / weekSessions.length) * 100) : 0;
  const lowConfidence = sessions.filter((s) => (s.confidence ?? 5) <= 2 && s.confidence != null);

  useEffect(() => {
    function fitWeekToPage() {
      const sheet = document.querySelector<HTMLElement>(".print-week-sheet");
      if (!sheet) return;
      sheet.style.zoom = "1";
      const pixelsPerMillimetre = 96 / 25.4;
      const printableWidth = 193 * pixelsPerMillimetre;
      const printableHeight = 280 * pixelsPerMillimetre;
      const scale = Math.min(
        1,
        printableWidth / sheet.scrollWidth,
        printableHeight / sheet.scrollHeight,
      );
      sheet.style.zoom = String(scale);
    }

    function resetPrintScale() {
      const sheet = document.querySelector<HTMLElement>(".print-week-sheet");
      if (sheet) sheet.style.removeProperty("zoom");
    }

    window.addEventListener("beforeprint", fitWeekToPage);
    window.addEventListener("afterprint", resetPrintScale);
    return () => {
      window.removeEventListener("beforeprint", fitWeekToPage);
      window.removeEventListener("afterprint", resetPrintScale);
    };
  }, [week, weekSessions.length]);

  function patchSession(id: string, patch: Partial<SessionRow>) {
    queryClient.setQueryData<SessionRow[]>(["sessions", plan?.id], (old) =>
      (old ?? []).map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  }

  if (isLoading) {
    return (
      <AppShell>
        <p className="text-sm font-semibold text-muted-foreground">Loading your plan…</p>
      </AppShell>
    );
  }

  if (!plan) {
    return (
      <AppShell>
        <div className="rounded-[16px] bg-card p-6 ring-1 ring-black/5">
          <p className="text-lg font-extrabold tracking-tight">Let's build your first plan</p>
          <p className="mt-2 max-w-[46ch] text-[13px] font-medium leading-relaxed text-muted-foreground">
            It takes about a minute: pick your subjects and exam boards, say how long you've got,
            and choose how topics get filled in.
          </p>
          <Link
            to="/setup"
            className="mt-5 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground"
          >
            Start setup
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      headerCentre={
        <div className="flex items-center gap-1 rounded-full bg-card p-1 ring-1 ring-black/5">
          <button
            onClick={() => setWeek((w) => Math.max(1, w - 1))}
            aria-label="Previous week"
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-background"
          >
            <ChevronLeft className="size-4" strokeWidth={2.5} />
          </button>
          <div className="min-w-[78px] px-2 text-center">
            <p className="text-[13px] font-extrabold leading-none">Week {week}</p>
            <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground">
              of {plan.weeks}
            </p>
          </div>
          <button
            onClick={() => setWeek((w) => Math.min(plan.weeks, w + 1))}
            aria-label="Next week"
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-background"
          >
            <ChevronRight className="size-4" strokeWidth={2.5} />
          </button>
        </div>
      }
    >
      <div className="mb-5 flex items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Week {week}</h1>
          <p className="text-[13px] font-semibold text-muted-foreground">{plan.name}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            window.dispatchEvent(new Event("beforeprint"));
            window.print();
          }}
        >
          <Printer aria-hidden="true" />
          Print week
        </Button>
      </div>

      <section className="mb-7 print:hidden">
        <div className="rounded-[16px] bg-card p-4 ring-1 ring-black/5 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-extrabold tracking-tight">This week</p>
                <p className="text-sm font-extrabold tabular-nums">
                  {pct}% <span className="font-semibold text-muted-foreground">rated</span>
                </p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
                <div className="h-full rounded-full bg-sci" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-[13px] font-medium text-muted-foreground">
                {rated} of {weekSessions.length} sessions rated · {lowConfidence.length}{" "}
                low-confidence to revisit
              </p>
            </div>
            <div className="sm:max-w-[220px] sm:border-l sm:border-border sm:pl-6">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                Revisit soon
              </p>
              {lowConfidence.length === 0 ? (
                <p className="text-[13px] font-medium text-muted-foreground">
                  Nothing flagged yet.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {lowConfidence.slice(0, 3).map((s) => {
                    const subject = subjects.find((x) => x.id === s.subject_id);
                    const style = subjectStyle(subject?.color_key);
                    return (
                      <li key={s.id} className="flex items-center gap-2 text-[13px] font-semibold">
                        <span className={`size-2 shrink-0 rounded-full ${style.dot}`} />
                        <span className="truncate">{s.topic_text || "Untitled topic"}</span>
                        <span className={`ml-auto text-[11px] font-extrabold ${style.text}`}>
                          {s.confidence}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="print-week-sheet">
        <header className="print-week-heading hidden">
          <div>
            <p className="print-brand">RevisionPath</p>
            <h1>{plan.name}</h1>
          </div>
          <p>Week {week} of {plan.weeks}</p>
        </header>

        <div key={week} className="print-week-grid week-in grid grid-cols-1 gap-4 md:grid-cols-2">
          {days.map((day) => {
          const daySessions = weekSessions
            .filter((s) => s.day_label === day)
            .sort((a, b) => a.session_slot - b.session_slot);
          if (daySessions.length === 0) return null;
          return (
            <section key={day} className="print-day rounded-[16px] bg-card p-3 ring-1 ring-black/5 sm:p-4">
              <div className="print-day-heading mb-2 flex items-center justify-between px-1">
                <p className="text-sm font-extrabold tracking-tight">{day}</p>
                <p className="text-[11px] font-bold text-muted-foreground">
                  {daySessions.length} {daySessions.length === 1 ? "session" : "sessions"}
                </p>
              </div>
              <div className="space-y-3">
                {daySessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    subject={subjects.find((s) => s.id === session.subject_id)}
                    minutes={session.length_minutes ?? plan.session_length_minutes}
                    onChanged={(patch) => patchSession(session.id, patch)}
                  />
                ))}
              </div>
            </section>
          );
          })}
        </div>
      </div>
    </AppShell>
  );
}
