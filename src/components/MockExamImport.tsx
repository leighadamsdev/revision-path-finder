import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Camera, ClipboardPaste, FileText, Link2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { fileToImage, renderPrepared } from "@/components/library/image-prep";
import { extractExamDates } from "@/lib/revision.functions";
import { readAsDataUrl, textFromFile } from "@/lib/read-document";
import { ReadingProgress } from "@/components/ReadingProgress";

type Source = "link" | "photo" | "file" | "paste";
type Found = { subject: string; date: string; paper: string; subjectId: string; keep: boolean };

const SOURCES: Array<{ key: Source; label: string; icon: typeof Link2 }> = [
  { key: "link", label: "School website", icon: Link2 },
  { key: "photo", label: "Photo of a printed sheet", icon: Camera },
  { key: "file", label: "Downloaded file", icon: FileText },
  { key: "paste", label: "Paste a list", icon: ClipboardPaste },
];

/**
 * Reads mock exam dates from wherever the school published them (a web page, a printed
 * sheet, a downloaded PDF/Word/Excel/CSV file or pasted text), then lets the student check
 * each date and match it to one of their subjects before it's added.
 */
export function MockExamImport({
  subjects,
  onAdd,
}: {
  subjects: Array<{ id: string; name: string }>;
  onAdd: (mocks: Array<{ subjectId: string; date: string; label: string }>) => void;
}) {
  const [source, setSource] = useState<Source>("link");
  const [url, setUrl] = useState("");
  const [pasted, setPasted] = useState("");
  const [reading, setReading] = useState(false);
  const [found, setFound] = useState<Found[]>([]);

  function match(name: string) {
    const clean = name.trim().toLowerCase();
    if (!clean) return "";
    const exact = subjects.find((s) => s.name.toLowerCase() === clean);
    if (exact) return exact.id;
    const partial = subjects.find((s) => {
      const n = s.name.toLowerCase().replace(/\s*\(.*\)\s*/g, "");
      return (
        clean.includes(n) ||
        n.includes(clean) ||
        (clean.startsWith("math") && n.startsWith("math")) ||
        (clean.includes("science") && n.includes("science"))
      );
    });
    return partial?.id ?? "";
  }

  async function read(input: {
    url?: string;
    text?: string;
    fileName?: string;
    mimeType?: string;
    dataUrl?: string;
  }) {
    setReading(true);
    setFound([]);
    try {
      const { exams } = await extractExamDates({
        data: {
          ...input,
          kind: "mock",
          today: format(new Date(), "yyyy-MM-dd"),
          subjects: subjects.map((s) => s.name),
        },
      });
      if (!exams.length) {
        toast.error(
          "We couldn't find any exam dates there. Try another way, or add the dates by hand below.",
        );
        return;
      }
      const rows = exams.map((e) => {
        const subjectId = match(e.subject);
        return { ...e, subjectId, keep: Boolean(subjectId) };
      });
      setFound(rows);
      const matched = rows.filter((r) => r.subjectId).length;
      toast.success(
        `Found ${rows.length} mock exam${rows.length === 1 ? "" : "s"}${matched < rows.length ? `, ${matched} matched to your subjects` : ""}. Check them below.`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "We couldn't read that. Try another way, or add the dates by hand.",
      );
    } finally {
      setReading(false);
    }
  }

  async function readFile(file: File, asPhoto: boolean) {
    try {
      if (
        asPhoto ||
        file.type.startsWith("image/") ||
        /\.(hei[cf]|jpe?g|png|webp)$/i.test(file.name)
      ) {
        // Phone photos: convert HEIC and shrink so they upload quickly.
        const img = await fileToImage(file);
        await read({
          fileName: file.name,
          mimeType: "image/jpeg",
          dataUrl: renderPrepared(img, 0, null, false, 2200),
        });
        return;
      }
      if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
        await read({
          fileName: file.name,
          mimeType: "application/pdf",
          dataUrl: await readAsDataUrl(file),
        });
        return;
      }
      const text = await textFromFile(file);
      if (text == null) {
        toast.error("We can read PDF, Word (.docx), Excel (.xlsx), CSV and text files, or photos.");
        return;
      }
      if (!text.trim()) {
        toast.error("That file looks empty.");
        return;
      }
      await read({ text });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't open that file.");
    }
  }

  function add() {
    const keep = found.filter((r) => r.keep && r.subjectId);
    if (!keep.length) return void toast.error("Tick at least one exam and choose its subject.");
    onAdd(
      keep.map((r) => ({
        subjectId: r.subjectId,
        date: r.date,
        label: r.paper ? `Mock · ${r.paper}` : "Mock",
      })),
    );
    setFound([]);
  }

  const field =
    "w-full rounded-[10px] bg-card px-3 py-2 text-[13px] font-medium ring-1 ring-border focus:outline-none";

  return (
    <div className="rounded-[12px] bg-background p-3 ring-1 ring-border">
      <p className="text-[13px] font-extrabold">Add your mock exams</p>
      <p className="mt-0.5 text-[12px] font-medium text-muted-foreground">
        Bring in your school's mock timetable and we'll read the dates out for you to check.
      </p>

      <div
        className="mt-3 flex flex-wrap gap-1.5"
        role="tablist"
        aria-label="Where is your mock timetable?"
      >
        {SOURCES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={source === key}
            onClick={() => setSource(key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold ${
              source === key
                ? "bg-structure text-structure-foreground"
                : "bg-card text-muted-foreground ring-1 ring-border"
            }`}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3">
        {source === "link" ? (
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (url.trim()) void read({ url: url.trim() });
            }}
          >
            <input
              type="url"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.yourschool.org.uk/mock-exams"
              aria-label="Link to your school's mock exam page or PDF"
              className={`${field} min-w-0 flex-1`}
            />
            <Button type="submit" size="sm" disabled={reading || !url.trim()}>
              Read dates
            </Button>
            <p className="w-full text-[11px] font-semibold text-muted-foreground">
              Paste the address of the page or PDF. If it's behind a school login or in Google Docs,
              download it and use "Downloaded file" instead.
            </p>
          </form>
        ) : null}

        {source === "photo" ? (
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-[12px] border-2 border-dashed border-primary/40 bg-card px-4 py-5 text-center hover:bg-secondary">
            <Camera className="size-6 text-primary" />
            <span className="text-sm font-extrabold">Take or choose a photo</span>
            <span className="text-[12px] font-medium text-muted-foreground">
              Lay the sheet flat in good light so all the dates are readable.
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              disabled={reading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void readFile(file, true);
                e.target.value = "";
              }}
              className="sr-only"
            />
          </label>
        ) : null}

        {source === "file" ? (
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-[12px] border-2 border-dashed border-primary/40 bg-card px-4 py-5 text-center hover:bg-secondary">
            <FileText className="size-6 text-primary" />
            <span className="text-sm font-extrabold">Choose the file</span>
            <span className="text-[12px] font-medium text-muted-foreground">
              PDF, Word, Excel, CSV or text
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.xlsx,.csv,.txt,.tsv,application/pdf,text/csv,text/plain,image/*"
              disabled={reading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void readFile(file, false);
                e.target.value = "";
              }}
              className="sr-only"
            />
          </label>
        ) : null}

        {source === "paste" ? (
          <div className="space-y-2">
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              rows={5}
              placeholder={
                "Copy the timetable from an email or web page and paste it here, e.g.\nMon 7 Dec  Maths Paper 1\nTue 8 Dec  English Language Paper 1"
              }
              aria-label="Paste your mock timetable"
              className={field}
            />
            <Button
              type="button"
              size="sm"
              disabled={reading || !pasted.trim()}
              onClick={() => void read({ text: pasted })}
            >
              Read dates
            </Button>
          </div>
        ) : null}

        {reading ? (
          <div className="mt-2">
            <ReadingProgress what="mock timetable" />
          </div>
        ) : null}
      </div>

      {found.length ? (
        <div className="mt-3 space-y-1.5">
          <p className="text-[12px] font-bold">Check these, then add them</p>
          {found.map((row, index) => (
            <div
              key={`${row.subject}-${row.date}-${index}`}
              className="flex flex-wrap items-center gap-2 rounded-[10px] bg-card px-2.5 py-2 ring-1 ring-border"
            >
              <input
                type="checkbox"
                checked={row.keep}
                onChange={(e) =>
                  setFound((prev) =>
                    prev.map((r, i) => (i === index ? { ...r, keep: e.target.checked } : r)),
                  )
                }
                aria-label={`Add ${row.subject} on ${row.date}`}
                className="size-4 accent-primary"
              />
              <span className="text-[12px] font-extrabold tabular-nums">
                {format(parseISO(row.date), "EEE d MMM yyyy")}
              </span>
              <span className="min-w-0 flex-1 text-[12px] font-medium text-muted-foreground">
                {row.subject}
                {row.paper ? ` · ${row.paper}` : ""}
              </span>
              <select
                value={row.subjectId}
                onChange={(e) =>
                  setFound((prev) =>
                    prev.map((r, i) =>
                      i === index
                        ? { ...r, subjectId: e.target.value, keep: Boolean(e.target.value) }
                        : r,
                    ),
                  )
                }
                aria-label="Which of your subjects is this?"
                className="rounded-[10px] bg-background px-2.5 py-1.5 text-[12px] font-semibold ring-1 ring-border focus:outline-none"
              >
                <option value="">Not one of mine</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <Button type="button" size="sm" onClick={add}>
              Add {found.filter((r) => r.keep && r.subjectId).length} mock exam
              {found.filter((r) => r.keep && r.subjectId).length === 1 ? "" : "s"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setFound([])}>
              Discard
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
