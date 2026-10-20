import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, Copy, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useActivePlan, useExams, usePlanSubjects, usePlanTopics } from "@/hooks/useActivePlan";
import { useLibrary } from "@/hooks/useLibrary";
import { useTopicRatings } from "@/hooks/useTopicRatings";
import { GCSE_SUBJECTS, isTiered } from "@/lib/gcse-subjects";
import { detailedTopicText, subjectUnits } from "@/lib/gcse-topics";
import { timetableBoard, timetableExams } from "@/lib/exam-timetable";
import { topicText } from "@/lib/library";
import { specUnits } from "@/lib/spec-topics";
import {
  ACTIVITIES,
  APPROACHES,
  ASSISTANTS,
  DEFAULT_RULES,
  DIFFICULTIES,
  NEEDS,
  QUESTION_TYPES,
  RESPONSE_LENGTHS,
  RULES,
  TONES,
  buildTutorPrompt,
  type AssistantValue,
  type Choice,
  type TutorForm,
} from "@/lib/tutor-prompt";

export const Route = createFileRoute("/_authenticated/ai-tutor")({
  head: () => ({
    meta: [
      { title: "Build my AI tutor — rev.plan" },
      {
        name: "description",
        content:
          "Fill in a short form to create a prompt that turns ChatGPT, Claude, Gemini or Copilot into your own GCSE tutor.",
      },
      { property: "og:title", content: "Build my AI tutor — rev.plan" },
      {
        property: "og:description",
        content: "Create your own GCSE AI tutor prompt in a few clicks.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AiTutorPage,
});

const BOARDS = ["AQA", "Edexcel (Pearson)", "OCR", "WJEC / Eduqas", "CCEA", "Other"];
const GRADES = ["9", "8", "7", "6", "5", "4", "3"];
const MINUTES = ["15", "20", "30", "45", "60"];
const SAVE_KEY = "revplan.aiTutor";

type TopicOption = { key: string; label: string; rating: number | null };

const BLANK: Omit<TutorForm, "subject" | "board" | "tier" | "examDate" | "topics"> = {
  targetGrade: "",
  approach: "explain-test",
  tone: "encouraging",
  activities: ["explain", "check", "exam-q", "mark"],
  questionTypes: ["short"],
  difficulty: "build",
  responseLength: "short",
  sessionMinutes: "30",
  needs: [],
  rules: DEFAULT_RULES,
  name: "",
  extra: "",
};

type Style = typeof BLANK;

function loadStyle(): Style {
  try {
    return {
      ...BLANK,
      ...(JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "{}") as Partial<Style>),
    };
  } catch {
    return BLANK;
  }
}

function AiTutorPage() {
  const library = useLibrary();
  const { plan } = useActivePlan();
  const planSubjects = usePlanSubjects(plan?.id).data;
  const planTopics = usePlanTopics(plan?.id).data;
  const exams = useExams(plan?.id).data;
  const { ratings } = useTopicRatings();

  const [subject, setSubject] = useState("");
  const [board, setBoard] = useState("");
  const [tier, setTier] = useState("");
  const [examDate, setExamDate] = useState("");
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [style, setStyle] = useState<Style>(BLANK);
  const [assistant, setAssistant] = useState<AssistantValue>("chatgpt");
  const [copied, setCopied] = useState(false);

  useEffect(() => setStyle(loadStyle()), []);
  useEffect(() => {
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(style));
    } catch {
      /* storage unavailable */
    }
  }, [style]);

  /** The student's own subjects first, then the rest of the catalogue. */
  const subjectNames = useMemo(() => {
    const mine: string[] = [];
    const seen = new Set<string>();
    for (const n of [
      ...library.subjects.map((s) => s.name),
      ...(planSubjects ?? []).map((s) => s.name),
    ]) {
      const k = n.trim().toLowerCase();
      if (!seen.has(k)) {
        seen.add(k);
        mine.push(n);
      }
    }
    const rest = GCSE_SUBJECTS.map((s) => s.name).filter((n) => !seen.has(n.toLowerCase()));
    return { mine, rest };
  }, [library.subjects, planSubjects]);

  // Start on the student's first subject.
  useEffect(() => {
    if (!subject && subjectNames.mine[0]) chooseSubject(subjectNames.mine[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectNames.mine.length]);

  const lib = library.subjects.find(
    (s) => s.name.trim().toLowerCase() === subject.trim().toLowerCase(),
  );
  const planSubject = (planSubjects ?? []).find(
    (s) => s.name.trim().toLowerCase() === subject.trim().toLowerCase(),
  );

  /** Topics to choose from: the plan's (with their ratings), then My Topics, then a ready-made list. */
  const topicOptions: TopicOption[] = useMemo(() => {
    if (!subject) return [];
    const saved = ratings[subject] ?? {};
    const fromPlan = (planTopics ?? []).filter(
      (t) => planSubject && t.subject_id === planSubject.id,
    );
    if (fromPlan.length)
      return fromPlan.map((t) => ({
        key: t.topic,
        label: t.topic,
        rating: t.confidence ?? saved[t.topic] ?? null,
      }));
    if (lib?.topics.length)
      return lib.topics.map((t) => ({
        key: topicText(t),
        label: t.title,
        rating: saved[topicText(t)] ?? null,
      }));
    const spec = specUnits(subject);
    if (spec.length)
      return spec.flatMap((u) =>
        u.elements.map((e) => ({ key: e.label, label: e.label, rating: saved[e.label] ?? null })),
      );
    return subjectUnits(subject).flatMap((u) =>
      u.elements.map((e) => {
        const key = detailedTopicText(subject, e.label);
        return { key, label: e.label, rating: saved[key] ?? null };
      }),
    );
  }, [subject, ratings, planTopics, planSubject, lib]);

  function chooseSubject(name: string) {
    setSubject(name);
    setChosen(new Set());
    const l = library.subjects.find(
      (s) => s.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
    const p = (planSubjects ?? []).find(
      (s) => s.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
    const b = timetableBoard(l?.exam_board) ?? (l?.exam_board || "");
    setBoard(b);
    const t =
      p?.tier ??
      (l?.qualification_level?.includes("Higher")
        ? "Higher"
        : l?.qualification_level?.includes("Foundation")
          ? "Foundation"
          : "");
    setTier(isTiered(name) ? t : "Not tiered");
    setExamDate(nextExam(name, b, t));
  }

  /** The next exam for a subject: from the plan first, otherwise the board's official timetable. */
  function nextExam(name: string, b: string, t: string) {
    const today = new Date().toISOString().slice(0, 10);
    const p = (planSubjects ?? []).find(
      (s) => s.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
    const fromPlan = (exams ?? [])
      .filter((e) => p && e.subject_id === p.id && e.exam_date >= today)
      .map((e) => e.exam_date)
      .sort()[0];
    const fromTimetable = timetableExams(name, timetableBoard(b), t)
      .map((e) => e.date)
      .find((d) => d >= today);
    return fromPlan ?? fromTimetable ?? "";
  }

  function selectWhere(test: (o: TopicOption) => boolean) {
    setChosen(new Set(topicOptions.filter(test).map((o) => o.key)));
  }

  const form: TutorForm = {
    ...style,
    subject,
    board,
    tier,
    examDate,
    topics: topicOptions
      .filter((o) => chosen.has(o.key))
      .map((o) => ({ text: o.label, rating: o.rating })),
  };
  const prompt = buildTutorPrompt(form);
  const assistantInfo = ASSISTANTS.find((a) => a.value === assistant)!;

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success(`Copied. Now paste it into ${assistantInfo.label}.`);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Couldn't copy automatically. Select the text and copy it instead.");
    }
  }

  function download() {
    const blob = new Blob([prompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(subject || "gcse").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-ai-tutor.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const set = <K extends keyof Style>(key: K, value: Style[K]) =>
    setStyle((s) => ({ ...s, [key]: value }));
  const toggle = (key: "activities" | "questionTypes" | "needs" | "rules", value: string) =>
    setStyle((s) => ({
      ...s,
      [key]: s[key].includes(value) ? s[key].filter((v) => v !== value) : [...s[key], value],
    }));

  const counts = {
    red: topicOptions.filter((o) => o.rating != null && o.rating <= 2).length,
    amber: topicOptions.filter((o) => o.rating != null && o.rating > 2 && o.rating <= 4).length,
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <h1 className="text-xl font-extrabold tracking-tight">Build my AI tutor</h1>
        <p className="mt-1 max-w-[70ch] text-[13px] font-medium text-muted-foreground">
          Choose your subject, the topics you want help with and how you like to learn. We'll write
          a prompt you can paste into ChatGPT, Claude, Gemini or Copilot to turn it into your own
          GCSE tutor.
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          <div className="min-w-0 space-y-4">
            <Section n={1} title="Subject and exam">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Subject" htmlFor="tutor-subject">
                  <select
                    id="tutor-subject"
                    value={subject}
                    onChange={(e) => chooseSubject(e.target.value)}
                    className={select}
                  >
                    <option value="">Choose a subject…</option>
                    {subjectNames.mine.length ? (
                      <optgroup label="My subjects">
                        {subjectNames.mine.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </optgroup>
                    ) : null}
                    <optgroup label="All GCSE subjects">
                      {subjectNames.rest.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </Field>
                <Field label="Exam board" htmlFor="tutor-board">
                  <select
                    id="tutor-board"
                    value={board}
                    onChange={(e) => {
                      setBoard(e.target.value);
                      setExamDate(nextExam(subject, e.target.value, tier));
                    }}
                    className={select}
                  >
                    <option value="">Not sure</option>
                    {BOARDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Tier" htmlFor="tutor-tier">
                  <select
                    id="tutor-tier"
                    value={tier}
                    onChange={(e) => {
                      setTier(e.target.value);
                      setExamDate(nextExam(subject, board, e.target.value));
                    }}
                    className={select}
                  >
                    <option value="">Not sure</option>
                    <option value="Foundation">Foundation</option>
                    <option value="Higher">Higher</option>
                    <option value="Not tiered">Not tiered</option>
                  </select>
                </Field>
                <Field label="Target grade" htmlFor="tutor-grade">
                  <select
                    id="tutor-grade"
                    value={style.targetGrade}
                    onChange={(e) => set("targetGrade", e.target.value)}
                    className={select}
                  >
                    <option value="">Not set</option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Next exam" htmlFor="tutor-exam">
                  <input
                    id="tutor-exam"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className={select}
                  />
                </Field>
              </div>
            </Section>

            <Section
              n={2}
              title="Topics to work on"
              hint="Your topics and red/amber/green ratings come from your plan and My Topics."
            >
              {!subject ? (
                <p className="text-[13px] font-medium text-muted-foreground">
                  Choose a subject first.
                </p>
              ) : !topicOptions.length ? (
                <p className="text-[13px] font-medium text-muted-foreground">
                  No topics for {subject} yet.{" "}
                  <Link to="/topics" className="font-extrabold underline">
                    Add your topics
                  </Link>
                  , or leave this empty and your tutor will ask what you want to work on.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    {counts.red ? (
                      <QuickButton
                        onClick={() => selectWhere((o) => o.rating != null && o.rating <= 2)}
                      >
                        My red topics ({counts.red})
                      </QuickButton>
                    ) : null}
                    {counts.red + counts.amber ? (
                      <QuickButton
                        onClick={() => selectWhere((o) => o.rating != null && o.rating <= 4)}
                      >
                        Red and amber ({counts.red + counts.amber})
                      </QuickButton>
                    ) : null}
                    <QuickButton onClick={() => selectWhere(() => true)}>
                      All ({topicOptions.length})
                    </QuickButton>
                    <QuickButton onClick={() => setChosen(new Set())}>Clear</QuickButton>
                  </div>
                  <div className="mt-2 max-h-72 space-y-0.5 overflow-y-auto rounded-[10px] p-1 ring-1 ring-border">
                    {topicOptions.map((o) => (
                      <label
                        key={o.key}
                        className="flex cursor-pointer items-start gap-2 rounded-[8px] px-2 py-1.5 text-[13px] font-medium hover:bg-background"
                      >
                        <input
                          type="checkbox"
                          checked={chosen.has(o.key)}
                          onChange={() =>
                            setChosen((prev) => {
                              const next = new Set(prev);
                              if (next.has(o.key)) next.delete(o.key);
                              else next.add(o.key);
                              return next;
                            })
                          }
                          className="mt-0.5 size-4 shrink-0 accent-primary"
                        />
                        <span className="min-w-0 flex-1">{o.label}</span>
                        {o.rating != null ? (
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                              o.rating <= 2
                                ? "bg-conf-low/15 text-conf-low"
                                : o.rating <= 4
                                  ? "bg-conf-mid/15 text-conf-mid"
                                  : "bg-conf-high/10 text-conf-high"
                            }`}
                          >
                            {o.rating <= 2 ? "Red" : o.rating <= 4 ? "Amber" : "Green"}
                          </span>
                        ) : null}
                      </label>
                    ))}
                  </div>
                  <p className="mt-1 text-[12px] font-semibold text-muted-foreground">
                    {chosen.size} chosen
                  </p>
                </>
              )}
            </Section>

            <Section n={3} title="How should your tutor teach?">
              <ChoiceGroup
                label="Teaching style"
                options={APPROACHES}
                value={style.approach}
                onChange={(v) => set("approach", v)}
              />
              <ChoiceGroup
                label="Personality"
                options={TONES}
                value={style.tone}
                onChange={(v) => set("tone", v)}
              />
              <MultiGroup
                label="What should it help with?"
                options={ACTIVITIES}
                values={style.activities}
                onToggle={(v) => toggle("activities", v)}
              />
              <MultiGroup
                label="Types of question"
                options={QUESTION_TYPES}
                values={style.questionTypes}
                onToggle={(v) => toggle("questionTypes", v)}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Difficulty" htmlFor="tutor-diff">
                  <select
                    id="tutor-diff"
                    value={style.difficulty}
                    onChange={(e) => set("difficulty", e.target.value)}
                    className={select}
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Reply length" htmlFor="tutor-len">
                  <select
                    id="tutor-len"
                    value={style.responseLength}
                    onChange={(e) => set("responseLength", e.target.value)}
                    className={select}
                  >
                    {RESPONSE_LENGTHS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Session length" htmlFor="tutor-mins">
                  <select
                    id="tutor-mins"
                    value={style.sessionMinutes}
                    onChange={(e) => set("sessionMinutes", e.target.value)}
                    className={select}
                  >
                    {MINUTES.map((m) => (
                      <option key={m} value={m}>
                        {m} minutes
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </Section>

            <Section
              n={4}
              title="About you (optional)"
              hint="Helps your tutor fit how you learn. Don't add personal details like your school or address."
            >
              <MultiGroup
                label="Anything that helps you learn?"
                options={NEEDS}
                values={style.needs}
                onToggle={(v) => toggle("needs", v)}
              />
              <Field label="What should your tutor call you?" htmlFor="tutor-name">
                <input
                  id="tutor-name"
                  value={style.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="First name or nickname"
                  className={select}
                  maxLength={30}
                />
              </Field>
              <Field label="Anything else?" htmlFor="tutor-extra">
                <textarea
                  id="tutor-extra"
                  value={style.extra}
                  onChange={(e) => set("extra", e.target.value)}
                  rows={3}
                  maxLength={600}
                  placeholder="e.g. I keep losing marks on 6-mark questions. I'm studying An Inspector Calls and Macbeth."
                  className={`${select} h-auto`}
                />
              </Field>
            </Section>

            <Section
              n={5}
              title="Tutor rules"
              hint="Good habits for an AI tutor. Untick any you don't want."
            >
              <MultiGroup
                label=""
                options={RULES}
                values={style.rules}
                onToggle={(v) => toggle("rules", v)}
              />
            </Section>
          </div>

          <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
            <div className="rounded-[16px] bg-card p-4 ring-1 ring-black/5">
              <p className="text-sm font-extrabold">Your tutor prompt</p>
              <Field label="Which AI will you use?" htmlFor="tutor-ai">
                <select
                  id="tutor-ai"
                  value={assistant}
                  onChange={(e) => setAssistant(e.target.value as AssistantValue)}
                  className={select}
                >
                  {ASSISTANTS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </Field>
              <pre className="mt-3 max-h-[26rem] overflow-y-auto whitespace-pre-wrap rounded-[10px] bg-background p-3 text-[12px] font-medium leading-relaxed ring-1 ring-border">
                {prompt}
              </pre>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" onClick={() => void copy()} disabled={!subject}>
                  {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy prompt"}
                </Button>
                <Button type="button" variant="outline" onClick={download} disabled={!subject}>
                  <Download /> Download
                </Button>
                {assistantInfo.url ? (
                  <Button asChild variant="outline">
                    <a href={assistantInfo.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink /> Open {assistantInfo.label}
                    </a>
                  </Button>
                ) : null}
              </div>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-[12px] font-medium text-muted-foreground">
                <li>Copy the prompt.</li>
                <li>{assistantInfo.howTo}</li>
                <li>Answer your tutor's first questions and get going.</li>
              </ol>
              <p className="mt-3 text-[11px] font-semibold text-muted-foreground">
                AI tutors can make mistakes. Check important facts against your notes, textbook or
                exam board.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

const select =
  "mt-1 h-10 w-full rounded-[10px] bg-background px-3 text-[13px] font-semibold ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-ring";

function Section({
  n,
  title,
  hint,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-[16px] bg-card p-4 ring-1 ring-black/5 sm:p-5">
      <div>
        <p className="flex items-center gap-2 text-sm font-extrabold">
          <span className="grid size-6 place-items-center rounded-[6px] bg-primary text-[12px] text-primary-foreground">
            {n}
          </span>
          {title}
        </p>
        {hint ? <p className="mt-1 text-[12px] font-medium text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-2 first:mt-0">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function QuickButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-background px-3 py-1.5 text-[12px] font-bold ring-1 ring-border hover:bg-secondary"
    >
      {children}
    </button>
  );
}

function ChoiceGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Choice[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </legend>
      <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex cursor-pointer items-start gap-2 rounded-[10px] p-2.5 text-[13px] ring-1 ${
              value === o.value ? "bg-secondary ring-2 ring-primary" : "bg-background ring-border"
            }`}
          >
            <input
              type="radio"
              name={label}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="mt-0.5 accent-primary"
            />
            <span>
              <span className="block font-extrabold">{o.label}</span>
              <span className="block text-[12px] font-medium text-muted-foreground">
                {o.prompt}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function MultiGroup({
  label,
  options,
  values,
  onToggle,
}: {
  label: string;
  options: Choice[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <fieldset>
      {label ? (
        <legend className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </legend>
      ) : null}
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = values.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(o.value)}
              title={o.prompt}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold ${
                on
                  ? "bg-structure text-structure-foreground"
                  : "bg-background text-muted-foreground ring-1 ring-border"
              }`}
            >
              {on ? <Check className="size-3" strokeWidth={3} /> : null}
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
