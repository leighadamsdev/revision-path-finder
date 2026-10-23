import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { Check } from "lucide-react";

import type { Exam } from "@/lib/exams";
import type { PlanSubject } from "@/lib/plan";
import { subjectStyle } from "@/lib/subjects";

/** Countdown that changes from a subject's colour through amber to red in the final three days. */
export function ExamCountdown({
  subjects,
  exams,
}: {
  subjects: PlanSubject[];
  /** Every paper and mock from the exam timetable; preferred over the plan's 3 dates per subject. */
  exams?: Exam[] | undefined;
}) {
  const today = new Date();
  const fromTimetable = (exams ?? []).flatMap((exam) => {
    const subject = subjects.find((s) => s.id === exam.subject_id);
    if (!subject || !exam.exam_date) return [];
    const sameSubject = (exams ?? []).filter((e) => e.subject_id === exam.subject_id);
    const name = exam.label?.trim() || (sameSubject.length > 1 ? `Paper ${exam.paper_no}` : "");
    const paper = [exam.kind === "mock" ? "Mock" : "", name].filter(Boolean).join(" ") || null;
    const date = parseISO(exam.exam_date);
    return [{ key: exam.id, subject, paper, date, days: differenceInCalendarDays(date, today) }];
  });
  const dated = (
    fromTimetable.length
      ? fromTimetable
      : subjects.flatMap((subject) =>
          subject.exam_dates.map((value, index) => {
            const date = parseISO(value);
            return {
              key: `${subject.id}-${index}`,
              subject,
              paper: subject.exam_dates.length > 1 ? `Paper ${index + 1}` : null,
              date,
              days: differenceInCalendarDays(date, today),
            };
          }),
        )
  ).sort((a, b) => a.date.getTime() - b.date.getTime());

  if (dated.length === 0) return null;

  const upcoming = dated.filter((item) => item.days >= 0);
  const done = dated.filter((item) => item.days < 0);

  return (
    <section className="mb-5 rounded-[16px] bg-card p-4 ring-1 ring-black/5 print:hidden sm:p-5">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        Exam countdown
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {[...upcoming, ...done].map(({ key, subject, paper, date, days }) => {
          const style = subjectStyle(subject.color_key);
          const sat = days < 0;
          const urgent = days >= 0 && days <= 3;
          const approaching = days > 3 && days <= 14;
          const urgencyText = urgent
            ? "text-exam-imminent"
            : approaching
              ? "text-conf-mid"
              : style.text;
          const urgencyDot = urgent ? "bg-exam-imminent" : approaching ? "bg-conf-mid" : style.dot;
          const urgencySurface = urgent
            ? "bg-exam-imminent/10 ring-exam-imminent/35"
            : approaching
              ? "bg-conf-mid/10 ring-conf-mid/30"
              : "bg-background ring-border/50";
          return (
            <li
              key={key}
              className={`flex min-w-[9.5rem] flex-1 items-center gap-2.5 rounded-[8px] px-3 py-2.5 ring-1 sm:flex-none ${urgencySurface} ${
                sat ? "opacity-55" : ""
              }`}
            >
              <span className={`size-2.5 shrink-0 rounded-full ${urgencyDot}`} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-extrabold">
                  {subject.name}
                  {paper ? (
                    <span className="font-semibold text-muted-foreground"> · {paper}</span>
                  ) : null}
                </p>
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {format(date, "EEE d MMM")}
                </p>
              </div>
              <span className={`ml-auto shrink-0 pl-2 text-right ${urgencyText}`}>
                {sat ? (
                  <Check className="size-4 text-muted-foreground" strokeWidth={3} />
                ) : (
                  <>
                    <span className="block text-[18px] font-extrabold tabular-nums leading-none">
                      {days}
                    </span>
                    <span className="text-[10px] font-extrabold">
                      {days === 0 ? "today" : days === 1 ? "day" : "days"}
                    </span>
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
