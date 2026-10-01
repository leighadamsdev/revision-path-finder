import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, Pin, Play, RefreshCw, Trash2, CalendarX2, MoveRight } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { SessionTimer } from "@/components/SessionTimer";
import { detailedTopicText } from "@/lib/gcse-topics";
import { regenerateSessionTopic, type SessionRow, type Subject } from "@/lib/plan";
import { subjectStyle } from "@/lib/subjects";
import { syncFlashcards } from "@/lib/leitner";

export function SessionCard({
  session,
  subject,
  minutes,
  onChanged,
  weeks = 1,
  days = [],
  onStructureChanged,
}: {
  weeks?: number;
  days?: string[];
  onStructureChanged?: () => void;
  session: SessionRow;
  subject: Subject | undefined;
  minutes: number;
  onChanged: (patch: Partial<SessionRow>) => void;
}) {
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveWeek, setMoveWeek] = useState(session.week_number);
  const [moveDay, setMoveDay] = useState(session.day_label);
  const missed = Boolean(session.missed_at);

  async function toggleMissed() {
    const missed_at = missed ? null : new Date().toISOString();
    const { error } = await supabase.from("sessions").update({ missed_at }).eq("id", session.id);
    if (error) return void toast.error("That didn't save. Check your connection.");
    onChanged({ missed_at });
  }

  async function changeLength(value: number) {
    await save({ length_minutes: value });
  }

  async function moveSession() {
    const { data } = await supabase
      .from("sessions")
      .select("session_slot")
      .eq("plan_id", session.plan_id)
      .eq("week_number", moveWeek)
      .eq("day_label", moveDay)
      .order("session_slot", { ascending: false })
      .limit(1);
    const slot = (data?.[0]?.session_slot ?? 0) + 1;
    const { error } = await supabase
      .from("sessions")
      .update({ week_number: moveWeek, day_label: moveDay, session_slot: slot, pinned: false })
      .eq("id", session.id);
    if (error) return void toast.error("Couldn't move this session.");
    toast.success(`Moved to week ${moveWeek}, ${moveDay}.`);
    setMoveOpen(false);
    onStructureChanged?.();
  }

  async function removeSession() {
    if (!window.confirm("Delete this session? Its topic and notes will be lost.")) return;
    const { error } = await supabase.from("sessions").delete().eq("id", session.id);
    if (error) return void toast.error("Couldn't delete this session.");
    toast.success("Session deleted.");
    onStructureChanged?.();
  }
  const style = subjectStyle(subject?.color_key);
  const [topic, setTopic] = useState(() =>
    detailedTopicText(subject?.name ?? "", session.topic_text),
  );
  const [notes, setNotes] = useState(session.gap_notes);
  const [savedAt, setSavedAt] = useState(0);
  const [regenerating, setRegenerating] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const queryClient = useQueryClient();
  const [completing, setCompleting] = useState(false);
  const done = Boolean(session.completed_at);

  async function toggleComplete() {
    setCompleting(true);
    const completed_at = done ? null : new Date().toISOString();
    const { error } = await supabase.from("sessions").update({ completed_at }).eq("id", session.id);
    setCompleting(false);
    if (error) {
      toast.error("That didn't save. Check your connection.");
      return;
    }
    onChanged({ completed_at });
    if (!done) {
      toast.success("Session complete — nice work.");
      // Completing a session moves the Leitner schedule forward.
      await syncFlashcards(session.plan_id).catch(() => undefined);
      await queryClient.invalidateQueries({ queryKey: ["flashcards", session.plan_id] });
    }
  }

  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(
    () => setTopic(detailedTopicText(subject?.name ?? "", session.topic_text)),
    [session.topic_text, subject?.name],
  );

  async function save(patch: Partial<SessionRow>) {
    const { error } = await supabase
      .from("sessions")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", session.id);
    if (error) {
      toast.error("That change didn't save. Check your connection.");
      return;
    }
    onChanged(patch);
    setSavedAt(Date.now());
  }

  function queueSave(key: string, patch: Partial<SessionRow>) {
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => void save(patch), 700);
  }

  async function regenerate() {
    if (!subject) return;
    setRegenerating(true);
    try {
      const next = await regenerateSessionTopic(session, subject);
      setTopic(next);
      onChanged({ topic_text: next });
      setSavedAt(Date.now());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't get a new topic.");
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <article
      className={`print-session rounded-[14px] p-3 ring-1 ring-black/5 ${done ? "bg-background/30 opacity-75" : "bg-background/60"}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${style.tag}`}
        >
          <span className={`size-1.5 rounded-full ${style.dot}`} />
          {subject?.name ?? "Subject removed"}
        </span>
        {session.pinned ? (
          <span
            title="An exam is within 72 hours, so this comes first today"
            className="inline-flex items-center gap-1 rounded-full bg-conf-low/10 px-2 py-0.5 text-[10px] font-extrabold text-conf-low"
          >
            <Pin className="size-3" strokeWidth={2.5} />
            Exam soon
          </span>
        ) : null}
        {missed ? (
          <span className="rounded-full bg-conf-low/10 px-2 py-0.5 text-[10px] font-extrabold text-conf-low">Missed</span>
        ) : null}
        <label className="ml-auto print:hidden">
          <span className="sr-only">Session length</span>
          <select
            value={minutes}
            onChange={(e) => void changeLength(Number(e.target.value))}
            className="rounded-full bg-card px-2 py-0.5 text-[11px] font-bold text-muted-foreground ring-1 ring-border"
          >
            {[...new Set([15, 20, 25, 30, 45, 60, 90, minutes])].sort((a, b) => a - b).map((m) => (
              <option key={m} value={m}>{m < 60 ? `${m} min` : `${m / 60} hr`}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="print-topic hidden">{topic || "Topic to be decided"}</p>
      <textarea
        value={topic}
        placeholder="Type the topic for this session…"
        rows={3}
        onChange={(e) => {
          setTopic(e.target.value);
          queueSave("topic", { topic_text: e.target.value });
        }}
        className="print-editable min-h-16 w-full resize-y overflow-auto bg-transparent text-[15px] font-bold leading-snug placeholder:text-muted-foreground/60 focus:outline-none"
      />

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() => setTimerOpen(true)}
          className={`print-action inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold ${style.tag}`}
        >
          <Play className="size-3" strokeWidth={3} />
          Start session
        </button>
        <button
          type="button"
          onClick={() => void toggleComplete()}
          disabled={completing}
          aria-pressed={done}
          className={`print-action inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold ring-1 ${
            done ? "bg-conf-high/10 text-conf-high ring-conf-high/30" : "bg-card text-foreground ring-border"
          }`}
        >
          {done ? <CheckCircle2 className="size-3.5" strokeWidth={2.5} /> : <Circle className="size-3.5" strokeWidth={2.5} />}
          {done ? "Completed" : "Mark complete"}
        </button>
        <button
          onClick={regenerate}
          disabled={regenerating || !subject}
          className="print-action ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`size-3 ${regenerating ? "animate-spin" : ""}`} strokeWidth={2.5} />
          {regenerating ? "Thinking…" : "New topic"}
        </button>
      </div>

      <div className="print-action mt-2 flex flex-wrap items-center gap-3 text-[11px] font-bold text-muted-foreground">
        <button type="button" onClick={() => void toggleMissed()} aria-pressed={missed} className="inline-flex items-center gap-1 hover:text-foreground">
          <CalendarX2 className="size-3" /> {missed ? "Undo missed" : "Mark missed"}
        </button>
        <button type="button" onClick={() => setMoveOpen((o) => !o)} className="inline-flex items-center gap-1 hover:text-foreground">
          <MoveRight className="size-3" /> Move
        </button>
        <button type="button" onClick={() => void removeSession()} className="ml-auto inline-flex items-center gap-1 text-conf-low hover:underline">
          <Trash2 className="size-3" /> Delete
        </button>
      </div>
      {moveOpen ? (
        <div className="print-action mt-2 flex flex-wrap items-center gap-2 rounded-[10px] bg-card p-2 ring-1 ring-border">
          <select aria-label="Move to week" value={moveWeek} onChange={(e) => setMoveWeek(Number(e.target.value))} className="rounded-md bg-background px-2 py-1 text-[12px] ring-1 ring-border">
            {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => <option key={w} value={w}>Week {w}</option>)}
          </select>
          <select aria-label="Move to day" value={moveDay} onChange={(e) => setMoveDay(e.target.value)} className="rounded-md bg-background px-2 py-1 text-[12px] ring-1 ring-border">
            {[...new Set([...days, session.day_label])].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <button type="button" onClick={() => void moveSession()} className="rounded-full bg-primary px-3 py-1 text-[11px] font-extrabold text-primary-foreground">Move session</button>
        </div>
      ) : null}

      <p className="print-notes hidden">
        <strong>Gaps:</strong> {notes || "—"}
      </p>
      <div className="print-editable relative mt-3">
        <input
          value={notes}
          placeholder="Gaps to revisit…"
          onChange={(e) => {
            setNotes(e.target.value);
            queueSave("notes", { gap_notes: e.target.value });
          }}
          className={`w-full rounded-[10px] bg-card px-3 py-2 text-[13px] font-medium ring-1 ring-border placeholder:text-muted-foreground/60 focus:outline-none focus:${style.ring}`}
        />
        {savedAt ? (
          <span
            key={savedAt}
            className="saved-flash absolute right-2.5 top-1.5 flex items-center gap-1 text-[10px] font-extrabold text-sci"
          >
            <span className="size-1.5 rounded-full bg-sci" />
            Saved
          </span>
        ) : null}
      </div>

      <SessionTimer
        open={timerOpen}
        onOpenChange={setTimerOpen}
        topic={topic}
        subjectName={subject?.name ?? "Revision session"}
        plannedMinutes={minutes}
      />
    </article>
  );
}
