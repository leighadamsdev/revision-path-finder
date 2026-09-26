import { masteryScore, subjectRatings } from "@/lib/mastery";
import { averageConfidence, confidenceBand, confidenceTone } from "@/lib/confidence";
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
          const ratings = subjectRatings(subject.id, topics, subtopics);
          const confidence = averageConfidence(ratings.length ? ratings : [subject.confidence]);
          const band = confidenceBand(confidence == null ? null : Math.round(confidence));
          const tone = confidenceTone(confidence == null ? null : Math.round(confidence));
          const confidenceLabel = band === "red" ? "Low confidence" : band === "amber" ? "Building confidence" : band === "green" ? "High confidence" : "Not rated";
          const r = 14;
          const c = 2 * Math.PI * r;
          return (
            <div
              key={subject.id}
              className="flex min-w-[168px] items-center gap-2.5 rounded-[8px] bg-card px-3 py-2 ring-1 ring-border/60"
              title={`${subject.name}: ${score}% mastery · ${confidenceLabel}${confidence == null ? "" : ` (${confidence}/5)`}`}
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
                <p className="text-[11px] font-bold text-muted-foreground">{score}% mastery</p>
                <p className={`mt-0.5 flex items-center gap-1 text-[11px] font-extrabold ${tone.text}`}>
                  <span className={`size-2 shrink-0 rounded-full ${tone.fill}`} />
                  {confidenceLabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
