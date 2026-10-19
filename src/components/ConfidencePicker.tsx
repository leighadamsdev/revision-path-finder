import { confidenceBand, confidenceTone } from "@/lib/confidence";

const OPTIONS = [
  { label: "Red", value: 1, hint: "I don't know this yet — it needs the most revision" },
  { label: "Amber", value: 3, hint: "I know some of this" },
  { label: "Green", value: 5, hint: "I know this well" },
] as const;

/** A calm Red / Amber / Green confidence control. Red needs the most revision time, green the least. Click the same colour again to clear it. */
export function ConfidencePicker({
  value,
  onChange,
  label = "Confidence",
  size = "md",
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  /** Kept for callers that pass subject colours — confidence colours win. */
  fill?: string;
  ring?: string;
  label?: string;
  size?: "sm" | "md";
}) {
  const band = confidenceBand(value);
  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";
  return (
    <div className="flex flex-wrap items-center gap-1" role="radiogroup" aria-label={label}>
      {OPTIONS.map((opt) => {
        const on = band === opt.label.toLowerCase();
        const tone = confidenceTone(opt.value);
        return (
          <button
            key={opt.label}
            type="button"
            role="radio"
            aria-checked={on}
            title={opt.hint}
            onClick={() => onChange(on ? null : opt.value)}
            className={`inline-flex shrink-0 items-center gap-1 rounded-full font-extrabold transition-colors ${pad} ${
              on ? tone.tag : "ring-1 ring-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className={`size-2 rounded-full ${tone.fill}`} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
