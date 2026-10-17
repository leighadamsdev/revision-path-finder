import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Clock3,
  Download,
  EyeOff,
  FileDown,
  Highlighter,
  Pause,
  Play,
  Plus,
  Printer,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";
import { ItemMultiSelect } from "@/components/ItemMultiSelect";
import { SavedCheckers } from "@/components/SavedCheckers";
import { useAuth } from "@/hooks/useAuth";
import { useActivePlan, usePlanSubjects } from "@/hooks/useActivePlan";
import { FocusSound } from "@/components/FocusSound";
import { subjectUnits } from "@/lib/gcse-topics";
import { useLibrary, useOnboardingGate } from "@/hooks/useLibrary";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/knowledge-checker")({
  head: () => ({
    meta: [
      { title: "Online Revision Knowledge Checker | rev.plan" },
      {
        name: "description",
        content:
          "Complete a GCSE closed-book brain dump, highlight knowledge gaps, and identify what to revise next.",
      },
      { property: "og:title", content: "Online Revision Knowledge Checker | rev.plan" },
      {
        property: "og:description",
        content: "A free, fillable GCSE active-recall and knowledge-gap worksheet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KnowledgeCheckerPage,
});

type CheckerRow = { id: string; component: string; recall: string; gaps: string };
type CheckerDraft = { subject: string; topic: string; date: string; rows: CheckerRow[] };
type Flashcard = { id: string; term: string; definition: string; source: string };

const STORAGE_KEY = "revplan.knowledgeChecker";
const EMPTY_ROWS: CheckerRow[] = [1, 2, 3].map((number) => ({
  id: `starter-${number}`,
  component: "",
  recall: "",
  gaps: "",
}));

function countPoints(value: string) {
  return value.split("\n").filter((line) => line.trim().length > 0).length;
}

function formatClock(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function splitGapIntoFlashcard(line: string, row: CheckerRow, index: number): Flashcard {
  const source = row.component.trim() || "Knowledge gap";
  const colonIndex = line.indexOf(":");
  const dashMatch = line.match(/\s[—–-]\s/);
  const splitIndex = colonIndex > 0 ? colonIndex : dashMatch?.index;
  const splitLength = colonIndex > 0 ? 1 : dashMatch?.[0].length;

  if (splitIndex && splitLength) {
    const term = line.slice(0, splitIndex).trim();
    const definition = line.slice(splitIndex + splitLength).trim();
    if (term.length > 0 && definition.length > 0) {
      return { id: `${row.id}-${index}`, term, definition, source };
    }
  }

  return { id: `${row.id}-${index}`, term: source, definition: line, source };
}

function buildFlashcards(rows: CheckerRow[]) {
  return rows.flatMap((row) =>
    row.gaps
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => splitGapIntoFlashcard(line, row, index)),
  );
}

function KnowledgeCheckerPage() {
  useOnboardingGate();
  const library = useLibrary();
  const [libSubjectId, setLibSubjectId] = useState("");
  const [libTopicId, setLibTopicId] = useState("");
  const { user } = useAuth();
  const { plan } = useActivePlan();
  const planSubjectsQuery = usePlanSubjects(plan?.id);
  /** Library subjects plus any plan subject not yet in the library; DfE content fills gaps. */
  const subjectOptions = useMemo(() => {
    const list = library.subjects.map((s) => ({
      id: s.id,
      name: s.name,
      topics: s.topics.length
        ? s.topics.map((t) => ({ id: t.id, title: t.title, items: t.items.map((i) => ({ id: i.id, title: i.title })) }))
        : dfeTopics(s.name),
      fromLibrary: s.topics.length > 0,
    }));
    const seen = new Set(list.map((s) => s.name.trim().toLowerCase()));
    for (const ps of planSubjectsQuery.data ?? []) {
      const name = (ps as unknown as { name?: string; subject?: { name: string } }).name ?? (ps as unknown as { subject?: { name: string } }).subject?.name;
      if (!name || seen.has(name.trim().toLowerCase())) continue;
      seen.add(name.trim().toLowerCase());
      list.push({ id: `plan:${name}`, name, topics: dfeTopics(name), fromLibrary: false });
    }
    return list;
  }, [library.subjects, planSubjectsQuery.data]);
  const libSubject = subjectOptions.find((s) => s.id === libSubjectId);
  const libTopic = libSubject?.topics.find((t) => t.id === libTopicId);
  const sheetRef = useRef<HTMLElement | null>(null);
  const [fullScreen, setFullScreen] = useState(false);
  useEffect(() => {
    const onChange = () => setFullScreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  function toggleFullScreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void sheetRef.current?.requestFullscreen?.().catch(() => setFullScreen(true));
  }
  const [draft, setDraft] = useState<CheckerDraft>({ subject: "", topic: "", date: "", rows: EMPTY_ROWS });
  const [mode, setMode] = useState<"recall" | "check">("recall");
  const [remaining, setRemaining] = useState(30 * 60);
  const [running, setRunning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CheckerDraft;
        if (Array.isArray(parsed.rows) && parsed.rows.length > 0) setDraft(parsed);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, loaded]);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  const totals = useMemo(
    () => ({
      secure: draft.rows.reduce((sum, row) => sum + countPoints(row.recall), 0),
      gaps: draft.rows.reduce((sum, row) => sum + countPoints(row.gaps), 0),
    }),
    [draft.rows],
  );

  const flashcards = useMemo(() => buildFlashcards(draft.rows), [draft.rows]);

  function patchRow(id: string, patch: Partial<CheckerRow>) {
    setDraft((current) => ({
      ...current,
      rows: current.rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    }));
  }

  function addRow() {
    setDraft((current) => ({
      ...current,
      rows: [...current.rows, { id: `row-${Date.now()}`, component: "", recall: "", gaps: "" }],
    }));
  }

  function addSubRow(id: string) {
    setDraft((current) => {
      const i = current.rows.findIndex((row) => row.id === id);
      if (i < 0) return current;
      const parent = current.rows[i]!.component.split(" › ")[0]!.trim();
      const rows = [...current.rows];
      rows.splice(i + 1, 0, { id: `row-${Date.now()}`, component: parent ? `${parent} › ` : "", recall: "", gaps: "" });
      return { ...current, rows };
    });
  }

  function removeRow(id: string) {
    setDraft((current) => ({ ...current, rows: current.rows.filter((row) => row.id !== id) }));
  }

  function resetChecker() {
    setDraft({ subject: "", topic: "", date: "", rows: EMPTY_ROWS });
    setMode("recall");
    setRemaining(30 * 60);
    setRunning(false);
    setShowFlashcards(false);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  async function downloadFlashcards() {
    if (flashcards.length === 0) return;
    const {
      AlignmentType,
      BorderStyle,
      Document: WordDocument,
      HeadingLevel,
      Packer,
      Paragraph,
      ShadingType,
      Table,
      TableCell,
      TableRow,
      TextRun,
      WidthType,
    } = await import("docx");
    const border = { style: BorderStyle.SINGLE, size: 6, color: "0E333D" };
    const borders = { top: border, bottom: border, left: border, right: border };
    const cell = (text: string, width: number, heading = false) =>
      new TableCell({
        width: { size: width, type: WidthType.DXA },
        borders,
        margins: { top: 180, bottom: 180, left: 180, right: 180 },
        ...(heading ? { shading: { fill: "94D8CA", type: ShadingType.CLEAR } } : {}),
        children: [new Paragraph({ children: [new TextRun({ text, bold: heading, color: "0E333D" })] })],
      });
    const wordDocument = new WordDocument({
      styles: {
        default: { document: { run: { font: "Arial", size: 22, color: "0E333D" } } },
        paragraphStyles: [
          {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: { font: "Arial", size: 34, bold: true, color: "0E333D" },
            paragraph: { spacing: { after: 160 }, outlineLevel: 0 },
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              size: { width: 12240, height: 15840 },
              margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
            },
          },
          children: [
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun("Revision gap flashcards")],
            }),
            new Paragraph({
              spacing: { after: 280 },
              children: [
                new TextRun({ text: draft.subject.trim() || "Subject not added", bold: true }),
                new TextRun({ text: draft.topic.trim() ? ` · ${draft.topic.trim()}` : "" }),
              ],
            }),
            new Table({
              width: { size: 10080, type: WidthType.DXA },
              columnWidths: [3360, 6720],
              rows: [
                new TableRow({ children: [cell("Front — key term", 3360, true), cell("Back — definition", 6720, true)] }),
                ...flashcards.map(
                  (card) => new TableRow({ children: [cell(card.term, 3360), cell(card.definition, 6720)] }),
                ),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 240 },
              children: [new TextRun({ text: "rev.plan · made from highlighted knowledge gaps", size: 18, color: "527078" })],
            }),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(wordDocument);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "revplan-gap-flashcards.docx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function downloadBlankPdf() {
    try {
      const response = await fetch("/revplan-knowledge-checker.pdf");
      if (!response.ok) throw new Error("Not found");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "revplan-knowledge-checker.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      window.open("/revplan-knowledge-checker.pdf", "_blank", "noopener");
    }
  }

  return (
    <div className="min-h-screen bg-checker-paper font-sans text-checker-ink">
      <PublicHeader />
      <main className="knowledge-checker-print mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end print:hidden">
          <div>
            <p className="text-xs font-extrabold uppercase text-muted-foreground">Online worksheet</p>
            <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">Revision Knowledge Checker</h1>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-relaxed text-muted-foreground">
              Brain dump from memory first. Then open your notes and highlight exactly what was missing.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button asChild variant="outline">
              <Link to="/topics"><BookOpen /> My Topics</Link>
            </Button>
            <Button type="button" variant="outline" onClick={downloadBlankPdf}>
              <Download /> Blank PDF
            </Button>
            <Button type="button" variant="outline" onClick={() => window.print()}><Printer /> Print this sheet</Button>
          </div>
        </header>

        <section ref={sheetRef} className={`mt-7 rounded-[8px] border border-checker-ink bg-card shadow-sm print:hidden ${fullScreen ? "fixed inset-0 z-50 mt-0 overflow-y-auto rounded-none" : "overflow-hidden"}`}>
          <div className="flex flex-col gap-4 bg-checker-ink p-5 text-checker-paper sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase text-checker-mint">rev.plan · active recall</p>
              <p className="mt-1 text-lg font-extrabold">Closed book first. Be honest with the gaps.</p>
            </div>
            <div className="flex items-center gap-2 rounded-[8px] border border-checker-mint/35 px-3 py-2">
              <Clock3 className="size-4 text-checker-mint" />
              <span className="min-w-[62px] text-center font-extrabold tabular-nums">{formatClock(remaining)}</span>
              <Button type="button" size="icon" variant="ghost" aria-label={running ? "Pause timer" : "Start timer"} onClick={() => setRunning((value) => !value)} className="text-checker-mint hover:bg-checker-mint/10 hover:text-checker-mint">
                {running ? <Pause /> : <Play />}
              </Button>
              <Button type="button" size="icon" variant="ghost" aria-label="Reset timer" onClick={() => { setRemaining(30 * 60); setRunning(false); }} className="text-checker-paper/70 hover:bg-checker-mint/10 hover:text-checker-paper">
                <RotateCcw />
              </Button>
            </div>
            <FocusSound className="text-checker-paper" />
            <Button type="button" variant="secondary" onClick={toggleFullScreen}>
              {fullScreen ? "Exit full screen" : "Do it in the app (full screen)"}
            </Button>
          </div>

          {subjectOptions.length ? (
            <>
            <div className="grid gap-3 border-b border-checker-line bg-card p-5 sm:grid-cols-3">
              <label className="text-xs font-extrabold uppercase text-muted-foreground">From my library: subject
                <select value={libSubjectId} onChange={(e) => { setLibSubjectId(e.target.value); setLibTopicId(""); const s = subjectOptions.find((x) => x.id === e.target.value); if (s) setDraft((c) => ({ ...c, subject: s.name })); }} className="mt-2 h-11 w-full rounded-md bg-card px-2 text-sm font-bold normal-case ring-1 ring-border">
                  <option value="">Choose…</option>
                  {subjectOptions.map((s) => <option key={s.id} value={s.id}>{s.name}{s.fromLibrary ? "" : s.topics.length ? " (DfE content)" : " (no content yet)"}</option>)}
                </select>
              </label>
              <label className="text-xs font-extrabold uppercase text-muted-foreground">Topic
                <select value={libTopicId} disabled={!libSubject} onChange={(e) => { setLibTopicId(e.target.value); const t = libSubject?.topics.find((x) => x.id === e.target.value); if (t) setDraft((c) => ({ ...c, topic: t.title, rows: t.items.length ? t.items.map((i) => ({ id: i.id, component: i.title, recall: "", gaps: "" })) : c.rows })); }} className="mt-2 h-11 w-full rounded-md bg-card px-2 text-sm font-bold normal-case ring-1 ring-border">
                  <option value="">Choose…</option>
                  {libSubject?.topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </label>
              <div className="text-xs font-extrabold uppercase text-muted-foreground">Content items
                <ItemMultiSelect items={libTopic?.items ?? []} disabled={!libTopic || !libTopic.items.length} onAdd={(sel) => setDraft((c) => ({ ...c, rows: sel.map((i) => ({ id: i.id, component: i.title, recall: "", gaps: "" })) }))} />
              </div>
            </div>
            {libSubject && !libSubject.fromLibrary ? (
              <div className="border-b border-checker-line bg-secondary px-5 py-3 text-sm font-semibold">
                {libSubject.topics.length
                  ? `You haven't added your own content for ${libSubject.name} yet, so the DfE content list is shown. `
                  : `There's no content for ${libSubject.name} yet. `}
                You can <Link to="/topics" className="font-extrabold underline">upload a contents page or topic list</Link>, use the DfE content, or type the topic and components in below.
              </div>
            ) : null}
            </>
          ) : null}

          <div className="grid gap-4 border-b border-checker-line bg-checker-paper p-5 sm:grid-cols-[1fr_1.4fr_0.7fr]">
            <label className="text-xs font-extrabold uppercase text-muted-foreground">Subject
              <Input value={draft.subject} onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))} placeholder="e.g. Biology" className="mt-2 h-11 bg-card text-sm font-bold normal-case text-checker-ink" />
            </label>
            <label className="text-xs font-extrabold uppercase text-muted-foreground">Topic title
              <Input value={draft.topic} onChange={(event) => setDraft((current) => ({ ...current, topic: event.target.value }))} placeholder="e.g. Enzymes" className="mt-2 h-11 bg-card text-sm font-bold normal-case text-checker-ink" />
            </label>
            <label className="text-xs font-extrabold uppercase text-muted-foreground">Date
              <Input type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} className="mt-2 h-11 bg-card text-sm font-bold normal-case text-checker-ink" />
            </label>
          </div>

          <div className="flex flex-col justify-between gap-3 border-b border-checker-line px-5 py-4 sm:flex-row sm:items-center print:hidden">
            <div className="inline-flex self-start rounded-[8px] border border-checker-line bg-checker-paper p-1">
              <Button type="button" size="sm" variant="ghost" onClick={() => setMode("recall")} className={cn("rounded-[6px]", mode === "recall" && "bg-checker-ink text-checker-paper hover:bg-checker-ink hover:text-checker-paper")}><EyeOff /> 1. Closed book</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setMode("check")} className={cn("rounded-[6px]", mode === "check" && "bg-checker-mint text-checker-ink hover:bg-checker-mint hover:text-checker-ink")}><BookOpen /> 2. Check gaps</Button>
            </div>
            <p className="text-xs font-bold text-muted-foreground">Your work saves automatically on this device.</p>
          </div>

          <div className="divide-y divide-checker-line">
            {draft.rows.map((row, index) => (
              <article key={row.id} className="grid md:grid-cols-[0.7fr_1.3fr]">
                <div className="border-b border-checker-line bg-checker-paper p-4 md:border-b-0 md:border-r">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor={`component-${row.id}`} className="text-xs font-extrabold uppercase text-muted-foreground">Key component {index + 1}</label>
                    {draft.rows.length > 1 ? <Button type="button" size="icon" variant="ghost" aria-label={`Remove component ${index + 1}`} onClick={() => removeRow(row.id)} className="size-8 text-muted-foreground print:hidden"><Trash2 /></Button> : null}
                  </div>
                  <Input id={`component-${row.id}`} value={row.component} onChange={(event) => patchRow(row.id, { component: event.target.value })} placeholder="e.g. Lock-and-key model" className="mt-3 h-11 bg-card font-bold" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => addSubRow(row.id)} className="mt-2 text-xs font-bold text-muted-foreground print:hidden"><Plus /> Add sub-point</Button>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  <label className="text-xs font-extrabold uppercase text-muted-foreground">What I already know
                    <Textarea value={row.recall} onChange={(event) => patchRow(row.id, { recall: event.target.value })} placeholder="One recalled point per line…" className="mt-3 min-h-36 resize-y bg-card text-sm font-semibold normal-case leading-relaxed text-checker-ink" />
                  </label>
                  <label className={cn("text-xs font-extrabold uppercase text-checker-ink", mode === "recall" && "opacity-45")}>
                    <span className="flex items-center gap-1.5"><Highlighter className="size-4" /> Gaps and corrections</span>
                    <Textarea value={row.gaps} onChange={(event) => patchRow(row.id, { gaps: event.target.value })} disabled={mode === "recall"} placeholder={mode === "recall" ? "Open your notes when the brain dump is finished" : "One missed fact or keyword per line…"} className="mt-3 min-h-36 resize-y border-checker-highlight bg-checker-highlight/45 text-sm font-semibold normal-case leading-relaxed text-checker-ink disabled:opacity-70" />
                  </label>
                </div>
              </article>
            ))}
          </div>

          <div className="border-t border-checker-line p-4 print:hidden">
            <Button type="button" variant="outline" onClick={addRow}><Plus /> Add component</Button>
          </div>
          <div className={cn("flex flex-col justify-between gap-3 border-t border-checker-line px-5 py-4 text-sm font-extrabold sm:flex-row sm:items-center", totals.gaps > 0 ? "bg-checker-highlight/45" : "bg-checker-paper")}>
            <span>{totals.secure} secure {totals.secure === 1 ? "item" : "items"} · {totals.gaps} highlighted {totals.gaps === 1 ? "gap" : "gaps"}</span>
            <span className={cn("inline-flex self-start rounded-full px-3 py-1.5 text-xs", totals.gaps > 0 ? "bg-destructive text-destructive-foreground" : "bg-checker-mint text-checker-ink")}>
              {totals.gaps > 0 ? "Priority: Target highlighted gaps next" : mode === "recall" ? "Finish recall, then check" : "No gaps recorded yet"}
            </span>
          </div>
        </section>

        <PrintableChecker draft={draft} />

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="ghost"><Link to="/revision-help">How to use this checker</Link></Button>
            <Button type="button" variant="outline" disabled={flashcards.length === 0} onClick={() => setShowFlashcards((value) => !value)}>
              <BookOpen /> {showFlashcards ? "Hide flashcards" : "Make flashcards from gaps"}
            </Button>
            <Button type="button" variant="outline" disabled={flashcards.length === 0} onClick={downloadFlashcards}>
              <FileDown /> Download flashcards document
            </Button>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button type="button" variant="outline"><RotateCcw /> Start a fresh sheet</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear this Knowledge Checker?</AlertDialogTitle>
                <AlertDialogDescription>This removes every heading, brain-dump point and highlighted gap saved on this device.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep my work</AlertDialogCancel>
                <AlertDialogAction onClick={resetChecker}>Clear and start again</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {showFlashcards ? <FlashcardPanel flashcards={flashcards} /> : null}
        <SavedCheckers
          subject={draft.subject}
          topic={draft.topic}
          components={draft.rows.map((r) => r.component)}
          onLoad={({ subject, topic, components }) => {
            setDraft((c) => ({ ...c, subject, topic, rows: components.map((component, i) => ({ id: `row-${Date.now()}-${i}`, component, recall: "", gaps: "" })) }));
            setMode("recall");
          }}
        />
        <section className="mt-8 rounded-[8px] bg-checker-ink p-6 text-checker-paper print:hidden sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div><h2 className="text-xl font-extrabold">Use these gaps to build your plan</h2><p className="mt-1 text-sm font-semibold text-checker-paper/70">Give the topics you missed a lower confidence rating so they get more revision time.</p></div>
          <Button asChild className="mt-4 shrink-0 sm:mt-0">
            {user ? (plan ? <Link to="/edit-plan">Update my plan</Link> : <Link to="/setup">Create your revision plan</Link>) : <Link to="/auth" search={{ mode: "signup", context: "create-plan", returnTo: "/setup" }}>Create your revision plan</Link>}
          </Button>
        </section>
      </main>
    </div>
  );
}

