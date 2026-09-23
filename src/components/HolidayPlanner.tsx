import { Plus } from "lucide-react";

import { DatePicker } from "@/components/DatePicker";
import type { HolidayPeriod } from "@/lib/plan";
import { WEEK_DAYS } from "@/lib/subjects";

const DEFAULT_HOLIDAY: HolidayPeriod = {
  name: "Half term",
  start: "",
  end: "",
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  sessions: 3,
};

/** Optional holiday stretches, each with their own days and sessions per day. */
export function HolidayPlanner({
  holidays,
  onChange,
}: {
  holidays: HolidayPeriod[];
  onChange: (holidays: HolidayPeriod[]) => void;
}) {
  function patch(index: number, next: Partial<HolidayPeriod>) {
    onChange(holidays.map((item, i) => (i === index ? { ...item, ...next } : item)));
  }

  return (
    <div className="rounded-[12px] bg-background p-3 ring-1 ring-border">
      <span className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
        Holidays (optional)
      </span>
      <p className="mt-1 text-[12px] font-medium text-muted-foreground">
        Add school holidays and how much you'll study on those days — a normal school day's worth
        by default.
      </p>

      <div className="mt-2.5 space-y-2">
        {holidays.map((holiday, index) => (
          <div key={index} className="rounded-[12px] bg-card p-3 ring-1 ring-border">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={holiday.name}
                onChange={(event) => patch(index, { name: event.target.value })}
                placeholder="Holiday name"
                className="min-w-0 flex-1 rounded-[10px] bg-background px-2.5 py-1.5 text-[13px] font-bold ring-1 ring-border focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onChange(holidays.filter((_, i) => i !== index))}
                className="text-[12px] font-bold text-muted-foreground hover:text-foreground"
              >
                Remove
              </button>
            </div>

            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  First day
                </span>
                <div className="mt-1">
                  <DatePicker
                    value={holiday.start}
                    onChange={(value) => patch(index, { start: value })}
                    label="Pick a date"
                  />
                </div>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Last day
                </span>
                <div className="mt-1">
                  <DatePicker
                    value={holiday.end}
                    onChange={(value) => patch(index, { end: value })}
                    label="Pick a date"
                  />
                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {WEEK_DAYS.map((day) => {
                const on = holiday.days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      patch(index, {
                        days: on
                          ? holiday.days.filter((item) => item !== day)
                          : [...holiday.days, day],
                      })
                    }
                    className={`rounded-full px-2.5 py-1.5 text-[12px] font-bold ${
                      on
                        ? "bg-structure text-structure-foreground"
                        : "bg-background text-muted-foreground ring-1 ring-border"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
              <select
                value={holiday.sessions}
                onChange={(event) => patch(index, { sessions: Number(event.target.value) })}
                className="ml-auto rounded-[10px] bg-background px-2.5 py-1.5 text-[12px] font-semibold ring-1 ring-border focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} session{n === 1 ? "" : "s"} a day
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...holidays, { ...DEFAULT_HOLIDAY }])}
        className="mt-2 inline-flex items-center gap-1 text-[12px] font-extrabold text-muted-foreground hover:text-foreground"
      >
        <Plus className="size-3.5" strokeWidth={3} />
        Add a holiday
      </button>
    </div>
  );
}
