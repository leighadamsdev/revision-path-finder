import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  Clock3,
  Download,
  EyeOff,
  Highlighter,
  Pause,
  Play,
  Plus,
  Printer,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";
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

export const Route = createFileRoute("/knowledge-checker")({
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

function KnowledgeCheckerPage() {
  const [draft, setDraft] = useState<CheckerDraft>({ subject: "", topic: "", date: "", rows: EMPTY_ROWS });
  const [mode, setMode] = useState<"recall" | "check">("recall");
  const [remaining, setRemaining] = useState(30 * 60);
  const [running, setRunning] = useState(false);
  const [loaded, setLoaded] = useState(false);
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

  function removeRow(id: string) {
    setDraft((current) => ({ ...current, rows: current.rows.filter((row) => row.id !== id) }));
  }

  function resetChecker() {
    setDraft({ subject: "", topic: "", date: "", rows: EMPTY_ROWS });
    setMode("recall");
    setRemaining(30 * 60);
    setRunning(false);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="min-h-screen bg-checker-paper font-sans text-checker-ink">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase text-muted-foreground">Online worksheet</p>
            <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">Revision Knowledge Checker</h1>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-relaxed text-muted-foreground">
              Brain dump from memory first. Then open your notes and highlight exactly what was missing.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button asChild variant="outline">
              <a href="/revplan-knowledge-checker.pdf" download><Download /> Blank PDF</a>
            </Button>
            <Button type="button" variant="outline" onClick={() => window.print()}><Printer /> Print this sheet</Button>
          </div>
        </header>

        <section className="mt-7 overflow-hidden rounded-[8px] border border-checker-ink bg-card shadow-sm">
          <div className="flex flex-col gap-4 bg-checker-ink p-5 text-checker-paper sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase text-checker-mint">revplan. · active recall</p>
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
          </div>

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

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Button asChild variant="ghost"><Link to="/revision-help">How to use this checker</Link></Button>
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
      </main>
    </div>
  );
}