import { format, parseISO } from "date-fns";

import {
  TIMETABLE_BOARDS,
  boardsWithExams,
  examLabel,
  sessionTime,
  timetableBoard,
  timetableExams,
  timetableSource,
  timetableVariants,
  variantLabel,
} from "@/lib/exam-timetable";

const OTHER = "Other board";

const field =
  "rounded-[10px] bg-card px-3 py-2 text-[13px] font-semibold ring-1 ring-border focus:outline-none";

/**
 * Exam board (and specification, where a board has more than one) for a subject. When the
 * board's official timetable lists the subject, its papers are shown and used automatically.
 */
export function ExamBoardTimetable({
  subject,
  tier,
  board,
  variant,
  onChange,
  showPapers = true,
}: {
  subject: string;
  tier: string | null | undefined;
  board: string;
  variant: string;
  onChange: (board: string, variant: string) => void;
  /** False when the caller lists the papers itself. */
  showPapers?: boolean;
}) {
  const known = timetableBoard(board);
  const variants = known ? timetableVariants(subject, known) : [];
  const exams = timetableExams(subject, known, tier, variant);
  const offered = boardsWithExams(subject);
  const selectValue = known ?? (board ? OTHER : "");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <label
          className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground"
          htmlFor={`board-${subject}`}
        >
          Exam board
        </label>
        <select
          id={`board-${subject}`}
          value={selectValue}
          onChange={(e) => {
            const next = e.target.value;
            const nextKnown = timetableBoard(next);
            onChange(next, nextKnown ? (timetableVariants(subject, nextKnown)[0] ?? "") : "");
          }}
          className={field}
        >
          <option value="">Choose…</option>
          {TIMETABLE_BOARDS.map((b) => (
            <option key={b} value={b}>
              {b}
              {offered.includes(b) ? "" : " (no exams listed)"}
            </option>
          ))}
          <option value={OTHER}>Other board</option>
        </select>
        {variants.length > 1 ? (
          <select
            aria-label={`Which ${subject} specification`}
            value={variant}
            onChange={(e) => onChange(board, e.target.value)}
            className={field}
          >
            {variants.map((v) => (
              <option key={v} value={v}>
                {variantLabel(v)}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {known && exams.length && !showPapers ? (
        <p className="text-[12px] font-semibold text-muted-foreground">
          {exams.length} paper{exams.length === 1 ? "" : "s"} from the {timetableSource(known)}.
        </p>
      ) : known && exams.length ? (
        <div className="rounded-[10px] bg-card p-2.5 ring-1 ring-border">
          <p className="text-[12px] font-bold">
            {exams.length} exam{exams.length === 1 ? "" : "s"} added from the{" "}
            {timetableSource(known)}
          </p>
          <ul className="mt-1.5 space-y-1">
            {exams.map((exam) => (
              <li
                key={`${exam.date}-${exam.session}-${exam.paper}-${exam.tier ?? ""}`}
                className="flex flex-wrap gap-x-2 text-[12px] font-medium"
              >
                <span className="w-[8.5rem] shrink-0 font-bold tabular-nums">
                  {format(parseISO(exam.date), "EEE d MMM")} · {sessionTime(exam.session)}
                </span>
                <span className="min-w-0 flex-1">{examLabel(exam)}</span>
                <span className="text-muted-foreground">{exam.duration}</span>
              </li>
            ))}
          </ul>
          {!tier && exams.some((e) => e.duration.includes("Foundation")) ? (
            <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">
              Choose Foundation or Higher in step 1 to see your tier's papers only.
            </p>
          ) : null}
        </div>
      ) : known ? (
        <p className="text-[12px] font-semibold text-muted-foreground">
          {known} doesn't list {subject} exams in its summer timetable (it may be assessed by your
          school). Add any dates below.
        </p>
      ) : null}
    </div>
  );
}