function PrintableChecker({ draft }: { draft: CheckerDraft }) {
  const subject = draft.subject.trim() || "____________________________";
  const topic = draft.topic.trim() || "____________________________";
  const date = draft.date.trim() || "____________";

  return (
    <section className="checker-print-sheet" aria-label="Printable Knowledge Checker sheet">
      <table className="checker-print-table">
        <thead>
          <tr>
            <th colSpan={3}>
              <div className="checker-print-repeat-header">
                <span>Subject: {subject}</span>
                <span>Topic title: {topic}</span>
                <span>Date: {date}</span>
              </div>
            </th>
          </tr>
          <tr>
            <th>Key component</th>
            <th>What I already know</th>
            <th>Gaps and corrections</th>
          </tr>
        </thead>
        <tbody>
          {draft.rows.map((row, index) => (
            <tr key={row.id}>
              <td>
                <strong>{index + 1}. </strong>
                {row.component.trim() || ""}
              </td>
              <td>{row.recall.trim() || ""}</td>
              <td>{row.gaps.trim() || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function FlashcardPanel({ flashcards }: { flashcards: Flashcard[] }) {
  if (flashcards.length === 0) return null;

  return (
    <section className="mt-5 rounded-[8px] border border-checker-line bg-card p-5 shadow-sm print:hidden">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase text-muted-foreground">Flashcards from gaps</p>
          <h2 className="mt-1 text-2xl font-extrabold text-checker-ink">Key terms and definitions</h2>
        </div>
        <span className="inline-flex self-start rounded-full bg-checker-mint px-3 py-1.5 text-xs font-extrabold text-checker-ink">
          {flashcards.length} {flashcards.length === 1 ? "card" : "cards"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {flashcards.map((card, index) => (
          <article key={card.id} className="overflow-hidden rounded-[8px] border border-checker-line bg-checker-paper">
            <div className="border-b border-checker-line bg-checker-ink px-4 py-3 text-checker-paper">
              <p className="text-xs font-extrabold uppercase text-checker-mint">Card {index + 1} · Front</p>
              <p className="mt-1 text-lg font-extrabold">{card.term}</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-extrabold uppercase text-muted-foreground">Back</p>
              <p className="mt-1 whitespace-pre-wrap text-sm font-semibold leading-relaxed text-checker-ink">{card.definition}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
function dfeTopics(name: string) {
  return subjectUnits(name).map((u, i) => ({
    id: `dfe:${name}:${i}`,
    title: u.unit,
    items: u.elements.map((e, j) => ({ id: `dfe:${name}:${i}:${j}`, title: e.label })),
  }));
}
