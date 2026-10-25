import { useEffect, useState } from "react";
import { ArchiveRestore, ArrowDown, ArrowUp, ChevronDown, ChevronRight, FileImage, FolderInput, ListChecks, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteSubject,
  deleteTopic,
  fetchArchivedTopics,
  futureSessionsUsing,
  moveTopic,
  newKey,
  removeFromFutureSessions,
  replaceTopic,
  saveTopics,
  setTopicArchived,
  updateSubject,
  type DraftTopic,
  type LibSubject,
  type LibTopic,
} from "@/lib/library";
import { ImportPanel } from "./ImportPanel";
import { GCSE_SUBJECTS, SUBJECT_GROUPS, catalogueSubject, isTiered } from "@/lib/gcse-subjects";
import { TopicDraftEditor } from "./TopicDraftEditor";
import { ReadyListDialog } from "./ReadyListDialog";
import { readyListFor } from "@/lib/spec-topics";
import { groupByDfeCategory } from "@/lib/dfe-categories";
import { BandLegend } from "@/components/BandChip";
import { ConfidencePicker } from "@/components/ConfidencePicker";
import { useTopicRatings } from "@/hooks/useTopicRatings";
import { topicLines, withWholeTopicRatings } from "@/lib/library";
import { BAND_LABEL, confidenceBand, confidenceTone, type Band } from "@/lib/confidence";

export const libField =
  "w-full rounded-[12px] bg-background px-3 py-2.5 text-sm font-medium ring-1 ring-border focus:outline-none focus:ring-ring";

const BOARDS = ["AQA", "Edexcel (Pearson)", "OCR", "WJEC / Eduqas", "CCEA", "Cambridge (CAIE)"];
const OTHER = "__other__";

export function SubjectFields({
  value,
  onChange,
}: {
  value: { name: string; exam_board: string; qualification_level: string };
  onChange: (v: { name: string; exam_board: string; qualification_level: string }) => void;
}) {
  const inCatalogue = Boolean(catalogueSubject(value.name));
  const [custom, setCustom] = useState(Boolean(value.name) && !inCatalogue);
  const tiered = isTiered(value.name);
  const selectValue = inCatalogue ? catalogueSubject(value.name)!.name : custom && value.name !== "" || custom ? OTHER : "";

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <div className="space-y-2">
        <select
          className={libField}
          aria-label="Subject"
          value={selectValue}
          onChange={(e) => {
            const v = e.target.value;
            if (v === OTHER) {
              setCustom(true);
              onChange({ ...value, name: "", qualification_level: "GCSE" });
            } else {
              setCustom(false);
              onChange({ ...value, name: v, qualification_level: isTiered(v) ? "" : "GCSE" });
            }
          }}
        >
          <option value="" disabled>Choose a subject…</option>
          {SUBJECT_GROUPS.map((g) => (
            <optgroup key={g} label={g}>
              {GCSE_SUBJECTS.filter((s) => s.group === g).map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
            </optgroup>
          ))}
          <option value={OTHER}>Other — type my own</option>
        </select>
        {custom ? <Input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} placeholder="Subject name" aria-label="Subject name" /> : null}
      </div>
      <select className={libField} aria-label="Exam board" value={value.exam_board} onChange={(e) => onChange({ ...value, exam_board: e.target.value })}>
        <option value="">Exam board (optional)</option>
        {BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
        {value.exam_board && !BOARDS.includes(value.exam_board) ? <option value={value.exam_board}>{value.exam_board}</option> : null}
      </select>
      {tiered ? (
        <select className={libField} aria-label="Tier" value={value.qualification_level} onChange={(e) => onChange({ ...value, qualification_level: e.target.value })}>
          <option value="">Choose tier…</option>
          <option value="GCSE Foundation">Foundation tier</option>
          <option value="GCSE Higher">Higher tier</option>
        </select>
      ) : (
        <div className={`${libField} text-muted-foreground`}>GCSE (no tiers)</div>
      )}
    </div>
  );
}

