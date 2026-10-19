import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, FileImage, ListChecks, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteSubject,
  deleteTopic,
  futureSessionsUsing,
  moveTopic,
  newKey,
  removeFromFutureSessions,
  replaceTopic,
  saveTopics,
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
      {subjects.map((s) => {
        const items = s.topics.reduce((n, t) => n + t.items.length, 0);
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
                  {[s.exam_board, s.qualification_level].filter(Boolean).join(" · ") || "No exam board added"} — {s.topics.length} Topics, {items} content items
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
                {s.topics.map((t, i) => (
                  <li key={t.id} className="rounded-[12px] bg-background p-3 ring-1 ring-border">
                    <div className="flex items-center gap-1">
                      <span className="flex-1 text-[13px] font-extrabold">{t.title}</span>
                      <Button size="icon" variant="ghost" aria-label="Move up" disabled={i === 0} onClick={async () => { await moveTopic(s.topics, i, i - 1); refresh(); }}><ArrowUp /></Button>
                      <Button size="icon" variant="ghost" aria-label="Move down" disabled={i === s.topics.length - 1} onClick={async () => { await moveTopic(s.topics, i, i + 1); refresh(); }}><ArrowDown /></Button>
                      {t.source_path ? <Button size="icon" variant="ghost" aria-label="View original file" onClick={() => void viewSource(t.source_path!)}><FileImage /></Button> : null}
                      <Button size="icon" variant="ghost" aria-label="Edit topic" onClick={() => setEditTopic(t)}><Pencil /></Button>
                      <Button size="icon" variant="ghost" aria-label="Remove topic" onClick={() => void askRemoveTopic(t)}><Trash2 /></Button>
                    </div>
                    <ul className="mt-1 list-disc pl-5 text-[12px] font-medium text-muted-foreground">
                      {t.items.map((it) => <li key={it.id}>{it.title}</li>)}
                    </ul>
                  </li>
                ))}
              </ul>
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
            <Button variant="destructive" onClick={async () => { await deleteTopic(removeTopic!.topic.id); setRemoveTopic(null); refresh(); }}>
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
