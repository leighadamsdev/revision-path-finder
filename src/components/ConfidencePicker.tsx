/** A calm 1–5 confidence control. 1 = shaky, 5 = solid. */
export function ConfidencePicker({
  value,
  onChange,
  fill = "bg-structure",
  ring = "ring-border",
  label = "Confidence",
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  fill?: string;
  ring?: string;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((step) => {
        const on = (value ?? 0) >= step;
        return (
          <button
            key={step}
            type="button"
            aria-label={`${label} ${step} of 5`}
            aria-pressed={on}
            onClick={() => onChange(value === step ? null : step)}
            className={`size-6 rounded-full transition-colors ${on ? fill : `ring-1 ${ring}`}`}
          />
        );
      })}
    </div>
  );
}
