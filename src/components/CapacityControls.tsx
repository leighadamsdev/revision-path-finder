import type { Capacity } from "@/lib/plan";

/** Optional weekly time budget plus the two opt-in boosts. */
export function CapacityControls({
  value,
  onChange,
}: {
  value: Capacity;
  onChange: (next: Capacity) => void;
}) {
  const budgetHours = value.weeklyMinutesBudget ? value.weeklyMinutesBudget / 60 : "";
  return (
    <div className="space-y-3 rounded-[12px] bg-background p-3 ring-1 ring-black/5">
      <label className="block">
        <span className="text-[12px] font-extrabold">Weekly time budget (optional)</span>
        <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">
          The most you want to revise in a week. Leave blank for no limit.
        </span>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={60}
            step={0.5}
            value={budgetHours}
            onChange={(e) => {
              const hours = Number(e.target.value);
              onChange({ ...value, weeklyMinutesBudget: hours > 0 ? Math.round(hours * 60) : null });
            }}
            className="w-24 rounded-[8px] bg-card px-3 py-2 text-[13px] font-semibold ring-1 ring-border focus:outline-none"
          />
          <span className="text-[12px] font-bold text-muted-foreground">hours a week</span>
        </div>
      </label>

      <label className="flex items-start gap-2.5">
        <input
          type="checkbox"
          className="mt-1"
          checked={Boolean(value.holidayBoost)}
          onChange={(e) => onChange({ ...value, holidayBoost: e.target.checked })}
        />
        <span>
          <span className="block text-[12px] font-extrabold">School holiday boost</span>
          <span className="block text-[11px] font-medium text-muted-foreground">
            One extra session a day during your holiday periods.
          </span>
        </span>
      </label>

      <div className="flex items-start gap-2.5">
        <input
          id="pre-exam-boost"
          type="checkbox"
          className="mt-1"
          checked={Boolean(value.preExamBoost)}
          onChange={(e) => onChange({ ...value, preExamBoost: e.target.checked })}
        />
        <label htmlFor="pre-exam-boost" className="flex-1">
          <span className="block text-[12px] font-extrabold">Pre-exam boost</span>
          <span className="block text-[11px] font-medium text-muted-foreground">
            One extra session a day in the weeks before an exam.
          </span>
        </label>
        {value.preExamBoost ? (
          <select
            aria-label="Weeks before an exam"
            value={value.preExamWeeks ?? 4}
            onChange={(e) => onChange({ ...value, preExamWeeks: Number(e.target.value) })}
            className="rounded-[8px] bg-card px-2 py-1.5 text-[12px] font-bold ring-1 ring-border"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "week" : "weeks"}
              </option>
            ))}
          </select>
        ) : null}
      </div>
    </div>
  );
}
