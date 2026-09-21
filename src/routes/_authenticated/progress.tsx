import { createFileRoute, Link } from "@tanstack/react-router";
import { differenceInCalendarDays, format, parseISO } from "date-fns";

import { AppShell } from "@/components/AppShell";
import { useActivePlan, usePlanSessions, usePlanSubjects } from "@/hooks/useActivePlan";
import { subjectStyle } from "@/lib/subjects";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({
    meta: [
      { title: "Progress — rev.plan" },
      {
        name: "description",
        content:
          "See how your revision time is split between subjects, your confidence ratings and the gaps you've noted down.",
      },
      { property: "og:title", content: "Progress — rev.plan" },
      {
        property: "og:description",
        content: "How your revision time is split, and what still needs work.",
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

  const withNotes = sessions.filter((s) => s.gap_notes.trim().length > 0);

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold tracking-tight">Progress</h1>
      <p className="mt-1 text-[13px] font-medium text-muted-foreground">
        Your time is shared out by how confident you feel and how close each exam is.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {subjects.map((subject) => {
          const own = sessions.filter((s) => s.subject_id === subject.id);
          const share = sessions.length ? Math.round((own.length / sessions.length) * 100) : 0;
          const style = subjectStyle(subject.color_key);
          const examDate = subject.exam_date ? parseISO(subject.exam_date) : null;
          const daysLeft = examDate ? differenceInCalendarDays(examDate, new Date()) : null;
          return (
            <div key={subject.id} className="rounded-[16px] bg-card p-4 ring-1 ring-black/5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${style.tag}`}
              >
                <span className={`size-1.5 rounded-full ${style.dot}`} />
                {subject.name}
              </span>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                <div className={`h-full rounded-full ${style.fill}`} style={{ width: `${share}%` }} />
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <p className="text-[13px] font-semibold text-muted-foreground">
                  {own.length} sessions · {share}% of your time
                </p>
                <p className="ml-auto text-[13px] font-extrabold">
                  {subject.confidence ? `${subject.confidence}/5` : "Not rated"}
                </p>
              </div>
              <p className="mt-1 text-[12px] font-semibold text-muted-foreground">
                {examDate
                  ? daysLeft != null && daysLeft < 0
                    ? `Exam sat ${format(examDate, "d MMM")}`
                    : `Exam ${format(examDate, "EEE d MMM")} · ${daysLeft} days`
                  : "No exam date set yet"}
              </p>
            </div>
          );
        })}
      </div>

      {subjects.length === 0 ? (
        <p className="mt-4 text-[13px] font-medium text-muted-foreground">
          No subjects yet —{" "}
          <Link to="/setup" className="font-bold underline underline-offset-2">
            build a plan
          </Link>{" "}
          to get started.
        </p>
      ) : null}

      <h2 className="mt-8 text-sm font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        Gaps you've noted
      </h2>
      <div className="mt-3 space-y-2">
        {withNotes.length === 0 ? (
          <p className="text-[13px] font-medium text-muted-foreground">
            Nothing noted yet. Jot down anything you got stuck on and it will collect here.
          </p>
        ) : (
          withNotes.map((s) => {
            const subject = subjects.find((x) => x.id === s.subject_id);
            const style = subjectStyle(subject?.color_key);
            return (
              <div
                key={s.id}
                className="flex items-start gap-3 rounded-[14px] bg-card p-3 ring-1 ring-black/5"
              >
                <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${style.dot}`} />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold">
                    {s.topic_text || "Untitled topic"}
                  </p>
                  <p className="text-[12px] font-medium text-muted-foreground">{s.gap_notes}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
                    Week {s.week_number} · {s.day_label}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
