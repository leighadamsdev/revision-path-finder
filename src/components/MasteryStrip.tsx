import { masteryScore } from "@/lib/mastery";
import type { Flashcard, Subtopic } from "@/lib/leitner";
import type { PlanSubject, PlanTopic } from "@/lib/plan";
import { subjectStyle } from "@/lib/subjects";

/** A small mastery ring per subject: confidence bands plus flashcard progress. */
export function MasteryStrip({
  subjects,
  topics,
  subtopics,
  cards,
}: {
  subjects: PlanSubject[];
  topics: PlanTopic[];
  subtopics: Subtopic[];
  cards: Flashcard[];
}) {
  if (!subjects.length) return null;
  return (
    <section className="mb-5 print:hidden">
      <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        Mastery
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {subjects.map((subject) => {
          const score = masteryScore(subject.id, topics, subtopics, cards, subject.confidence);
          const style = subjectStyle(subject.color_key);
          const r = 14;
          const c = 2 * Math.PI * r;
          return (
            <div
              key={subject.id}
              className="flex min-w-[148px] items-center gap-2.5 rounded-[14px] bg-card px-3 py-2 ring-1 ring-black/5"
              title={`${subject.name}: ${score}% mastery`}
            >
              <svg viewBox="0 0 36 36" className="size-9 shrink-0 -rotate-90" aria-hidden="true">
                <circle cx="18" cy="18" r={r} className="fill-none stroke-border" strokeWidth="4" />
                <circle
                  cx="18"
                  cy="18"
                  r={r}
                  className="fill-none stroke-primary"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={c}
                  strokeDashoffset={c * (1 - score / 100)}
                />
              </svg>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate text-[12px] font-extrabold">
                  <span className={`size-1.5 shrink-0 rounded-full ${style.dot}`} />
                  <span className="truncate">{subject.name}</span>
                </p>
                <p className="text-[11px] font-bold text-muted-foreground">{score}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
