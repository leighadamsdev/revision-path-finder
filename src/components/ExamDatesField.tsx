import { Plus } from "lucide-react";

import { DatePicker } from "@/components/DatePicker";
import { MAX_EXAM_DATES } from "@/lib/exam-dates";

/**
 * Up to three exam dates for one subject. Rows are kept as typed (including blanks)
 * so a student can fill in Paper 2 before Paper 3.
 */
export function ExamDatesField({
  dates,
  onChange,
  label = "Not set yet",
}: {
  dates: string[];
  onChange: (dates: string[]) => void;
  label?: string;
}) {
  const rows = dates.length ? dates : [""];

  function setRow(index: number, value: string) {
    const next = [...rows];
    next[index] = value;
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {rows.map((value, index) => (
        <div key={index} className="flex items-center gap-2">
          {rows.length > 1 ? (
            <span className="w-[52px] shrink-0 text-[11px] font-bold text-muted-foreground">
              Paper {index + 1}
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <DatePicker value={value} onChange={(next) => setRow(index, next)} label={label} />
          </div>
          {value || rows.length > 1 ? (
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
              className="text-[12px] font-bold text-muted-foreground hover:text-foreground"
            >
              {rows.length > 1 ? "Remove" : "Clear"}
            </button>
          ) : null}
        </div>
      ))}

      {rows.length < MAX_EXAM_DATES ? (
        <button
          type="button"
          onClick={() => onChange([...rows, ""])}
          className="inline-flex items-center gap-1 text-[12px] font-extrabold text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-3.5" strokeWidth={3} />
          Add another exam date
        </button>
      ) : null}
    </div>
  );
}
