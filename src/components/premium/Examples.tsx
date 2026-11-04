import { addDays, differenceInCalendarDays, format, isWeekend, nextMonday } from "date-fns";

/** A date this many days ahead, moved to Monday if it lands on a weekend (no exams then). */
const schoolDay = (from: Date, days: number) => {
  const d = addDays(from, days);
  return isWeekend(d) ? nextMonday(d) : d;
};
import { useEffect, useState } from "react";
import { Check, Clock, Copy, Eye, EyeOff, Highlighter } from "lucide-react";

import { buildPracticePrompt, DEFAULT_PRACTICE } from "@/lib/practice-prompt";
import { buildTutorPrompt, DEFAULT_RULES, defaultQuestionTypes } from "@/lib/tutor-prompt";

/* Example content for the Premium preview pages. Everything here is made up: "Maya",
   a Year 11 student taking AQA GCSEs. */

const SAMPLE_TOPICS = [
  { text: "Enzymes", rating: 1 },
  { text: "Cell division", rating: 2 },
  { text: "Photosynthesis", rating: 3 },
  { text: "Cell structure", rating: 5 },
];

const RAG = {
  red: { label: "Red", dot: "bg-conf-low", text: "text-conf-low", soft: "bg-conf-low/15" },
  amber: { label: "Amber", dot: "bg-conf-mid", text: "text-conf-mid", soft: "bg-conf-mid/15" },
  green: { label: "Green", dot: "bg-conf-high", text: "text-conf-high", soft: "bg-conf-high/15" },
} as const;
type Rag = keyof typeof RAG;

