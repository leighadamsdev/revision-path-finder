import { useCallback, useEffect, useMemo, useState } from "react";
import { FolderOpen, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Saved = { id: string; subject: string; topic: string; rows: string[] };

/** Library of reusable Knowledge Checkers, grouped by subject. Loading gives a fresh, blank copy. */
export function SavedCheckers({
  subject,
  topic,
  components,
  onLoad,
}: {
  subject: string;
  topic: string;
  components: string[];
  onLoad: (c: { subject: string; topic: string; components: string[] }) => void;
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
    toast.success(existing ? "Saved checker updated." : "Saved to your checker library.");
    void refresh();
  }

  return (
    <section className="mt-8 rounded-[8px] border border-checker-line bg-card p-5 shadow-sm print:hidden">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase text-muted-foreground">My checker library</p>
          <h2 className="mt-1 text-2xl font-extrabold">Saved Knowledge Checkers</h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">Save the key components once, then open a fresh copy whenever you revise that topic again.</p>
        </div>
        <Button type="button" disabled={busy} onClick={() => void save()}><Save /> Save this checker</Button>
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
                  <li key={c.id} className="flex items-center gap-2 rounded-[8px] bg-checker-paper px-3 py-2 ring-1 ring-checker-line">
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
