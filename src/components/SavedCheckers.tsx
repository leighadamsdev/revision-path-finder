import { useCallback, useEffect, useMemo, useState } from "react";
import { Eraser, FolderOpen, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { supabase } from "@/integrations/supabase/client";

type Saved = { id: string; subject: string; topic: string; rows: string[] };

/** Library of reusable Knowledge Checkers, grouped by subject. Loading gives a fresh, blank copy. */
export function SavedCheckers({
  subject,
  topic,
  components,
  onLoad,
  onSaved,
}: {
  subject: string;
  topic: string;
  components: string[];
  onLoad: (c: { subject: string; topic: string; components: string[] }) => void;
  /** Runs once a save lands, so the page can be cleared ready for the next checker. */
  onSaved: () => void;
}) {
  const [items, setItems] = useState<Saved[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const { data } = await supabase.from("knowledge_checkers").select("id,subject,topic,rows").order("subject").order("topic");
    setItems((data ?? []).map((d) => ({ ...d, rows: Array.isArray(d.rows) ? (d.rows as string[]) : [] })));
  }, []);
  useEffect(() => void refresh(), [refresh]);

  const groups = useMemo(() => {
    const m = new Map<string, Saved[]>();
    for (const i of items) {
      const k = i.subject.trim() || "No subject";
      m.set(k, [...(m.get(k) ?? []), i]);
    }
    return [...m.entries()];
  }, [items]);

  async function save() {
    const rows = components.map((c) => c.trim()).filter(Boolean);
    if (!subject.trim() || !topic.trim()) return void toast.error("Add a subject and topic title first.");
    if (!rows.length) return void toast.error("Add at least one key component first.");
    setBusy(true);
    const existing = items.find((i) => i.subject.trim().toLowerCase() === subject.trim().toLowerCase() && i.topic.trim().toLowerCase() === topic.trim().toLowerCase());
    const { error } = existing
      ? await supabase.from("knowledge_checkers").update({ rows }).eq("id", existing.id)
      : await supabase.from("knowledge_checkers").insert({ subject: subject.trim(), topic: topic.trim(), rows });
    setBusy(false);
    if (error) return void toast.error("Couldn't save — try again.");
    toast.success(existing ? "Saved checker updated. Blank sheet ready." : "Saved to your checker library. Blank sheet ready.");
    void refresh();
    onSaved();
  }

  /** Empties the whole library — the recovery option when a checker was saved or named wrong. */
  async function clearAll() {
    if (!items.length) return;
    setBusy(true);
    const { error } = await supabase.from("knowledge_checkers").delete().in("id", items.map((i) => i.id));
    setBusy(false);
    if (error) return void toast.error("Couldn't clear the library — try again.");
    toast.success(`Cleared ${items.length} saved ${items.length === 1 ? "checker" : "checkers"}.`);
    void refresh();
  }

  return (
    <section className="mt-8 rounded-[8px] border border-border bg-card p-5 shadow-sm print:hidden">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase text-muted-foreground">My checker library</p>
          <h2 className="mt-1 text-2xl font-extrabold">Saved Knowledge Checkers</h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">Save the key components once, then open a fresh copy whenever you revise that topic again. Saving clears the sheet ready for your next one.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={busy} onClick={() => void save()}><Save /> Save this checker</Button>
          {groups.length > 0 ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="outline" disabled={busy} className="border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"><Eraser /> Clear all saved</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear every saved checker?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This deletes all {items.length} saved {items.length === 1 ? "checker" : "checkers"} from your library. The sheet you are working on stays as it is.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep my library</AlertDialogCancel>
                  <AlertDialogAction onClick={() => void clearAll()}>Yes, clear all</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      </div>
      {groups.length === 0 ? (
        <p className="mt-4 text-sm font-semibold text-muted-foreground">Nothing saved yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {groups.map(([name, list]) => (
            <div key={name}>
              <h3 className="text-sm font-extrabold uppercase text-muted-foreground">{name}</h3>
              <ul className="mt-2 space-y-2">
                {list.map((c) => (
                  <li key={c.id} className="flex items-center gap-2 rounded-[8px] bg-background px-3 py-2 ring-1 ring-border">
                    <span className="min-w-0 flex-1 text-sm font-bold">{c.topic} <span className="font-semibold text-muted-foreground">· {c.rows.length} components</span></span>
                    <Button type="button" size="sm" variant="outline" onClick={() => { onLoad({ subject: c.subject, topic: c.topic, components: c.rows }); window.scrollTo({ top: 0, behavior: "smooth" }); toast.success("Fresh copy opened."); }}><FolderOpen /> Open</Button>
                    <Button type="button" size="icon" variant="ghost" aria-label={`Delete ${c.topic}`} onClick={async () => { if (!window.confirm(`Delete saved checker “${c.topic}”?`)) return; await supabase.from("knowledge_checkers").delete().eq("id", c.id); void refresh(); }}><Trash2 /></Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
