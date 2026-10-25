import { useEffect, useState } from "react";

export type Band = "red" | "amber" | "green" | "unrated";

const BANDS: { value: Band; label: string; dot: string }[] = [
  { value: "red", label: "Red", dot: "bg-conf-low" },
  { value: "amber", label: "Amber", dot: "bg-conf-mid" },
  { value: "green", label: "Green", dot: "bg-conf-high" },
  { value: "unrated", label: "Not rated", dot: "ring-1 ring-muted-foreground/50" },
];

/** Which colour a rating falls in (ratings are stored as 1–5). */
export function bandOf(rating: number | null | undefined): Band {
  if (rating == null) return "unrated";
  return rating <= 2 ? "red" : rating <= 4 ? "amber" : "green";
}

const STORAGE_KEY = "revplan.ragFilter";

/**
 * The colours a student wants to see, remembered on this device. An empty set means "all".
 * Shared by Rate my topics and My Topics so the choice carries between them.
 */
export function useRagFilter() {
  const [shown, setShown] = useState<Set<Band>>(new Set());
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as Band[];
      setShown(new Set(saved.filter((b) => BANDS.some((x) => x.value === b))));
    } catch {
      /* storage unavailable */
    }
  }, []);
  const update = (next: Set<Band>) => {
    setShown(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      /* storage unavailable */
    }
  };
  return {
    shown,
    setShown: update,
    /** True when a topic with this rating should be listed. */
    matches: (rating: number | null | undefined) => shown.size === 0 || shown.has(bandOf(rating)),
    filtering: shown.size > 0,
  };
}

/** "Show: All · Red · Amber · Green · Not rated" chips. Tick any mix, e.g. red and amber. */
export function RagFilter({
  shown,
  setShown,
  counts,
}: {
  shown: Set<Band>;
  setShown: (next: Set<Band>) => void;
  counts?: Partial<Record<Band, number>>;
}) {
  const toggle = (b: Band) => {
    const next = new Set(shown);
    if (next.has(b)) next.delete(b);
    else next.add(b);
    // Ticking every colour is the same as showing all.
    setShown(next.size === BANDS.length ? new Set() : next);
  };
  const chip = (on: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold ${
      on
        ? "bg-structure text-structure-foreground"
        : "bg-background text-muted-foreground ring-1 ring-border"
    }`;
  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      role="group"
      aria-label="Show topics by colour"
    >
      <span className="mr-1 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
        Show
      </span>
      <button
        type="button"
        aria-pressed={shown.size === 0}
        onClick={() => setShown(new Set())}
        className={chip(shown.size === 0)}
      >
        All
      </button>
      {BANDS.map((b) => (
        <button
          key={b.value}
          type="button"
          aria-pressed={shown.has(b.value)}
          onClick={() => toggle(b.value)}
          className={chip(shown.has(b.value))}
        >
          <span className={`size-2 rounded-full ${b.dot}`} />
          {b.label}
          {counts && counts[b.value] != null ? (
            <span className="tabular-nums opacity-70">{counts[b.value]}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
