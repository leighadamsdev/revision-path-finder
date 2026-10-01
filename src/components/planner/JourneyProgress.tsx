import { Check, Lock } from "lucide-react";

export type JourneyStatus = "current" | "done" | "optional" | "skipped" | "locked" | "todo";

const STEPS = [
  { n: 1, label: "Exams and availability", optional: false },
  { n: 2, label: "Add topics", optional: true },
  { n: 3, label: "Knowledge check", optional: true },
  { n: 4, label: "Priorities", optional: false },
  { n: 5, label: "My timetable", optional: false },
];

const STATUS_TEXT: Record<JourneyStatus, string> = {
  current: "Current step",
  done: "Completed",
  optional: "Optional",
  skipped: "Skipped",
  locked: "Locked",
  todo: "Not started",
};

/** The persistent five-step progress bar for the planner journey. */
export function JourneyProgress({
  statuses,
  onSelect,
}: {
  statuses: Record<number, JourneyStatus>;
  onSelect?: (step: number) => void;
}) {
  return (
    <nav aria-label="Planner progress" className="mb-5">
      <ol className="grid grid-cols-5 gap-1.5">
        {STEPS.map((s) => {
          const status = statuses[s.n] ?? "todo";
          const clickable = Boolean(onSelect) && (status === "done" || status === "skipped" || status === "optional");
          const tone =
            status === "current"
              ? "bg-primary text-primary-foreground"
              : status === "done"
                ? "bg-foreground text-background"
                : status === "locked"
                  ? "bg-muted text-muted-foreground"
                  : "bg-card text-foreground ring-1 ring-border";
          return (
            <li key={s.n}>
              <button
                type="button"
                disabled={!clickable}
                onClick={() => onSelect?.(s.n)}
                aria-current={status === "current" ? "step" : undefined}
                className="flex w-full flex-col items-center gap-1 text-center disabled:cursor-default"
              >
                <span className={`flex size-8 items-center justify-center rounded-full text-[13px] font-extrabold ${tone}`}>
                  {status === "done" ? <Check className="size-4" strokeWidth={3} /> : status === "locked" ? <Lock className="size-3.5" /> : s.n}
                </span>
                <span className="text-[11px] font-extrabold leading-tight">{s.label}</span>
                <span className="text-[10px] font-bold text-muted-foreground">
                  {status === "todo" && s.optional ? "Optional" : STATUS_TEXT[status]}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Low / Medium / High mapped onto the existing 1–5 scale. */
export const LEVELS = [
  { label: "Low", value: 2, hint: "I find this subject hard", cls: "bg-conf-low text-white" },
  { label: "Medium", value: 3, hint: "I'm OK with some of it", cls: "bg-conf-mid text-foreground" },
  { label: "High", value: 5, hint: "I feel confident", cls: "bg-conf-high text-white" },
] as const;

export function levelOf(value: number | null | undefined) {
  if (value == null) return null;
  return value <= 2 ? "Low" : value <= 4 ? "Medium" : "High";
}

export function SubjectConfidence({
  subject,
  value,
  onChange,
}: {
  subject: string;
  value: number | null | undefined;
  onChange: (v: number) => void;
}) {
  const current = levelOf(value);
  return (
    <div role="radiogroup" aria-label={`${subject} confidence`} className="flex flex-wrap gap-1.5">
      {LEVELS.map((l) => {
        const on = current === l.label;
        return (
          <button
            key={l.label}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(l.value)}
            title={l.hint}
            className={`rounded-full px-3 py-1.5 text-[12px] font-extrabold ${on ? l.cls : "bg-card text-muted-foreground ring-1 ring-border"}`}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
