import { confidenceTone } from "@/lib/confidence";

/** A calm 1–5 confidence control. 1–2 red, 3–4 amber, 5 green. */
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
  const tone = confidenceTone(value);
  const dot = size === "sm" ? "size-5" : "size-6";
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((step) => {
        const on = (value ?? 0) >= step;
        const stepTone = confidenceTone(step);
        return (
          <button
            key={step}
            type="button"
            aria-label={`${label} ${step} of 5`}
            aria-pressed={on}
            onClick={() => onChange(value === step ? null : step)}
            className={`${dot} rounded-full transition-colors ${
              on ? tone.fill : `ring-1 ${stepTone.ring}`
            }`}
          />
        );
      })}
    </div>
  );
}
