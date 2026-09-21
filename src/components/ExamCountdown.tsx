import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { Check } from "lucide-react";

import type { PlanSubject } from "@/lib/plan";
import { subjectStyle } from "@/lib/subjects";

/** Quiet countdown to each exam the student has dated. Soonest first, sat exams ticked off. */
export function ExamCountdown({ subjects }: { subjects: PlanSubject[] }) {
  const today = new Date();
  const dated = subjects
    .filter((subject) => Boolean(subject.exam_date))
    .map((subject) => {
      const date = parseISO(subject.exam_date!);
      return { subject, date, days: differenceInCalendarDays(date, today) };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (dated.length === 0) return null;

  const upcoming = dated.filter((item) => item.days >= 0);
  const done = dated.filter((item) => item.days < 0);

  return (
    <section className="mb-5 rounded-[16px] bg-card p-4 ring-1 ring-black/5 print:hidden sm:p-5">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        Exam countdown
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {[...upcoming, ...done].map(({ subject, date, days }) => {
          const style = subjectStyle(subject.color_key);
          const sat = days < 0;
          return (
            <li
              key={subject.id}
              className={`flex min-w-[9.5rem] flex-1 items-center gap-2.5 rounded-[14px] bg-background px-3 py-2.5 ring-1 ring-black/5 sm:flex-none ${
                sat ? "opacity-55" : ""
              }`}
            >
              <span className={`size-2 shrink-0 rounded-full ${style.dot}`} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-extrabold">{subject.name}</p>
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {format(date, "EEE d MMM")}
                </p>
              </div>
              <span className="ml-auto pl-2 text-right">
                {sat ? (
                  <Check className="size-4 text-muted-foreground" strokeWidth={3} />
                ) : (
                  <>
                    <span className="block text-[15px] font-extrabold tabular-nums leading-none">
                      {days}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {days === 1 ? "day" : "days"}
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
