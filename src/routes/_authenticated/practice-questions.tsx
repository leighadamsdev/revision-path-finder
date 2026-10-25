import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Download, ExternalLink, FolderOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { BandLegend } from "@/components/BandChip";
import { ConfidencePicker } from "@/components/ConfidencePicker";
import { PremiumPage } from "@/components/PremiumPage";
import {
  ChoiceGroup,
  Field,
  MultiGroup,
  QuickButton,
  Section,
  select,
} from "@/components/PromptForm";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/hooks/useLibrary";
import { useTopicRatings } from "@/hooks/useTopicRatings";
import { GCSE_SUBJECTS, SUBJECT_GROUPS, isTiered } from "@/lib/gcse-subjects";
import { subjectUnits } from "@/lib/gcse-topics";
import { TOPIC_SUB_SEP, topicLines, withWholeTopicRatings } from "@/lib/library";
import {
  DEFAULT_PRACTICE,
  FORMATS,
  LEVELS,
  QUESTION_COUNTS,
  buildPracticePrompt,
  type PracticeSettings,
} from "@/lib/practice-prompt";
import {
  deletePracticeSet,
  fetchPracticeSets,
  savePracticeSet,
  type PracticeSet,
} from "@/lib/practice-sets";
import { specUnits } from "@/lib/spec-topics";
import {
  ASSISTANTS,
  defaultQuestionTypes,
  questionTypesFor,
  type AssistantValue,
} from "@/lib/tutor-prompt";
import { takeTutorHandoff, tutorTier } from "@/lib/tutor-handoff";

