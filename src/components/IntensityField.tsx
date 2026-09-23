import type { Intensity } from "@/lib/plan";

/** Optional heavier (or lighter) study in the final weeks before the first exam. */
export function IntensityField({
  value,
  onChange,
}: {
  value: Intensity | null;
  onChange: (value: Intensity | null) => void;
}) {
  const on = Boolean(value);
  const weeks = value?.weeks ?? 4;
  const sessions = value?.sessions ?? 3;

  return (
    <div className="rounded-[12px] bg-background p-3 ring-1 ring-border">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
          Step up before exams
        </span>
        <button
          type="button"
          onClick={() => onChange(on ? null : { weeks, sessions })}
          className={`ml-auto rounded-full px-3 py-1.5 text-[12px] font-bold ${
            on
              ? "bg-structure text-structure-foreground"
              : "bg-card text-muted-foreground ring-1 ring-border"
          }`}
        >
          {on ? "On" : "Off"}
        </button>
      </div>
      <p className="mt-1 text-[12px] font-medium text-muted-foreground">
        Study a different amount in the run-up to your first exam.
      </p>

      {on ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-semibold">In the last</span>
          <select
            value={weeks}
            onChange={(event) => onChange({ weeks: Number(event.target.value), sessions })}
            className="rounded-[10px] bg-card px-2.5 py-1.5 text-[12px] font-semibold ring-1 ring-border focus:outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n} week{n === 1 ? "" : "s"}
              </option>
            ))}
          </select>
          <span className="text-[12px] font-semibold">study</span>
          <select
            value={sessions}
            onChange={(event) => onChange({ weeks, sessions: Number(event.target.value) })}
            className="rounded-[10px] bg-card px-2.5 py-1.5 text-[12px] font-semibold ring-1 ring-border focus:outline-none"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} session{n === 1 ? "" : "s"} a day
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
