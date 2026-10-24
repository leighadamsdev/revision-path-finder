import { PremiumPage } from "@/components/PremiumPage";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
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
import { SavedCheckers } from "@/components/SavedCheckers";
import { useAuth } from "@/hooks/useAuth";
import { useActivePlan, usePlanSubjects } from "@/hooks/useActivePlan";
import { FocusSound } from "@/components/FocusSound";
import { detailedTopicText, subjectUnits } from "@/lib/gcse-topics";
import { TOPIC_SUB_SEP, withWholeTopicRatings } from "@/lib/library";
import { useTopicRatings } from "@/hooks/useTopicRatings";
import { ConfidencePicker } from "@/components/ConfidencePicker";
import { BandLegend } from "@/components/BandChip";
import { GCSE_SUBJECTS } from "@/lib/gcse-subjects";
import { specUnits } from "@/lib/spec-topics";
import { Checkbox } from "@/components/ui/checkbox";
import { useLibrary } from "@/hooks/useLibrary";
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
      { title: "Online Revision Knowledge Checker | RevPlan" },
      {
        name: "description",
        content:
          "Complete a GCSE closed-book brain dump, highlight knowledge gaps, and identify what to revise next.",
      },
      { property: "og:title", content: "Online Revision Knowledge Checker | RevPlan" },
      {
        property: "og:description",
        content: "A free, fillable GCSE active-recall and knowledge-gap worksheet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <PremiumPage feature="The Knowledge Checker">
      <KnowledgeCheckerPage />
    </PremiumPage>
  ),
});

type CheckerRow = { id: string; component: string; recall: string; gaps: string };
type CheckerDraft = { subject: string; topic: string; date: string; rows: CheckerRow[] };
type Flashcard = { id: string; term: string; definition: string; source: string };

const STORAGE_KEY = "revplan.knowledgeChecker";

/** Every brain-dump and gap box opens with this so the first line is already a bullet point. */
const BULLET = "• ";

/** A line counts only when it holds something beyond the bullet marker itself. */
function isRealLine(line: string) {
  return line.replace(/^[•\s]+/, "").trim().length > 0;
}

function hasPoints(value: string) {
  return value.split("\n").some(isRealLine);
}

/** Keeps a box from ever going blank — a lone bullet is still worth showing. */
function withBullet(value: string) {
  return hasPoints(value) ? value : BULLET;
}

const EMPTY_ROWS: CheckerRow[] = [1, 2, 3].map((number) => ({
  id: `starter-${number}`,
  component: "",
  recall: BULLET,
  gaps: BULLET,
}));

function countPoints(value: string) {
  return value.split("\n").filter(isRealLine).length;
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
      .filter(isRealLine)
      .map((line, index) => splitGapIntoFlashcard(line, row, index)),
  );
}

