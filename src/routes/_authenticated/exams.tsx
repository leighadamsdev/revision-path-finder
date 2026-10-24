import { PremiumPage } from "@/components/PremiumPage";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExamsEditor } from "@/components/ExamsEditor";
import { useExams } from "@/hooks/useActivePlan";
import { examKindLabel } from "@/lib/exams";
import {
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useActivePlan, usePlanSubjects } from "@/hooks/useActivePlan";
import { subjectStyle } from "@/lib/subjects";

export const Route = createFileRoute("/_authenticated/exams")({
  head: () => ({
    meta: [
      { title: "Exam timetable — RevPlan" },
      {
        name: "description",
        content:
          "A month-by-month calendar of your GCSE exams: see which exam falls on which day and how long you have left.",
      },
      { property: "og:title", content: "Exam timetable — RevPlan" },
      {
        property: "og:description",
        content: "See which exam is on which day, month by month.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PremiumPage feature="The exam timetable">
      <ExamCalendarPage />
    </PremiumPage>
  ),
});

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ExamCalendarPage() {
  const { plan, isLoading } = useActivePlan();
  const subjectsQuery = usePlanSubjects(plan?.id);
  const subjects = subjectsQuery.data ?? [];

  const examRows = useExams(plan?.id).data ?? [];
  const exams = useMemo(
    () =>
      examRows
        .map((exam) => {
          const subject = subjects.find((s) => s.id === exam.subject_id);
          const count = examRows.filter((e) => e.subject_id === exam.subject_id).length;
          return {
            key: exam.id,
            name: subject?.name ?? "Subject",
            paper: [
              exam.label || (count > 1 ? `Paper ${exam.paper_no}` : null),
              examKindLabel(exam.kind),
              exam.kind === "final" && !exam.verified ? "unconfirmed" : null,
            ]
              .filter(Boolean)
              .join(" · "),
            colorKey: subject?.color_key ?? "media",
            date: parseISO(exam.exam_date),
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime()),
    [examRows, subjects],
  );

  const firstUpcoming = exams.find((exam) => differenceInCalendarDays(exam.date, new Date()) >= 0);
  const [month, setMonth] = useState<Date | null>(null);
  const [editing, setEditing] = useState(false);
  const shown = month ?? startOfMonth(firstUpcoming?.date ?? exams[0]?.date ?? new Date());

  const gridDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(shown), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(shown), { weekStartsOn: 1 }),
  });

  if (isLoading || (plan && subjectsQuery.isLoading)) {
    return (
      <AppShell>
        <div className="space-y-3" aria-label="Checking for your plan">
          <p className="text-sm font-semibold text-muted-foreground">Checking for your plan…</p>
          <div className="h-24 animate-pulse rounded-[8px] bg-card" />
        </div>
      </AppShell>
    );
  }

  if (!plan) {
    return (
      <AppShell>
        <div className="rounded-[8px] bg-card p-6 ring-1 ring-border">
          <h1 className="text-lg font-extrabold">Create your plan first</h1>
          <p className="mt-2 text-[13px] font-medium text-muted-foreground">Create a plan first so RevPlan knows your subjects and exam dates.</p>
          <Button asChild className="mt-5"><Link to="/setup">Start setup</Link></Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Exam timetable</h1>
            <p className="mt-1 text-[13px] font-medium text-muted-foreground">
              Every exam date you've added, laid out day by day.
            </p>
          </div>
          <Button variant="outline" onClick={() => setEditing((v) => !v)}>
            {editing ? "Close" : exams.length ? "Add mocks or change exams" : "Add exams"}
          </Button>
        </div>

        {editing || (exams.length === 0 && subjects.length > 0) ? (
          <ExamsEditor planId={plan.id} subjects={subjects} onDone={() => setEditing(false)} />
        ) : null}

        {exams.length === 0 ? (
          subjects.length > 0 ? null : <div className="mt-5 rounded-[16px] bg-card p-6 text-center ring-1 ring-black/5">
            <CalendarDays className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 text-sm font-extrabold tracking-tight">No exam dates yet</p>
            <p className="mx-auto mt-1 max-w-[42ch] text-[13px] font-medium text-muted-foreground">
              Choose each subject's exam board and your summer 2027 exams are added from the official timetable.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-5 rounded-[16px] bg-card p-4 ring-1 ring-black/5 sm:p-5">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => setMonth(addMonths(shown, -1))}
                  className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-background"
                >
                  <ChevronLeft className="size-4" strokeWidth={2.5} />
                </button>
                <p className="text-sm font-extrabold tracking-tight">
                  {format(shown, "MMMM yyyy")}
                </p>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => setMonth(addMonths(shown, 1))}
                  className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-background"
                >
                  <ChevronRight className="size-4" strokeWidth={2.5} />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-1">
                {WEEK_LABELS.map((label) => (
                  <p
                    key={label}
                    className="pb-1 text-center text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground"
                  >
                    {label.slice(0, 1)}
                  </p>
                ))}
                {gridDays.map((day) => {
                  const dayExams = exams.filter((exam) => isSameDay(exam.date, day));
                  const outside = !isSameMonth(day, shown);
                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[62px] rounded-[10px] p-1.5 ring-1 ${
                        dayExams.length
                          ? "bg-background ring-border"
                          : "bg-background/40 ring-transparent"
                      } ${outside ? "opacity-40" : ""}`}
                    >
                      <p
                        className={`text-[11px] tabular-nums ${
                          isToday(day)
                            ? "font-extrabold text-primary-foreground"
                            : "font-bold text-muted-foreground"
                        }`}
                      >
                        <span
                          className={
                            isToday(day)
                              ? "inline-grid size-5 place-items-center rounded-full bg-structure text-structure-foreground"
                              : ""
                          }
                        >
                          {format(day, "d")}
                        </span>
                      </p>
                      <div className="mt-1 space-y-1">
                        {dayExams.map((exam) => {
                          const style = subjectStyle(exam.colorKey);
                          const sat = differenceInCalendarDays(exam.date, new Date()) < 0;
                          return (
                            <p
                              key={exam.key}
                              title={`${exam.name}${exam.paper ? ` · ${exam.paper}` : ""}`}
                              className={`truncate rounded-[6px] px-1 py-0.5 text-[9px] font-extrabold leading-tight ${style.tag} ${
                                sat ? "opacity-50" : ""
                              }`}
                            >
                              {exam.name}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-[16px] bg-card p-4 ring-1 ring-black/5 sm:p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                All exams, soonest first
              </p>
              <ul className="mt-3 space-y-1.5">
                {exams.map((exam) => {
                  const style = subjectStyle(exam.colorKey);
                  const days = differenceInCalendarDays(exam.date, new Date());
                  return (
                    <li
                      key={exam.key}
                      className={`flex items-center gap-2.5 rounded-[12px] bg-background px-3 py-2.5 ring-1 ring-black/5 ${
                        days < 0 ? "opacity-55" : ""
                      }`}
                    >
                      <span className={`size-2 shrink-0 rounded-full ${style.dot}`} />
                      <p className="min-w-0 truncate text-[13px] font-extrabold">
                        {exam.name}
                        {exam.paper ? (
                          <span className="font-semibold text-muted-foreground">
                            {" "}
                            · {exam.paper}
                          </span>
                        ) : null}
                      </p>
                      <p className="ml-auto shrink-0 text-[12px] font-bold text-muted-foreground">
                        {format(exam.date, "EEE d MMM")}
                        {days >= 0 ? ` · ${days} ${days === 1 ? "day" : "days"}` : " · sat"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