export const Route = createFileRoute("/_authenticated/practice-questions")({
  head: () => ({
    meta: [
      { title: "Practice exam questions — RevPlan" },
      {
        name: "description",
        content:
          "Create a prompt that turns ChatGPT, Claude, Gemini or Copilot into a GCSE examiner who writes practice questions on your topics and marks your answers.",
      },
      { property: "og:title", content: "Practice exam questions — RevPlan" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PremiumPage feature="Practice exam questions">
      <PracticeQuestionsPage />
    </PremiumPage>
  ),
});

const BOARDS = ["AQA", "Edexcel (Pearson)", "OCR", "WJEC / Eduqas", "CCEA", "Other"];
const SAVE_KEY = "revplan.practice";

/** A topic the student can tick. `key` is also the rating key, so ratings carry across RevPlan. */
type TopicOption = {
  key: string;
  label: string;
  group: string;
  rating: number | null;
  rateable: boolean;
};

type Style = typeof DEFAULT_PRACTICE;

function loadStyle(): Style {
  try {
    return {
      ...DEFAULT_PRACTICE,
      ...(JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "{}") as Partial<Style>),
    };
  } catch {
    return DEFAULT_PRACTICE;
  }
}

function PracticeQuestionsPage() {
  const library = useLibrary();
  const { ratings, rate } = useTopicRatings();
  const queryClient = useQueryClient();
  const saved = useQuery({ queryKey: ["practice-sets"], queryFn: fetchPracticeSets });

  const [subject, setSubject] = useState("");
  const [board, setBoard] = useState("");
  const [tier, setTier] = useState("");
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [own, setOwn] = useState<string[]>([]);
  const [ownDraft, setOwnDraft] = useState("");
  const [questionTypes, setQuestionTypes] = useState<string[]>([]);
  const [style, setStyle] = useState<Style>(DEFAULT_PRACTICE);
  const [assistant, setAssistant] = useState<AssistantValue>("chatgpt");
  const [copied, setCopied] = useState(false);
  const [setName, setSetName] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingTopics, setPendingTopics] = useState<string[] | null>(null);

  useEffect(() => setStyle(loadStyle()), []);
  useEffect(() => {
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(style));
    } catch {
      /* storage unavailable */
    }
  }, [style]);

  const libSubject = library.subjects.find(
    (s) => s.name.trim().toLowerCase() === subject.trim().toLowerCase(),
  );

  /** My Topics first (with ratings), otherwise the exam board list, otherwise the DfE list. */
  const topicOptions: TopicOption[] = useMemo(() => {
    if (!subject) return [];
    if (libSubject?.topics.length) {
      const mine = withWholeTopicRatings(ratings[subject] ?? {}, libSubject.topics);
      return libSubject.topics.flatMap((t) =>
        topicLines(t).map((line) => ({
          key: line,
          label: line.includes(TOPIC_SUB_SEP)
            ? line.slice(line.indexOf(TOPIC_SUB_SEP) + TOPIC_SUB_SEP.length)
            : line,
          group: t.title,
          rating: mine[line] ?? null,
          rateable: true,
        })),
      );
    }
    const spec = specUnits(subject);
    const units = spec.length ? spec : subjectUnits(subject);
    return units.flatMap((u) =>
      u.elements.map((e) => ({
        key: e.label,
        label: e.label,
        group: u.unit,
        rating: spec.length ? (ratings[subject]?.[e.label] ?? null) : null,
        rateable: spec.length > 0,
      })),
    );
  }, [subject, libSubject, ratings]);

  const groups = useMemo(() => {
    const out: { name: string; options: TopicOption[] }[] = [];
    for (const o of topicOptions) {
      const last = out[out.length - 1];
      if (last && last.name === o.group) last.options.push(o);
      else out.push({ name: o.group, options: [o] });
    }
    return out;
  }, [topicOptions]);

  function chooseSubject(name: string) {
    setSubject(name);
    setChosen(new Set());
    setOwn([]);
    setQuestionTypes(defaultQuestionTypes(name));
    const lib = library.subjects.find(
      (s) => s.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
    setBoard(lib?.exam_board && BOARDS.includes(lib.exam_board) ? lib.exam_board : "");
    setTier(!name ? "" : isTiered(name) ? tutorTier(lib?.qualification_level) : "Not tiered");
  }

  // If the subject was picked before My Subjects had loaded, fill in its board and tier now.
  useEffect(() => {
    if (!libSubject) return;
    if (libSubject.exam_board && BOARDS.includes(libSubject.exam_board))
      setBoard((b) => b || libSubject.exam_board!);
    if (isTiered(libSubject.name)) setTier((t) => t || tutorTier(libSubject.qualification_level));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libSubject?.id]);

  // Arriving from Rate my topics: start on that subject with its red topics ticked.
  useEffect(() => {
    if (library.isLoading) return;
    const h = takeTutorHandoff();
    if (!h || !GCSE_SUBJECTS.some((s) => s.name === h.subject)) return;
    chooseSubject(h.subject);
    setPendingTopics(h.topics.map((t) => t.text));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [library.isLoading]);
  useEffect(() => {
    if (!pendingTopics || !topicOptions.length) return;
    const wanted = new Set(pendingTopics);
    setChosen(new Set(topicOptions.filter((o) => wanted.has(o.key)).map((o) => o.key)));
    setPendingTopics(null);
  }, [pendingTopics, topicOptions]);

  const picked = topicOptions.filter((o) => chosen.has(o.key));
  const settings: PracticeSettings = {
    ...style,
    subject,
    board,
    tier,
    questionTypes,
    topics: [
      ...picked.map((o) => ({ text: o.key, rating: o.rating })),
      ...own.map((text) => ({ text, rating: null })),
    ],
  };
  const prompt = buildPracticePrompt(settings);
  const assistantInfo = ASSISTANTS.find((a) => a.value === assistant)!;

  function selectWhere(test: (o: TopicOption) => boolean) {
    setChosen(new Set(topicOptions.filter(test).map((o) => o.key)));
  }
  const reds = topicOptions.filter((o) => o.rating != null && o.rating <= 2).length;
  const redsAndAmbers = topicOptions.filter((o) => o.rating != null && o.rating <= 4).length;

  function addOwn() {
    const text = ownDraft.trim();
    if (text && !own.some((o) => o.toLowerCase() === text.toLowerCase()))
      setOwn((prev) => [...prev, text]);
    setOwnDraft("");
  }

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
    a.download = `${(subject || "gcse").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-practice-questions.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function saveSet() {
    setSaving(true);
    try {
      await savePracticeSet(setName || `${subject} practice`, settings);
      setSetName("");
      await queryClient.invalidateQueries({ queryKey: ["practice-sets"] });
      toast.success("Saved. Open it any time to make a fresh set of questions.");
    } catch {
      toast.error("That set didn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function openSet(s: PracticeSet) {
    const v = s.settings;
    setSubject(v.subject);
    setBoard(v.board);
    setTier(v.tier);
    setQuestionTypes(v.questionTypes ?? defaultQuestionTypes(v.subject));
    setStyle({
      count: v.count,
      level: v.level,
      format: v.format,
      timed: v.timed,
      extra: v.extra ?? "",
    });
    const texts = (v.topics ?? []).map((t) => t.text);
    setOwn([]);
    setPendingTopics(texts);
    // Topics that aren't on the list any more come back as your own topics.
    window.setTimeout(() => {
      setOwn(texts.filter((t) => !topicOptionsFor(v.subject).has(t)));
    }, 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success(`Opened "${s.name}".`);
  }

  function topicOptionsFor(name: string): Set<string> {
    const lib = library.subjects.find(
      (x) => x.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
    if (lib?.topics.length) return new Set(lib.topics.flatMap(topicLines));
    const spec = specUnits(name);
    return new Set(
      (spec.length ? spec : subjectUnits(name)).flatMap((u) => u.elements.map((e) => e.label)),
    );
  }

  async function removeSet(s: PracticeSet) {
    if (!window.confirm(`Delete "${s.name}"?`)) return;
    try {
      await deletePracticeSet(s.id);
      await queryClient.invalidateQueries({ queryKey: ["practice-sets"] });
    } catch {
      toast.error("Couldn't delete that set. Please try again.");
    }
  }

  const set = <K extends keyof Style>(key: K, value: Style[K]) =>
    setStyle((s) => ({ ...s, [key]: value }));

  return (
    <AppShell>
      <h1 className="text-xl font-extrabold tracking-tight">Practice exam questions</h1>
      <p className="mt-1 max-w-[70ch] text-[13px] font-medium text-muted-foreground">
        Choose your subject, topics and the kind of questions you want. We'll write a prompt that
        turns ChatGPT, Claude, Gemini or Copilot into an examiner who sets you exam-style questions
        and only shows the mark scheme once you've answered.
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="min-w-0 space-y-4">
          <Section n={1} title="Subject and exam">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Subject" htmlFor="pq-subject">
                <select
                  id="pq-subject"
                  value={subject}
                  onChange={(e) => chooseSubject(e.target.value)}
                  className={select}
                >
                  <option value="">Choose a subject…</option>
                  {library.subjects.length ? (
                    <optgroup label="My subjects">
                      {library.subjects
                        .filter((s) => GCSE_SUBJECTS.some((g) => g.name === s.name))
                        .map((s) => (
                          <option key={`mine-${s.id}`} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                    </optgroup>
                  ) : null}
                  {SUBJECT_GROUPS.map((g) => (
                    <optgroup key={g} label={g}>
                      {GCSE_SUBJECTS.filter((s) => s.group === g).map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </Field>
              <Field label="Exam board" htmlFor="pq-board">
                <select
                  id="pq-board"
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
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
              <Field label="Tier" htmlFor="pq-tier">
                <select
                  id="pq-tier"
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className={select}
                >
                  <option value="">Not sure</option>
                  <option value="Foundation">Foundation</option>
                  <option value="Higher">Higher</option>
                  <option value="Not tiered">Not tiered</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section
            n={2}
            title="Topics to test"
            hint={
              libSubject?.topics.length
                ? "From My Topics, with your ratings. Red topics get the most questions."
                : "From the exam board list. Add topics in My Topics to see your own list and ratings here."
            }
          >
            {!subject ? (
              <p className="text-[13px] font-medium text-muted-foreground">
                Choose a subject first.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {reds ? (
                    <QuickButton
                      onClick={() => selectWhere((o) => o.rating != null && o.rating <= 2)}
                    >
                      My red topics ({reds})
                    </QuickButton>
                  ) : null}
                  {redsAndAmbers > reds ? (
                    <QuickButton
                      onClick={() => selectWhere((o) => o.rating != null && o.rating <= 4)}
                    >
                      Red and amber ({redsAndAmbers})
                    </QuickButton>
                  ) : null}
                  {topicOptions.length ? (
                    <QuickButton onClick={() => selectWhere(() => true)}>
                      All ({topicOptions.length})
                    </QuickButton>
                  ) : null}
                  <QuickButton onClick={() => setChosen(new Set())}>Clear</QuickButton>
                </div>
                {groups.length ? (
                  <div className="mt-2 max-h-80 space-y-2 overflow-y-auto rounded-[10px] p-2 ring-1 ring-border">
                    {groups.map((g) => (
                      <div key={g.name}>
                        <p className="px-1 pb-0.5 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                          {g.name}
                        </p>
                        {g.options.map((o) => (
                          <label
                            key={o.key}
                            className="flex cursor-pointer items-center gap-2 rounded-[8px] px-2 py-1.5 text-[13px] font-medium hover:bg-background"
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
                              className="size-4 shrink-0 accent-primary"
                            />
                            <span className="min-w-0 flex-1">{o.label}</span>
                            {o.rating != null ? (
                              <span
                                className={`size-2.5 shrink-0 rounded-full ${o.rating <= 2 ? "bg-conf-low" : o.rating <= 4 ? "bg-conf-mid" : "bg-conf-high"}`}
                                title={o.rating <= 2 ? "Red" : o.rating <= 4 ? "Amber" : "Green"}
                              />
                            ) : null}
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : null}
                <form
                  className="mt-2 flex flex-wrap gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addOwn();
                  }}
                >
                  <input
                    value={ownDraft}
                    onChange={(e) => setOwnDraft(e.target.value)}
                    placeholder="Add your own topic, e.g. Simultaneous equations"
                    aria-label="Add your own topic"
                    maxLength={120}
                    className={`${select} mt-0 min-w-0 flex-1`}
                  />
                  <Button type="submit" variant="outline" disabled={!ownDraft.trim()}>
                    Add
                  </Button>
                </form>
                {own.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {own.map((o) => (
                      <span
                        key={o}
                        className="inline-flex items-center gap-1 rounded-full bg-structure px-3 py-1 text-[12px] font-bold text-structure-foreground"
                      >
                        {o}
                        <button
                          type="button"
                          aria-label={`Remove ${o}`}
                          onClick={() => setOwn((prev) => prev.filter((x) => x !== o))}
                          className="ml-1 opacity-80 hover:opacity-100"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
                <p className="mt-1 text-[12px] font-semibold text-muted-foreground">
                  {picked.length + own.length
                    ? `${picked.length + own.length} chosen`
                    : "Nothing ticked: the examiner will cover a spread of topics."}
                </p>
              </>
            )}
          </Section>

          <Section n={3} title="The questions">
            {subject ? (
              <MultiGroup
                label={`Types of ${subject} exam question`}
                options={questionTypesFor(subject)}
                values={questionTypes}
                onToggle={(v) =>
                  setQuestionTypes((prev) =>
                    prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
                  )
                }
              />
            ) : null}
            <Field label="How many questions?" htmlFor="pq-count">
              <select
                id="pq-count"
                value={style.count}
                onChange={(e) => set("count", e.target.value)}
                className={select}
              >
                {QUESTION_COUNTS.map((n) => (
                  <option key={n} value={n}>
                    {n} questions
                  </option>
                ))}
              </select>
            </Field>
            <ChoiceGroup
              label="How hard?"
              options={LEVELS}
              value={style.level}
              onChange={(v) => set("level", v)}
            />
            <ChoiceGroup
              label="How do you want them?"
              options={FORMATS}
              value={style.format}
              onChange={(v) => set("format", v)}
            />
            {style.format === "paper" ? (
              <label className="flex items-center gap-2 text-[13px] font-semibold">
                <input
                  type="checkbox"
                  checked={style.timed}
                  onChange={(e) => set("timed", e.target.checked)}
                  className="size-4 accent-primary"
                />
                Include a time limit (about a minute per mark)
              </label>
            ) : null}
            <Field label="Anything else?" htmlFor="pq-extra">
              <textarea
                id="pq-extra"
                value={style.extra}
                onChange={(e) => set("extra", e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="e.g. Include one 6-mark question. Use the texts I study: Macbeth and An Inspector Calls."
                className={`${select} h-auto`}
              />
            </Field>
          </Section>

          <Section
            n={4}
            title="After you've practised"
            hint="Update your ratings so your plan keeps focusing on what you find hardest."
          >
            {picked.filter((o) => o.rateable).length ? (
              <>
                <BandLegend />
                <ul className="divide-y divide-border/60">
                  {picked
                    .filter((o) => o.rateable)
                    .map((o) => (
                      <li
                        key={o.key}
                        className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2"
                      >
                        <span className="min-w-0 flex-1 text-[13px] font-medium">{o.label}</span>
                        <ConfidencePicker
                          size="sm"
                          label={o.label}
                          value={o.rating}
                          onChange={(v) => void rate(subject, o.key, v)}
                        />
                      </li>
                    ))}
                </ul>
              </>
            ) : (
              <p className="text-[13px] font-medium text-muted-foreground">
                Tick topics above and they'll appear here to rate once you've done the questions.
                You can also rate them any time in{" "}
                <Link to="/rate-topics" className="font-bold underline">
                  Rate my topics
                </Link>
                .
              </p>
            )}
          </Section>
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-[16px] bg-card p-4 ring-1 ring-black/5">
            <p className="text-sm font-extrabold">Your examiner prompt</p>
            <Field label="Which AI will you use?" htmlFor="pq-ai">
              <select
                id="pq-ai"
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
            <pre className="mt-3 max-h-[24rem] overflow-y-auto whitespace-pre-wrap rounded-[10px] bg-background p-3 text-[12px] font-medium leading-relaxed ring-1 ring-border">
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
              <li>{assistantInfo.howTo.replace("To keep your tutor", "To reuse it")}</li>
              <li>
                {style.format === "paper"
                  ? "Print or save the paper, do it under exam conditions, then check the mark scheme."
                  : "Answer each question. The mark scheme appears after you reply."}
              </li>
              <li>Come back and update your ratings (step 4).</li>
            </ol>
            <p className="mt-3 text-[11px] font-semibold text-muted-foreground">
              AI can make mistakes. Check answers against your notes, textbook or past papers.
            </p>
          </div>

          <div className="rounded-[16px] bg-card p-4 ring-1 ring-black/5">
            <p className="text-sm font-extrabold">Saved sets</p>
            <p className="mt-0.5 text-[12px] font-medium text-muted-foreground">
              Save these settings to make a fresh set of questions any time.
            </p>
            <form
              className="mt-2 flex flex-wrap gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void saveSet();
              }}
            >
              <input
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                placeholder={subject ? `${subject} practice` : "Name this set"}
                aria-label="Name this set"
                maxLength={60}
                className={`${select} mt-0 min-w-0 flex-1`}
              />
              <Button type="submit" variant="outline" disabled={!subject || saving}>
                {saving ? "Saving…" : "Save set"}
              </Button>
            </form>
            {saved.data?.length ? (
              <ul className="mt-3 divide-y divide-border/60">
                {saved.data.map((s) => (
                  <li key={s.id} className="flex items-center gap-2 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold">{s.name}</p>
                      <p className="truncate text-[11px] font-medium text-muted-foreground">
                        {s.settings.subject} · {s.settings.count} questions ·{" "}
                        {s.settings.topics?.length || "any"} topics
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => openSet(s)}>
                      <FolderOpen /> Open
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${s.name}`}
                      onClick={() => void removeSet(s)}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : saved.isError ? (
              <p className="mt-3 text-[12px] font-medium text-muted-foreground">
                Saved sets aren't available just now.
              </p>
            ) : (
              <p className="mt-3 text-[12px] font-medium text-muted-foreground">
                No saved sets yet.
              </p>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
