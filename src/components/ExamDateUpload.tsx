import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { ReadingProgress } from "@/components/ReadingProgress";

import { extractExamDates } from "@/lib/revision.functions";
import { MAX_EXAM_DATES } from "@/lib/exam-dates";

type Detected = { subject: string; date: string; paper: string };

/**
 * Reads exam dates out of an uploaded timetable and lets the student check each one
 * against a subject before anything is saved.
 */
export function ExamDateUpload({
  subjects,
  onApply,
}: {
  /** Subject names in the plan, in display order. */
  subjects: string[];
  /** Called with the dates to keep, per subject name. */
  onApply: (dates: Record<string, string[]>) => void;
}) {
  const [reading, setReading] = useState(false);
  const [rows, setRows] = useState<Array<Detected & { assigned: string }>>([]);

  function matchSubject(name: string) {
    const clean = name.trim().toLowerCase();
    const exact = subjects.find((subject) => subject.toLowerCase() === clean);
    if (exact) return exact;
    const partial = subjects.find(
      (subject) => clean.includes(subject.toLowerCase()) || subject.toLowerCase().includes(clean),
    );
    return partial ?? "";
  }

  async function read(file: File) {
    setReading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read that file."));
        reader.readAsDataURL(file);
      });
      const { exams } = await extractExamDates({
        data: {
          subjects,
          fileName: file.name,
          mimeType: file.type || "application/pdf",
          dataUrl,
        },
      });
      if (!exams.length) {
        toast.error("We couldn't find any exam dates in that file — add them by hand instead.");
        return;
      }
      const matched = exams
        .map((exam) => ({ ...exam, assigned: matchSubject(exam.subject) }))
        .filter((exam) => exam.assigned !== "");
      if (!matched.length) {
        toast.error("That timetable didn't include any of your chosen subjects.");
        return;
      }
      setRows(matched);
      toast.success(
        `Found ${matched.length} exam${matched.length === 1 ? "" : "s"} — check them below.`,
      );
    } catch (error) {
      console.error(error);
      toast.error("We couldn't read that timetable. Try a clearer file or add the dates by hand.");
    } finally {
      setReading(false);
    }
  }

  function apply() {
    const out: Record<string, string[]> = {};
    for (const row of rows) {
      if (!row.assigned) continue;
      const list = (out[row.assigned] ??= []);
      if (!list.includes(row.date)) list.push(row.date);
    }
    for (const key of Object.keys(out)) {
      out[key] = out[key]!.sort().slice(0, MAX_EXAM_DATES);
    }
    if (Object.keys(out).length === 0) {
      toast.error("Choose a subject for at least one date first.");
      return;
    }
    onApply(out);
    setRows([]);
    toast.success("Exam dates added — you can still edit them.");
  }

  return (
    <div className="rounded-[12px] bg-background p-3 ring-1 ring-border">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
        Got your exam timetable?
      </p>
      <p className="mt-1 text-[12px] font-medium text-muted-foreground">
        Upload it and we'll read the dates out for you to check. You can always type or change dates
        yourself.
      </p>
      <label
        className={`mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full bg-card px-3.5 py-2 text-[12px] font-bold ring-1 ring-border hover:bg-secondary focus-within:ring-2 focus-within:ring-primary ${
          reading ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <Upload className="size-4" aria-hidden="true" />
        Upload a photo or PDF
        <input
          type="file"
          accept="application/pdf,image/*"
          disabled={reading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void read(file);
            event.target.value = "";
          }}
          className="sr-only"
        />
      </label>
      {reading ? (
        <div className="mt-2">
          <ReadingProgress what="timetable" />
        </div>
      ) : null}

      {rows.length ? (
        <div className="mt-3 space-y-1.5">
          {rows.map((row, index) => (
            <div
              key={`${row.subject}-${row.date}-${index}`}
              className="flex flex-wrap items-center gap-2 rounded-[10px] bg-card px-2.5 py-2 ring-1 ring-border"
            >
              <span className="text-[12px] font-extrabold">
                {format(parseISO(row.date), "EEE d MMM yyyy")}
              </span>
              <span className="text-[12px] font-medium text-muted-foreground">
                {row.subject}
                {row.paper ? ` · ${row.paper}` : ""}
              </span>
              <select
                value={row.assigned}
                onChange={(event) =>
                  setRows((prev) =>
                    prev.map((item, i) =>
                      i === index ? { ...item, assigned: event.target.value } : item,
                    ),
                  )
                }
                className="ml-auto rounded-[10px] bg-background px-2.5 py-1.5 text-[12px] font-semibold ring-1 ring-border focus:outline-none"
              >
                <option value="">Skip this one</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={apply}
              className="rounded-full bg-primary px-4 py-2 text-[12px] font-extrabold text-primary-foreground"
            >
              Add these dates
            </button>
            <button
              type="button"
              onClick={() => setRows([])}
              className="rounded-full px-3 py-2 text-[12px] font-bold text-muted-foreground"
            >
              Discard
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