function RagChip({ rag }: { rag: Rag }) {
  const r = RAG[rag];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${r.soft} ${r.text}`}
    >
      <span className={`size-1.5 rounded-full ${r.dot}`} />
      {r.label}
    </span>
  );
}

/* ---------- Knowledge Checker ---------- */

const CHECKER_ROWS = [
  {
    title: "Lock-and-key model",
    known: [
      "Enzyme's active site shape matches the substrate",
      "High temperatures denature the active site",
    ],
    gaps: ["Optimum pH: pepsin works best around pH 2, not 7"],
  },
  {
    title: "Rate of reaction",
    known: ["Rate rises with temperature until the enzyme denatures"],
    gaps: [
      "Substrate concentration: rate levels off when all active sites are full",
      "Denatured is permanent; cooling doesn't fix it",
    ],
  },
];

export function CheckerExample() {
  return (
    <div className="overflow-hidden rounded-[16px] bg-card ring-1 ring-border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-structure px-4 py-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-primary">
            Active recall
          </p>
          <p className="text-[15px] font-bold">Biology · Enzymes</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-[10px] px-3 py-1.5 font-[family-name:var(--font-display)] text-lg font-bold ring-1 ring-primary">
          <Clock className="size-4 text-primary" aria-hidden="true" /> 21:47
        </span>
      </div>
      <div className="divide-y divide-border">
        {CHECKER_ROWS.map((row, i) => (
          <div key={row.title} className="grid gap-3 p-4 sm:grid-cols-[1fr_1.4fr_1.4fr]">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                Key component {i + 1}
              </p>
              <p className="mt-1 text-[15px] font-bold">{row.title}</p>
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                What I already know
              </p>
              <ul className="mt-1.5 space-y-1 text-[13px] font-medium">
                {row.known.map((k) => (
                  <li key={k} className="flex gap-2">
                    <Check
                      className="mt-0.5 size-3.5 shrink-0 text-conf-high"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                    {k}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                <Highlighter className="size-3.5" aria-hidden="true" /> Gaps and corrections
              </p>
              <ul className="mt-1.5 space-y-1.5 text-[13px] font-semibold">
                {row.gaps.map((g) => (
                  <li key={g} className="rounded-[8px] bg-primary/15 px-2 py-1 text-foreground">
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-background/40 px-4 py-3 text-[13px] font-bold">
        <span>3 things you knew · 3 gaps found</span>
        <span className="rounded-full bg-primary px-3 py-1 text-[12px] text-primary-foreground">
          3 flashcards made from your gaps
        </span>
      </div>
    </div>
  );
}

/* ---------- Exam timetable ---------- */

export function ExamsExample() {
  const today = new Date();
  const exams = [
    {
      subject: "Maths",
      paper: "Paper 1 (non-calculator)",
      kind: "Mock",
      days: 12,
      dot: "bg-maths",
    },
    { subject: "Biology", paper: "Paper 1", kind: "Mock", days: 15, dot: "bg-sci" },
    {
      subject: "English Literature",
      paper: "Paper 1: Macbeth and A Christmas Carol",
      kind: "Summer",
      days: 190,
      dot: "bg-lit",
    },
    { subject: "Biology", paper: "Paper 1", kind: "Summer", days: 194, dot: "bg-sci" },
    {
      subject: "Maths",
      paper: "Paper 1 (non-calculator)",
      kind: "Summer",
      days: 197,
      dot: "bg-maths",
    },
    {
      subject: "History",
      paper: "Paper 1: Germany, 1890–1945",
      kind: "Summer",
      days: 203,
      dot: "bg-hist",
    },
  ];
  return (
    <div className="rounded-[16px] bg-card p-4 ring-1 ring-border sm:p-5">
      <div className="flex flex-wrap gap-2">
        {exams.slice(0, 2).map((e, i) => (
          <div
            key={e.subject + e.days}
            className="flex min-w-[200px] flex-1 items-center justify-between gap-3 rounded-[12px] bg-background p-3 ring-1 ring-border"
          >
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-conf-mid">
                {i === 0 ? "Next exam" : "After that"}
              </p>
              <p className="text-[14px] font-bold">{e.subject}</p>
              <p className="text-[12px] text-muted-foreground">
                {format(schoolDay(today, e.days), "EEE d MMM")}
              </p>
            </div>
            <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-conf-mid">
              {differenceInCalendarDays(schoolDay(today, e.days), today)}
              <span className="ml-1 text-[12px] text-muted-foreground">days</span>
            </p>
          </div>
        ))}
      </div>
      <ul className="mt-4 divide-y divide-border">
        {exams.map((e) => {
          const date = schoolDay(today, e.days);
          return (
            <li key={e.subject + e.days} className="flex items-center gap-3 py-2.5">
              <span className="w-16 shrink-0 text-[12px] font-bold text-muted-foreground">
                {format(date, "d MMM")}
              </span>
              <span className={`size-2.5 shrink-0 rounded-full ${e.dot}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-bold">{e.subject}</span>
                <span className="block truncate text-[12px] text-muted-foreground">{e.paper}</span>
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${e.kind === "Mock" ? "bg-conf-mid/15 text-conf-mid" : "bg-secondary text-muted-foreground"}`}
              >
                {e.kind}
              </span>
              <span className="hidden w-16 text-right text-[12px] font-bold text-muted-foreground sm:block">
                {differenceInCalendarDays(date, today)} days
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[12px] font-medium text-muted-foreground">
        Example dates. Your real summer exams come from the official timetable for your boards.
      </p>
    </div>
  );
}

/* ---------- Revision planner ---------- */

const WEEK: {
  day: string;
  sessions: { subject: string; dot: string; topic: string; rag: Rag; done?: boolean }[];
}[] = [
  {
    day: "Mon",
    sessions: [
      { subject: "Biology", dot: "bg-sci", topic: "Enzymes", rag: "red", done: true },
      { subject: "Maths", dot: "bg-maths", topic: "Quadratics", rag: "amber", done: true },
    ],
  },
  {
    day: "Tue",
    sessions: [
      { subject: "English Lit", dot: "bg-lit", topic: "Macbeth: ambition", rag: "red", done: true },
    ],
  },
  {
    day: "Wed",
    sessions: [
      { subject: "History", dot: "bg-hist", topic: "Weimar Republic", rag: "amber" },
      { subject: "Biology", dot: "bg-sci", topic: "Cell division", rag: "red" },
    ],
  },
  {
    day: "Thu",
    sessions: [{ subject: "Maths", dot: "bg-maths", topic: "Simultaneous equations", rag: "red" }],
  },
  { day: "Fri", sessions: [] },
  {
    day: "Sat",
    sessions: [
      { subject: "English Lit", dot: "bg-lit", topic: "A Christmas Carol", rag: "amber" },
      { subject: "Biology", dot: "bg-sci", topic: "Photosynthesis", rag: "amber" },
    ],
  },
  {
    day: "Sun",
    sessions: [{ subject: "Maths", dot: "bg-maths", topic: "Mock paper practice", rag: "green" }],
  },
];

export function PlannerExample() {
  return (
    <div className="rounded-[16px] bg-card p-4 ring-1 ring-border sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-[family-name:var(--font-display)] text-lg font-bold">Week 6 of 28</p>
        <p className="text-[13px] font-bold text-muted-foreground">
          3 of 10 sessions done · 30 min each
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
        <div className="h-full w-[30%] rounded-full bg-primary" />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-7">
        {WEEK.map((d) => (
          <div key={d.day} className="rounded-[12px] bg-background p-2.5 ring-1 ring-border">
            <p className="text-[12px] font-extrabold uppercase tracking-wide text-muted-foreground">
              {d.day}
            </p>
            <div className="mt-2 space-y-2">
              {d.sessions.length ? (
                d.sessions.map((s) => (
                  <div
                    key={s.topic}
                    className={`rounded-[10px] bg-card p-2 ring-1 ring-border ${s.done ? "opacity-60" : ""}`}
                  >
                    <p className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                      <span className={`size-1.5 rounded-full ${s.dot}`} />
                      {s.subject}
                      {s.done ? (
                        <Check
                          className="ml-auto size-3.5 text-primary"
                          strokeWidth={3}
                          aria-label="Done"
                        />
                      ) : null}
                    </p>
                    <p
                      className={`mt-1 text-[12px] font-bold leading-snug ${s.done ? "line-through" : ""}`}
                    >
                      {s.topic}
                    </p>
                    <div className="mt-1.5">
                      <RagChip rag={s.rag} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[12px] font-medium text-muted-foreground">Rest day</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[12px] font-medium text-muted-foreground">
        Red topics come round most often. As exams get closer, those subjects get more sessions.
      </p>
    </div>
  );
}

/* ---------- Prompt excerpt (AI tutor and practice questions) ---------- */

function PromptExcerpt({ text, label }: { text: string; label: string }) {
  const lines = text.split("\n").slice(0, 22).join("\n");
  return (
    <div className="relative overflow-hidden rounded-[12px] bg-background ring-1 ring-border">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <p className="text-[12px] font-bold text-muted-foreground">{label}</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[12px] font-extrabold text-primary-foreground">
          <Copy className="size-3.5" aria-hidden="true" /> Copy
        </span>
      </div>
      <pre className="max-h-72 overflow-hidden whitespace-pre-wrap px-3 py-3 font-mono text-[12px] leading-relaxed text-foreground/85">
        {lines}
      </pre>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-3">
      {steps.map((s, i) => (
        <li
          key={s}
          className="flex items-center gap-3 rounded-[12px] bg-background p-3 ring-1 ring-border"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-primary font-[family-name:var(--font-display)] text-[14px] font-bold text-primary-foreground">
            {i + 1}
          </span>
          <span className="text-[13px] font-bold">{s}</span>
        </li>
      ))}
    </ol>
  );
}

/** True after the first render in the browser: prompts format dates in the browser's locale. */
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function TutorExample() {
  const mounted = useMounted();
  const prompt = !mounted
    ? ""
    : buildTutorPrompt({
        subject: "Biology",
        board: "AQA",
        tier: "Higher",
        targetGrade: "7",
        examDate: format(schoolDay(new Date(), 194), "yyyy-MM-dd"),
        topics: SAMPLE_TOPICS,
        approach: "explain-test",
        tone: "encouraging",
        activities: ["explain", "check", "exam-q", "mark"],
        questionTypes: defaultQuestionTypes("Biology"),
        difficulty: "build",
        responseLength: "short",
        sessionMinutes: "30",
        needs: [],
        rules: DEFAULT_RULES,
        name: "Maya",
        extra: "",
      });
  const choices = [
    "ChatGPT",
    "AQA Biology, Higher",
    "Target grade 7",
    "Encouraging",
    "30-minute sessions",
    "Red topics first",
  ];
  return (
    <div className="space-y-4 rounded-[16px] bg-card p-4 ring-1 ring-border sm:p-5">
      <div>
        <p className="text-[12px] font-extrabold uppercase tracking-wide text-muted-foreground">
          Your choices
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {choices.map((c) => (
            <span
              key={c}
              className="rounded-full bg-selected px-3 py-1 text-[12px] font-bold text-selected-foreground"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
      <PromptExcerpt text={prompt} label="Your tutor instructions (made by RevPlan)" />
      <Steps
        steps={[
          "Copy your instructions",
          "Paste into ChatGPT, Gemini or similar",
          "Revise with a tutor that knows your topics",
        ]}
      />
    </div>
  );
}

/* ---------- Practice questions ---------- */

export function PracticeExample() {
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const prompt = !mounted
    ? ""
    : buildPracticePrompt({
        subject: "Biology",
        board: "AQA",
        tier: "Higher",
        topics: SAMPLE_TOPICS,
        questionTypes: defaultQuestionTypes("Biology"),
        ...DEFAULT_PRACTICE,
      });
  return (
    <div className="space-y-4 rounded-[16px] bg-card p-4 ring-1 ring-border sm:p-5">
      <PromptExcerpt text={prompt} label="Your question-writing instructions (made by RevPlan)" />
      <div>
        <p className="text-[12px] font-extrabold uppercase tracking-wide text-muted-foreground">
          What your AI sends back
        </p>
        <div className="mt-2 rounded-[12px] bg-background p-4 ring-1 ring-border">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[15px] font-bold leading-snug">
              3. Explain why the rate of an enzyme-controlled reaction falls when the temperature
              rises above about 40 °C.
            </p>
            <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[12px] font-bold">
              [4 marks]
            </span>
          </div>
          <div className="mt-2">
            <RagChip rag="red" />{" "}
            <span className="ml-1 text-[12px] font-medium text-muted-foreground">
              Enzymes, one of your red topics
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-[13px] font-bold ring-1 ring-border hover:ring-primary/60"
          >
            {open ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
            {open ? "Hide mark scheme" : "Reveal mark scheme"}
          </button>
          {open ? (
            <ul className="mt-3 space-y-1.5 text-[13px] font-medium">
              {[
                "The active site changes shape (1)",
                "The enzyme is denatured (1)",
                "The substrate no longer fits the active site, so fewer enzyme–substrate complexes form (1)",
                "So fewer reactions happen and the rate falls (1)",
              ].map((m) => (
                <li key={m} className="flex gap-2">
                  <Check
                    className="mt-0.5 size-3.5 shrink-0 text-primary"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                  {m}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