function KnowledgeCheckerPage() {
  const library = useLibrary();
  const [libSubjectId, setLibSubjectId] = useState("");
  const { user } = useAuth();
  const { plan } = useActivePlan();
  const planSubjectsQuery = usePlanSubjects(plan?.id);
  /**
   * Every subject the student can check: their own (library and plan) first, then the rest of the
   * GCSE catalogue. Topics come from their Topic Library when they've added some, otherwise the DfE list.
   */
  const subjectOptions = useMemo(() => {
    const list: CheckerSubject[] = library.subjects.map((s) =>
      s.topics.length
        ? {
            id: s.id,
            name: s.name,
            mine: true,
            source: "library",
            topics: s.topics.map((t) => ({ id: t.id, title: t.title, items: t.items.map((i) => ({ id: i.id, title: i.title })) })),
          }
        : { id: s.id, name: s.name, mine: true, ...fallbackTopics(s.name) },
    );
    const seen = new Set(list.map((s) => s.name.trim().toLowerCase()));
    for (const ps of planSubjectsQuery.data ?? []) {
      const name = (ps as unknown as { name?: string; subject?: { name: string } }).name ?? (ps as unknown as { subject?: { name: string } }).subject?.name;
      if (!name || seen.has(name.trim().toLowerCase())) continue;
      seen.add(name.trim().toLowerCase());
      list.push({ id: `plan:${name}`, name, mine: true, ...fallbackTopics(name) });
    }
    for (const c of GCSE_SUBJECTS) {
      if (seen.has(c.name.toLowerCase())) continue;
      list.push({ id: `cat:${c.name}`, name: c.name, mine: false, ...fallbackTopics(c.name) });
    }
    return list;
  }, [library.subjects, planSubjectsQuery.data]);
  const libSubject = subjectOptions.find((s) => s.id === libSubjectId);
  const [tickedItems, setTickedItems] = useState<Set<string>>(new Set());
  const itemKey = (topicId: string, itemId: string) => `${topicId}|||${itemId}`;
  const allItemKeys = (libSubject?.topics ?? []).flatMap((t) => t.items.map((i) => itemKey(t.id, i.id)));
  function setItems(keys: string[], on: boolean) {
    setTickedItems((prev) => {
      const next = new Set(prev);
      for (const k of keys) {
        if (on) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  }
  function chooseSubject(id: string) {
    setLibSubjectId(id);
    setTickedItems(new Set());
    const s = subjectOptions.find((x) => x.id === id);
    if (s) setDraft((c) => ({ ...c, subject: s.name }));
  }
  const topicRatings = useTopicRatings();
  /** What the student rates after checking: whole Topic Library topics, or the list's lines. */
  const [rateTargets, setRateTargets] = useState<{ subject: string; items: { key: string; label: string }[] } | null>(null);

  /** Turns the ticked items into the checker's rows, in list order. */
  function applyTicked() {
    if (!libSubject) return;
    const topics = libSubject.topics
      .map((t) => ({ ...t, items: t.items.filter((i) => tickedItems.has(itemKey(t.id, i.id))) }))
      .filter((t) => t.items.length);
    if (!topics.length) return;
    // Rate with the same wording plans use, so ratings carry into "Rate my topics" and plans.
    setRateTargets({
      subject: libSubject.name,
      items:
        libSubject.source === "library"
          ? topics.flatMap((t) =>
              t.items.map((i) => ({ key: `${t.title}${TOPIC_SUB_SEP}${i.title}`, label: i.title })),
            )
          : topics.flatMap((t) =>
              t.items.map((i) => ({
                key: libSubject.source === "dfe" ? detailedTopicText(libSubject.name, i.title) : i.title,
                label: i.title,
              })),
            ),
    });
    const joined = topics.map((t) => t.title).join(", ");
    const title = topics.length === 1 ? topics[0]!.title : joined.length <= 60 ? joined : `${topics.length} topics`;
    setDraft((c) => ({
      ...c,
      subject: libSubject.name,
      topic: title,
      rows: topics.flatMap((t) => t.items.map((i) => ({ id: `${t.id}-${i.id}`, component: i.title, recall: BULLET, gaps: BULLET }))),
    }));
    document.getElementById("checker-sheet-start")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
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
        if (Array.isArray(parsed.rows) && parsed.rows.length > 0) {
          setDraft({
            ...parsed,
            rows: parsed.rows.map((row) => ({ ...row, recall: withBullet(row.recall), gaps: withBullet(row.gaps) })),
          });
        }
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

  function bulletOnEnter(id: string, field: "recall" | "gaps") {
    return (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      event.preventDefault();
      const el = event.currentTarget;
      const pos = el.selectionStart ?? el.value.length;
      // insertText fires the box's normal change event and leaves the caret sitting after the new
      // bullet, so fast typing can't scramble the text the way a state round-trip can.
      el.setSelectionRange(pos, pos);
      if (document.execCommand("insertText", false, "\n• ")) return;
      const next = `${el.value.slice(0, pos)}\n• ${el.value.slice(pos)}`;
      patchRow(id, { [field]: next });
      const caret = pos + 3;
      window.setTimeout(() => el.setSelectionRange(caret, caret), 0);
    };
  }

  function addRow() {
    setDraft((current) => ({
      ...current,
      rows: [...current.rows, { id: `row-${Date.now()}`, component: "", recall: BULLET, gaps: BULLET }],
    }));
  }

  function addSubRow(id: string) {
    setDraft((current) => {
      const i = current.rows.findIndex((row) => row.id === id);
      if (i < 0) return current;
      const parent = current.rows[i]!.component.split(" › ")[0]!.trim();
      const rows = [...current.rows];
      rows.splice(i + 1, 0, { id: `row-${Date.now()}`, component: parent ? `${parent} › ` : "", recall: BULLET, gaps: BULLET });
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
              children: [new TextRun({ text: "RevPlan · made from highlighted knowledge gaps", size: 18, color: "527078" })],
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
    <div className="min-h-screen bg-background font-sans text-foreground">
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

        <section ref={sheetRef} className={`mt-7 rounded-[8px] border border-structure bg-card shadow-[0_20px_60px_-25px] shadow-structure/35 print:hidden ${fullScreen ? "fixed inset-0 z-50 mt-0 overflow-y-auto rounded-none" : "overflow-hidden"}`}>
          <div className="flex flex-col gap-4 bg-structure p-5 text-structure-foreground sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase text-primary">RevPlan · active recall</p>
              <p className="mt-1 text-lg font-extrabold">Closed book first. Be honest with the gaps.</p>
            </div>
            <div className="flex items-center gap-2 rounded-[8px] border border-primary/60 px-3 py-2">
              <Clock3 className="size-4 text-primary" />
              <span className="min-w-[62px] text-center font-extrabold tabular-nums">{formatClock(remaining)}</span>
              <Button type="button" size="icon" variant="ghost" aria-label={running ? "Pause timer" : "Start timer"} onClick={() => setRunning((value) => !value)} className="text-primary hover:bg-primary/10 hover:text-primary">
                {running ? <Pause /> : <Play />}
              </Button>
              <Button type="button" size="icon" variant="ghost" aria-label="Reset timer" onClick={() => { setRemaining(30 * 60); setRunning(false); }} className="text-structure-foreground/70 hover:bg-primary/10 hover:text-structure-foreground">
                <RotateCcw />
              </Button>
            </div>
            <FocusSound className="text-structure-foreground" />
            <Button type="button" variant="secondary" onClick={toggleFullScreen}>
              {fullScreen ? "Exit full screen" : "Do it in the app (full screen)"}
            </Button>
          </div>

          <div className="space-y-4 border-b border-border bg-card p-5 print:hidden">
            <label className="block max-w-md text-xs font-extrabold uppercase text-muted-foreground">
              1. Choose a subject
              <select
                value={libSubjectId}
                onChange={(e) => chooseSubject(e.target.value)}
                className="mt-2 h-11 w-full rounded-md bg-card px-2 text-sm font-bold normal-case ring-1 ring-border"
              >
                <option value="">Choose a subject…</option>
                {subjectOptions.some((s) => s.mine) ? (
                  <optgroup label="My subjects">
                    {subjectOptions.filter((s) => s.mine).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>
                ) : null}
                <optgroup label="All GCSE subjects">
                  {subjectOptions.filter((s) => !s.mine).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
              </select>
            </label>

            {libSubject ? (
              <div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="text-xs font-extrabold uppercase text-muted-foreground">2. Tick the topics to check</p>
                  <p className="text-[12px] font-semibold text-muted-foreground">
                    {libSubject.source === "library"
                      ? "From your Topic Library."
                      : libSubject.source === "dfe"
                        ? "You haven't added your own topics for this subject, so the DfE list is shown."
                        : libSubject.source === "spec"
                          ? "There's no DfE list for this subject, so the exam-board list is shown."
                          : "There's no topic list for this subject yet."}{" "}
                    {libSubject.source !== "library" ? (
                      <Link to="/topics" className="font-extrabold underline">Add your own topics</Link>
                    ) : null}
                  </p>
                </div>
                {libSubject.topics.length ? (
                  <>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => setItems(allItemKeys, !(allItemKeys.length > 0 && allItemKeys.every((k) => tickedItems.has(k))))}>
                        {allItemKeys.length > 0 && allItemKeys.every((k) => tickedItems.has(k)) ? "Clear all" : "Select all"}
                      </Button>
                      <span className="text-[12px] font-bold text-muted-foreground">{tickedItems.size} ticked</span>
                    </div>
                    <div className="mt-2 max-h-[26rem] space-y-3 overflow-y-auto rounded-md p-3 ring-1 ring-border">
                      {libSubject.topics.map((topic) => {
                        const keys = topic.items.map((i) => itemKey(topic.id, i.id));
                        const on = keys.length > 0 && keys.every((k) => tickedItems.has(k));
                        const some = keys.some((k) => tickedItems.has(k));
                        return (
                          <div key={topic.id}>
                            <label className="flex cursor-pointer items-start gap-2 text-sm font-extrabold">
                              <Checkbox className="mt-0.5" checked={on ? true : some ? "indeterminate" : false} onCheckedChange={() => setItems(keys, !on)} />
                              {topic.title}
                            </label>
                            <div className="mt-1 space-y-0.5 pl-6">
                              {topic.items.map((i) => {
                                const k = itemKey(topic.id, i.id);
                                return (
                                  <label key={k} className="flex cursor-pointer items-start gap-2 rounded px-1 py-1 text-sm font-medium hover:bg-muted">
                                    <Checkbox className="mt-0.5" checked={tickedItems.has(k)} onCheckedChange={() => setItems([k], !tickedItems.has(k))} />
                                    {i.title}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <Button type="button" className="mt-3" disabled={tickedItems.size === 0} onClick={applyTicked}>
                      Make my checker ({tickedItems.size} {tickedItems.size === 1 ? "item" : "items"})
                    </Button>
                  </>
                ) : (
                  <p className="mt-2 text-sm font-semibold">
                    <Link to="/topics" className="font-extrabold underline">Upload a contents page or topic list</Link>, or type the topic and components in below.
                  </p>
                )}
              </div>
            ) : null}
          </div>

          <div id="checker-sheet-start" />
          <div className="flex flex-col justify-between gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center print:hidden">
            <div className="inline-flex self-start rounded-[8px] border border-border bg-background p-1">
              <Button type="button" size="sm" variant="ghost" onClick={() => setMode("recall")} className={cn("rounded-[6px]", mode === "recall" && "bg-structure text-structure-foreground hover:bg-structure hover:text-structure-foreground")}><EyeOff /> 1. Closed book</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setMode("check")} className={cn("rounded-[6px]", mode === "check" && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground")}><BookOpen /> 2. Check gaps</Button>
            </div>
            <p className="text-xs font-bold text-muted-foreground">Your work saves automatically on this device.</p>
          </div>

          <div className="divide-y divide-border">
            {draft.rows.map((row, index) => (
              <article key={row.id} className="grid md:grid-cols-[0.7fr_1.3fr]">
                <div className="border-b border-border bg-background p-4 md:border-b-0 md:border-r">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor={`component-${row.id}`} className="text-xs font-extrabold uppercase text-muted-foreground">Key component {index + 1}</label>
                    {draft.rows.length > 1 ? <Button type="button" size="icon" variant="ghost" aria-label={`Remove component ${index + 1}`} onClick={() => removeRow(row.id)} className="size-8 text-muted-foreground print:hidden"><Trash2 /></Button> : null}
                  </div>
                  <Input id={`component-${row.id}`} value={row.component} onChange={(event) => patchRow(row.id, { component: event.target.value })} placeholder="e.g. Lock-and-key model" className="mt-3 h-11 bg-card font-bold" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => addSubRow(row.id)} className="mt-2 text-xs font-bold text-muted-foreground print:hidden"><Plus /> Add sub-point</Button>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  <label className="text-xs font-extrabold uppercase text-muted-foreground">What I already know
                    <Textarea value={row.recall} onChange={(event) => patchRow(row.id, { recall: event.target.value })} onKeyDown={bulletOnEnter(row.id, "recall")} onBlur={(event) => { if (!event.target.value.trim()) patchRow(row.id, { recall: BULLET }); }} placeholder="One recalled point per line…" className="mt-3 min-h-36 resize-y bg-card text-sm font-semibold normal-case leading-relaxed text-foreground" />
                  </label>
                  <label className={cn("text-xs font-extrabold uppercase text-foreground", mode === "recall" && "opacity-45")}>
                    <span className="flex items-center gap-1.5"><Highlighter className="size-4" /> Gaps and corrections</span>
                    <Textarea value={row.gaps} onChange={(event) => patchRow(row.id, { gaps: event.target.value })} onKeyDown={bulletOnEnter(row.id, "gaps")} onBlur={(event) => { if (!event.target.value.trim()) patchRow(row.id, { gaps: BULLET }); }} disabled={mode === "recall"} placeholder={mode === "recall" ? "Open your notes when the brain dump is finished" : "One missed fact or keyword per line…"} className="mt-3 min-h-36 resize-y border-l-4 border-primary bg-accent text-sm font-semibold normal-case leading-relaxed text-foreground disabled:opacity-70" />
                  </label>
                </div>
              </article>
            ))}
          </div>

          <div className="border-t border-border p-4 print:hidden">
            <Button type="button" variant="outline" onClick={addRow}><Plus /> Add component</Button>
          </div>
          <div className={cn("flex flex-col justify-between gap-3 border-t border-border px-5 py-4 text-sm font-extrabold sm:flex-row sm:items-center", totals.gaps > 0 ? "bg-accent" : "bg-background")}>
            <span>{totals.secure} secure {totals.secure === 1 ? "item" : "items"} · {totals.gaps} highlighted {totals.gaps === 1 ? "gap" : "gaps"}</span>
            <span className={cn("inline-flex self-start rounded-full px-3 py-1.5 text-xs", totals.gaps > 0 ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground")}>
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

        {rateTargets && rateTargets.items.length && draft.subject === rateTargets.subject ? (
          <section className="mt-6 rounded-[8px] border border-checker-line bg-card p-5 print:hidden">
            <p className="text-xs font-extrabold uppercase text-muted-foreground">3. Rate what you know</p>
            <h2 className="mt-1 text-lg font-extrabold">How confident are you now?</h2>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              After checking your gaps, rate each topic. Ratings are saved to{" "}
              <Link to="/rate-topics" className="font-extrabold underline">Rate my topics</Link> and your revision plan.
            </p>
            <div className="mt-2">
              <BandLegend />
            </div>
            <ul className="mt-3 divide-y divide-border/60">
              {rateTargets.items.map((item) => (
                <li key={item.key} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2">
                  <span className="min-w-0 flex-1 text-sm font-bold">{item.label}</span>
                  <ConfidencePicker
                    size="sm"
                    label={item.label}
                    value={
                      withWholeTopicRatings(
                        topicRatings.ratings[rateTargets.subject] ?? {},
                        library.subjects.find((s) => s.name === rateTargets.subject)?.topics ?? [],
                      )[item.key] ?? null
                    }
                    onChange={(v) => void topicRatings.rate(rateTargets.subject, item.key, v).catch(() => undefined)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {showFlashcards ? <FlashcardPanel flashcards={flashcards} /> : null}
        <SavedCheckers
          subject={draft.subject}
          topic={draft.topic}
          components={draft.rows.map((r) => r.component)}
          onSaved={() => {
            resetChecker();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onLoad={({ subject, topic, components }) => {
            setDraft((c) => ({ ...c, subject, topic, rows: components.map((component, i) => ({ id: `row-${Date.now()}-${i}`, component, recall: BULLET, gaps: BULLET })) }));
            setMode("recall");
          }}
        />
        <section className="mt-8 rounded-[8px] bg-structure p-6 text-structure-foreground print:hidden sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div><h2 className="text-xl font-extrabold">Use these gaps to build your plan</h2><p className="mt-1 text-sm font-semibold text-structure-foreground/70">When you reach the topic step, RevPlan will offer to mark these gaps red so they get more revision time.</p></div>
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
              <td>{hasPoints(row.recall) ? row.recall : ""}</td>
              <td>{hasPoints(row.gaps) ? row.gaps : ""}</td>
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
    <section className="mt-5 rounded-[8px] border border-border bg-card p-5 shadow-sm print:hidden">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase text-muted-foreground">Flashcards from gaps</p>
          <h2 className="mt-1 text-2xl font-extrabold text-foreground">Key terms and definitions</h2>
        </div>
        <span className="inline-flex self-start rounded-full bg-primary px-3 py-1.5 text-xs font-extrabold text-primary-foreground">
          {flashcards.length} {flashcards.length === 1 ? "card" : "cards"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {flashcards.map((card, index) => (
          <article key={card.id} className="overflow-hidden rounded-[8px] border border-border bg-background">
            <div className="border-b border-border bg-structure px-4 py-3 text-structure-foreground">
              <p className="text-xs font-extrabold uppercase text-primary">Card {index + 1} · Front</p>
              <p className="mt-1 text-lg font-extrabold">{card.term}</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-extrabold uppercase text-muted-foreground">Back</p>
              <p className="mt-1 whitespace-pre-wrap text-sm font-semibold leading-relaxed text-foreground">{card.definition}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
type CheckerTopic = { id: string; title: string; items: { id: string; title: string }[] };
type CheckerSubject = { id: string; name: string; mine: boolean; source: "library" | "dfe" | "spec" | "none"; topics: CheckerTopic[] };

/** Topics for a subject with nothing in the Topic Library: the DfE list, else the exam-board list. */
function fallbackTopics(name: string): Pick<CheckerSubject, "source" | "topics"> {
  const dfe = subjectUnits(name);
  const units = dfe.length ? dfe : specUnits(name);
  const source = dfe.length ? "dfe" : units.length ? "spec" : "none";
  return {
    source,
    topics: units.map((u, i) => ({
      id: `${source}:${name}:${i}`,
      title: u.unit,
      items: u.elements.map((e, j) => ({ id: `${source}:${name}:${i}:${j}`, title: e.label })),
    })),
  };
}
