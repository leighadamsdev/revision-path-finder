import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SubjectUnit } from "@/lib/gcse-topics";
import { newKey, saveTopics, type DraftTopic, type LibSubject } from "@/lib/library";
import { readyListFor } from "@/lib/spec-topics";

/**
 * Pick topics from the ready-made list and add them to the Topic Library.
 * Each section of the list becomes a Topic, with the ticked items as its content items.
 */
export function ReadyListDialog({
  subject,
  onClose,
  onSaved,
}: {
  subject: LibSubject | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const list = useMemo(() => (subject ? readyListFor(subject.name) : null), [subject]);
  const existing = useMemo(
    () => new Set((subject?.topics ?? []).map((t) => t.title.trim().toLowerCase())),
    [subject],
  );
  const key = (unit: string, label: string) => `${unit}|||${label}`;
  const available = (unit: SubjectUnit) => !existing.has(unit.unit.trim().toLowerCase());
  const allKeys = (list?.units ?? [])
    .filter(available)
    .flatMap((u) => u.elements.map((e) => key(u.unit, e.label)));
  const allOn = allKeys.length > 0 && allKeys.every((k) => ticked.has(k));

  function setMany(keys: string[], on: boolean) {
    setTicked((prev) => {
      const next = new Set(prev);
      for (const k of keys) {
        if (on) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  }

  function close() {
    setTicked(new Set());
    onClose();
  }

  async function save() {
    if (!subject || !list) return;
    const topics: DraftTopic[] = list.units
      .filter(available)
      .map((u) => ({
        key: newKey(),
        title: u.unit,
        items: u.elements
          .filter((e) => ticked.has(key(u.unit, e.label)))
          .map((e) => ({ key: newKey(), title: e.label, uncertain: false })),
      }))
      .filter((t) => t.items.length > 0);
    if (!topics.length) return void toast.error("Tick at least one topic to add.");
    setBusy(true);
    try {
      await saveTopics(subject.id, topics, { type: "manual", path: null }, subject.topics.length);
      const items = topics.reduce((n, t) => n + t.items.length, 0);
      toast.success(
        `Added ${topics.length} Topic${topics.length === 1 ? "" : "s"} with ${items} content items.`,
      );
      onSaved();
      close();
    } catch {
      toast.error("Couldn't save. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={Boolean(subject)} onOpenChange={(v) => !v && close()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose {subject?.name} Topics</DialogTitle>
        </DialogHeader>
        <p className="text-[12px] font-medium text-muted-foreground">
          {list?.source} Tick what your school teaches. Each section is added as a Topic, with the
          ticked lines as its content items.
        </p>
        <button
          type="button"
          onClick={() => setMany(allKeys, !allOn)}
          className={`justify-self-start rounded-full px-3 py-1.5 text-[12px] font-bold ${
            allOn
              ? "bg-structure text-structure-foreground"
              : "bg-card text-muted-foreground ring-1 ring-border"
          }`}
        >
          {allOn ? "Clear all" : "Select all"}
        </button>
        <div className="space-y-4">
          {list?.units.map((u) => {
            const keys = u.elements.map((e) => key(u.unit, e.label));
            const added = !available(u);
            const unitOn = keys.every((k) => ticked.has(k));
            return (
              <div key={u.unit}>
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                    {u.unit}
                  </p>
                  {added ? (
                    <span className="text-[11px] font-bold text-muted-foreground">
                      Already in your library
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMany(keys, !unitOn)}
                      className="text-[12px] font-bold text-primary underline-offset-2 hover:underline"
                    >
                      {unitOn ? "Clear section" : "Select section"}
                    </button>
                  )}
                </div>
                {added ? null : (
                  <div className="mt-1 space-y-0.5">
                    {u.elements.map((e) => {
                      const k = key(u.unit, e.label);
                      const on = ticked.has(k);
                      return (
                        <button
                          key={k}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setMany([k], !on)}
                          className="flex w-full items-start gap-2.5 rounded-[10px] px-2 py-1.5 text-left hover:bg-background"
                        >
                          <span
                            className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-[6px] ${
                              on ? "bg-structure" : "ring-1 ring-border"
                            }`}
                          >
                            {on ? (
                              <Check className="size-3 text-structure-foreground" strokeWidth={3} />
                            ) : null}
                          </span>
                          <span className="text-[13px] font-medium">{e.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button disabled={busy || ticked.size === 0} onClick={() => void save()}>
            {busy ? "Adding…" : `Add ${ticked.size || ""} to My Topics`.replace("  ", " ")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