/** Subject cards with import / manual add / edit / remove, shared by onboarding and the library page. */
export function LibraryManager({ subjects, refresh, showTopics = true, mode = "all" }: { subjects: LibSubject[]; refresh: () => void; showTopics?: boolean; mode?: "all" | "subjects" | "topics" }) {
  const [importFor, setImportFor] = useState<LibSubject | null>(null);
  const [manualFor, setManualFor] = useState<LibSubject | null>(null);
  const [readyFor, setReadyFor] = useState<LibSubject | null>(null);
  const [editSubject, setEditSubject] = useState<LibSubject | null>(null);
  const [editTopic, setEditTopic] = useState<LibTopic | null>(null);
  const [removeTopic, setRemoveTopic] = useState<{ topic: LibTopic; sessions: number } | null>(null);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [folderOpen, setFolderOpen] = useState<Set<string>>(new Set());
  const [archivedTopics, setArchivedTopics] = useState<LibTopic[]>([]);
  const [bandFilter, setBandFilter] = useState<Band | "all">("all");
  // On My Topics, every sub-topic can be rated red, amber or green right where it's listed.
  const canRate = mode === "topics";
  const topicRatings = useTopicRatings();

  async function reloadArchived() {
    if (mode === "subjects") return;
    try {
      setArchivedTopics(await fetchArchivedTopics());
    } catch {
      /* folder simply stays as it was */
    }
  }

  useEffect(() => {
    void reloadArchived();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function archiveTopic(topic: LibTopic, archived: boolean) {
    await setTopicArchived(topic.id, archived);
    if (archived) toast.success(`“${topic.title}” moved to Kept for later.`);
    else toast.success(`“${topic.title}” is back in your topics.`);
    refresh();
    void reloadArchived();
  }

  const archivedFor = (subjectId: string) => archivedTopics.filter((t) => t.subject_id === subjectId);

  async function viewSource(path: string) {
    const { data } = await supabase.storage.from("topic-sources").createSignedUrl(path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
    else toast.error("That file isn't available any more.");
  }

  async function askRemoveTopic(topic: LibTopic) {
    const sessions = (await futureSessionsUsing(topic.title)).length;
    setRemoveTopic({ topic, sessions });
  }

  return (
    <div className="space-y-3">
      {canRate && subjects.some((s) => s.topics.length) ? (
        <div className="rounded-[12px] bg-card px-4 py-3 ring-1 ring-black/5">
          <p className="text-[13px] font-extrabold">Rate each topic as you go</p>
          <BandLegend />
          <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="Show topics by rating">
            <span className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">Show:</span>
            {(["all", "red", "amber", "green", "unrated"] as const).map((band) => {
              const active = bandFilter === band;
              const tone = band === "all" ? null : confidenceTone(band === "unrated" ? null : band === "red" ? 1 : band === "amber" ? 3 : 5);
              return (
                <button
                  key={band}
                  type="button"
                  onClick={() => setBandFilter(band)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 transition ${active ? "bg-primary text-primary-foreground ring-primary" : "bg-background text-foreground ring-border hover:ring-ring"}`}
                >
                  {tone ? <span className={`size-2 rounded-full ${tone.fill}`} /> : null}
                  {band === "all" ? "All" : BAND_LABEL[band]}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      {subjects.map((s) => {
        const ratings = canRate ? withWholeTopicRatings(topicRatings.ratings[s.name] ?? {}, s.topics) : {};
        const items = s.topics.reduce((n, t) => n + t.items.length, 0);
        // Rating filter: a topic shows when any of its rateable lines has the chosen colour.
        const visibleTopics =
          canRate && bandFilter !== "all"
            ? s.topics.filter((t) => topicLines(t).some((line) => confidenceBand(ratings[line]) === bandFilter))
            : s.topics;
        const keptForLater = archivedFor(s.id);
        const isOpen = mode === "topics" || open.has(s.id);
        return (
          <div key={s.id} className="rounded-[16px] bg-card p-4 ring-1 ring-black/5">
            <div className="flex items-start gap-2">
              {mode === "all" ? <Button size="icon" variant="ghost" aria-label={isOpen ? "Collapse" : "Expand"} onClick={() => setOpen((o) => { const n = new Set(o); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); return n; })}>
                {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
              </Button> : null}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold">{s.name}</p>
                <p className="text-[12px] font-medium text-muted-foreground">
                  {[s.exam_board, s.qualification_level].filter(Boolean).join(" · ") || "No exam board added"} — {s.topics.length} {s.topics.length === 1 ? "Topic" : "Topics"}, {items} content {items === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {mode !== "subjects" && readyListFor(s.name).units.length ? (
                <Button size="sm" onClick={() => setReadyFor(s)}>
                  <ListChecks /> {readyListFor(s.name).kind === "spec" ? "Choose from Exam Board List" : "Choose from Ready-made List"}
                </Button>
              ) : null}
              {mode !== "subjects" ? <Button size="sm" variant={readyListFor(s.name).units.length ? "outline" : "default"} onClick={() => setImportFor(s)}><Upload /> Import from a Contents Page or Photo</Button> : null}
              {mode !== "subjects" ? <Button size="sm" variant="outline" onClick={() => setManualFor(s)}><Plus /> Add Topic Manually</Button> : null}
              {mode !== "topics" ? <Button size="sm" variant="outline" onClick={() => setEditSubject(s)}><Pencil /> Edit Subject</Button> : null}
              {mode !== "topics" ? <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  if (!window.confirm(`Remove ${s.name} and all its Topics from your library?`)) return;
                  await deleteSubject(s.id);
                  refresh();
                }}
              >
                <Trash2 /> Remove Subject
              </Button> : null}
            </div>
            {mode !== "subjects" && showTopics && isOpen ? (
              <ul className="mt-3 space-y-2">
                {s.topics.length === 0 ? <li className="text-[12px] font-medium text-muted-foreground">No Topics yet.</li> : null}
                {s.topics.length > 0 && visibleTopics.length === 0 ? <li className="text-[12px] font-medium text-muted-foreground">No {BAND_LABEL[bandFilter as Band].toLowerCase()} topics in this subject.</li> : null}
                {(mode === "topics" ? groupByDfeCategory(s.name, visibleTopics) : [{ category: "", topics: s.topics }]).map((g) => (
                  <li key={g.category || "all"} className="space-y-2">
                    {g.category ? <p className="pt-1 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">{g.category}</p> : null}
                    <ul className="space-y-2">
                {g.topics.map((t) => { const i = s.topics.indexOf(t); return (
                  <li key={t.id} className="rounded-[12px] bg-background p-3 ring-1 ring-border">
                    <div className="flex items-center gap-1">
                      <span className="flex-1 text-[13px] font-extrabold">{t.title}</span>
                      <Button size="icon" variant="ghost" aria-label="Move up" disabled={i === 0} onClick={async () => { await moveTopic(s.topics, i, i - 1); refresh(); }}><ArrowUp /></Button>
                      <Button size="icon" variant="ghost" aria-label="Move down" disabled={i === s.topics.length - 1} onClick={async () => { await moveTopic(s.topics, i, i + 1); refresh(); }}><ArrowDown /></Button>
                      {t.source_path ? <Button size="icon" variant="ghost" aria-label="View original file" onClick={() => void viewSource(t.source_path!)}><FileImage /></Button> : null}
                      <Button size="icon" variant="ghost" aria-label="Edit topic" onClick={() => setEditTopic(t)}><Pencil /></Button>
                      <Button size="icon" variant="ghost" aria-label="Keep for later" title="Move to Kept for later" onClick={() => void archiveTopic(t, true)}><FolderInput /></Button>
                      <Button size="icon" variant="ghost" aria-label="Remove topic" onClick={() => void askRemoveTopic(t)}><Trash2 /></Button>
                    </div>
                    {canRate ? (
                      <ul className="mt-2 divide-y divide-border/60">
                        {topicLines(t).map((line, li) => {
                          const label = t.items.length ? t.items[li]!.title : "Rate this topic";
                          return (
                            <li key={line} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-1.5">
                              <span className="min-w-0 flex-1 text-[12px] font-medium text-muted-foreground">{label}</span>
                              <ConfidencePicker
                                size="sm"
                                label={t.items.length ? label : t.title}
                                value={ratings[line] ?? null}
                                onChange={(v) => void topicRatings.rate(s.name, line, v)}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <ul className="mt-1 list-disc pl-5 text-[12px] font-medium text-muted-foreground">
                        {t.items.map((it) => <li key={it.id}>{it.title}</li>)}
                      </ul>
                    )}
                  </li>
                ); })}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : null}
            {mode !== "subjects" && keptForLater.length ? (
              <div className="mt-3 rounded-[12px] bg-muted/60 p-3 ring-1 ring-border">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 text-left text-[12px] font-extrabold text-muted-foreground"
                  aria-expanded={folderOpen.has(s.id)}
                  onClick={() => setFolderOpen((o) => { const n = new Set(o); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); return n; })}
                >
                  {folderOpen.has(s.id) ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                  Kept for later ({keptForLater.length})
                </button>
                {folderOpen.has(s.id) ? (
                  <ul className="mt-2 space-y-2">
                    {keptForLater.map((t) => (
                      <li key={t.id} className="flex items-center gap-1 rounded-[10px] bg-background p-2.5 ring-1 ring-border">
                        <span className="min-w-0 flex-1 text-[13px] font-bold">{t.title}
                          <span className="block text-[11px] font-medium text-muted-foreground">{t.items.length} content {t.items.length === 1 ? "item" : "items"} — not used in plans while kept here</span>
                        </span>
                        <Button size="icon" variant="ghost" aria-label={`Bring ${t.title} back`} title="Bring back to my topics" onClick={() => void archiveTopic(t, false)}><ArchiveRestore /></Button>
                        <Button size="icon" variant="ghost" aria-label={`Delete ${t.title}`} onClick={() => void askRemoveTopic(t)}><Trash2 /></Button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}

      {importFor ? (
        <ImportPanel open onOpenChange={(v) => !v && setImportFor(null)} subjectId={importFor.id} subjectName={importFor.name} existingCount={importFor.topics.length} onSaved={refresh} />
      ) : null}

      <ReadyListDialog subject={readyFor} onClose={() => setReadyFor(null)} onSaved={refresh} />

      <ManualTopicDialog subject={manualFor} onClose={() => setManualFor(null)} onSaved={refresh} />

      <EditSubjectDialog subject={editSubject} onClose={() => setEditSubject(null)} onSaved={refresh} />

      <EditTopicDialog topic={editTopic} onClose={() => setEditTopic(null)} onSaved={refresh} />

      <Dialog open={Boolean(removeTopic)} onOpenChange={(v) => !v && setRemoveTopic(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Remove “{removeTopic?.topic.title}”?</DialogTitle></DialogHeader>
          <p className="text-[13px] font-medium text-muted-foreground">
            {removeTopic?.sessions
              ? `This Topic appears in ${removeTopic.sessions} upcoming revision session${removeTopic.sessions === 1 ? "" : "s"}. Completed sessions won't change.`
              : "It isn't in any upcoming sessions. Completed sessions won't change."}
          </p>
          <DialogFooter className="gap-2">
            {removeTopic?.sessions ? (
              <Button variant="outline" onClick={async () => { const n = await removeFromFutureSessions(removeTopic.topic.title); toast.success(`Removed from ${n} upcoming sessions.`); setRemoveTopic(null); }}>
                Remove from future sessions only
              </Button>
            ) : null}
            <Button variant="destructive" onClick={async () => { await deleteTopic(removeTopic!.topic.id); setRemoveTopic(null); refresh(); void reloadArchived(); }}>
              Delete from library
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function blankTopic(): DraftTopic {
  return { key: newKey(), title: "", items: [{ key: newKey(), title: "", uncertain: false }] };
}

function ManualTopicDialog({ subject, onClose, onSaved }: { subject: LibSubject | null; onClose: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState<DraftTopic[]>([blankTopic()]);
  const [busy, setBusy] = useState(false);
  async function save(another: boolean) {
    const t = draft[0];
    if (!subject || !t?.title.trim()) return void toast.error("Give the Topic a title.");
    if (!t.items.some((i) => i.title.trim())) return void toast.error("Add at least one content item.");
    setBusy(true);
    try {
      await saveTopics(subject.id, [t], { type: "manual", path: null }, subject.topics.length);
      toast.success("Topic saved.");
      onSaved();
      setDraft([blankTopic()]);
      if (!another) onClose();
    } catch {
      toast.error("Couldn't save — try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={Boolean(subject)} onOpenChange={(v) => { if (!v) { setDraft([blankTopic()]); onClose(); } }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add a Topic to {subject?.name}</DialogTitle></DialogHeader>
        <TopicDraftEditor topics={draft} onChange={(n) => setDraft(n.length ? n.slice(0, 1) : [blankTopic()])} allowAddTopic={false} />
        <DialogFooter className="gap-2">
          <Button variant="outline" disabled={busy} onClick={() => void save(true)}>Save and add another</Button>
          <Button disabled={busy} onClick={() => void save(false)}>Save Topic</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditTopicDialog({ topic, onClose, onSaved }: { topic: LibTopic | null; onClose: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState<DraftTopic[] | null>(null);
  const current =
    draft ?? (topic ? [{ key: topic.id, title: topic.title, items: topic.items.map((i) => ({ key: i.id, title: i.title, uncertain: i.uncertain })) }] : []);
  return (
    <Dialog open={Boolean(topic)} onOpenChange={(v) => { if (!v) { setDraft(null); onClose(); } }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Topic</DialogTitle></DialogHeader>
        <TopicDraftEditor topics={current} onChange={(n) => n.length && setDraft(n.slice(0, 1))} allowAddTopic={false} />
        <DialogFooter>
          <Button
            onClick={async () => {
              if (!topic || !current[0]?.title.trim()) return;
              await replaceTopic(topic.id, current[0], topic.items);
              setDraft(null);
              onSaved();
              onClose();
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditSubjectDialog({ subject, onClose, onSaved }: { subject: LibSubject | null; onClose: () => void; onSaved: () => void }) {
  const [value, setValue] = useState<{ name: string; exam_board: string; qualification_level: string } | null>(null);
  const v = value ?? { name: subject?.name ?? "", exam_board: subject?.exam_board ?? "", qualification_level: subject?.qualification_level ?? "" };
  return (
    <Dialog open={Boolean(subject)} onOpenChange={(o) => { if (!o) { setValue(null); onClose(); } }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Subject</DialogTitle></DialogHeader>
        <SubjectFields value={v} onChange={setValue} />
        <DialogFooter>
          <Button
            onClick={async () => {
              if (!subject || !v.name.trim()) return void toast.error("Subject name is required.");
              await updateSubject(subject.id, { name: v.name.trim(), exam_board: v.exam_board || null, qualification_level: v.qualification_level || null });
              setValue(null);
              onSaved();
              onClose();
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
