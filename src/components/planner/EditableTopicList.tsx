import { useState } from "react";
import { CornerDownRight, Plus, Trash2 } from "lucide-react";

import { ConfidencePicker } from "@/components/ConfidencePicker";

/** Sub-topics are stored as "Parent › Sub" so they schedule like any other topic. */
export const SUB_SEP = " › ";
export const isSub = (t: string) => t.includes(SUB_SEP);
export const subLabel = (t: string) => (isSub(t) ? t.split(SUB_SEP).slice(1).join(SUB_SEP) : t);

/**
 * Inline-editable topic list: rename, delete, add topics and sub-topics, and rate each one.
 * Every change hands back the whole new list (and any renamed rating keys).
 */
export function EditableTopicList({
  subject,
  topics,
  ratings,
  onChange,
  onRate,
}: {
  subject: string;
  topics: string[];
  ratings: Record<string, number | null>;
  onChange: (next: string[], rename?: { from: string; to: string }) => void;
  onRate: (topic: string, value: number | null) => void;
}) {
  const [newTopic, setNewTopic] = useState("");
  const [subFor, setSubFor] = useState<string | null>(null);
  const [newSub, setNewSub] = useState("");
  const [editing, setEditing] = useState<{ topic: string; text: string } | null>(null);

  function commitRename() {
    if (!editing) return;
    const text = editing.text.trim();
    const from = editing.topic;
    setEditing(null);
    if (!text || text === subLabel(from)) return;
    const to = isSub(from) ? `${from.split(SUB_SEP)[0]}${SUB_SEP}${text}` : text;
    if (topics.includes(to)) return;
    // Renaming a parent carries its sub-topics with it.
    const next = topics.map((t) =>
      t === from ? to : !isSub(from) && t.startsWith(from + SUB_SEP) ? to + t.slice(from.length) : t,
    );
    onChange(next, { from, to });
  }

  function remove(topic: string) {
    onChange(topics.filter((t) => t !== topic && !(!isSub(topic) && t.startsWith(topic + SUB_SEP))));
  }

  function addTopic() {
    const text = newTopic.trim();
    if (!text || topics.includes(text)) return;
    onChange([...topics, text]);
    setNewTopic("");
  }

  function addSub(parent: string) {
    const text = newSub.trim();
    if (!text) return;
    const full = `${parent}${SUB_SEP}${text}`;
    if (topics.includes(full)) return;
    // Insert after the parent's last existing sub-topic.
    let at = topics.indexOf(parent);
    while (at + 1 < topics.length && topics[at + 1]!.startsWith(parent + SUB_SEP)) at++;
    const next = [...topics];
    next.splice(at + 1, 0, full);
    onChange(next);
    setNewSub("");
  }

  return (
    <div className="space-y-1.5">
      {topics.map((topic) => {
        const sub = isSub(topic);
        const label = subLabel(topic);
        return (
          <div key={topic} className={sub ? "pl-6" : ""}>
            <div className="flex flex-wrap items-center gap-2 rounded-[10px] bg-card px-2.5 py-2 ring-1 ring-border">
              {sub ? <CornerDownRight className="size-3.5 text-muted-foreground" aria-hidden="true" /> : null}
              {editing?.topic === topic ? (
                <input
                  autoFocus
                  value={editing.text}
                  onChange={(e) => setEditing({ topic, text: e.target.value })}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") setEditing(null);
                  }}
                  aria-label={`Rename ${label}`}
                  className="min-w-0 flex-1 rounded-[8px] bg-background px-2 py-1 text-[13px] font-bold ring-1 ring-border focus:outline-none"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing({ topic, text: label })}
                  title="Click to rename"
                  className="min-w-0 flex-1 text-left text-[13px] font-bold hover:underline"
                >
                  {label}
                </button>
              )}
              <ConfidencePicker
                value={ratings[topic] ?? null}
                onChange={(v) => onRate(topic, v)}
                label={`${subject}: ${label} confidence`}
                size="sm"
              />
              {!sub ? (
                <button
                  type="button"
                  onClick={() => { setSubFor(subFor === topic ? null : topic); setNewSub(""); }}
                  className="rounded-full px-2 py-1 text-[11px] font-bold text-muted-foreground ring-1 ring-border hover:text-foreground"
                >
                  + Sub-topic
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => remove(topic)}
                aria-label={`Delete ${label}`}
                className="rounded-full p-1.5 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
            {subFor === topic ? (
              <div className="mt-1 flex gap-2 pl-6">
                <input
                  autoFocus
                  value={newSub}
                  onChange={(e) => setNewSub(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addSub(topic); }}
                  placeholder={`Sub-topic of ${label}`}
                  className="min-w-0 flex-1 rounded-[10px] bg-card px-3 py-1.5 text-[13px] font-medium ring-1 ring-border focus:outline-none"
                />
                <button type="button" onClick={() => addSub(topic)} className="rounded-full bg-primary px-3 py-1.5 text-[12px] font-bold text-primary-foreground">
                  Add
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
      <div className="flex gap-2 pt-1">
        <input
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addTopic(); }}
          placeholder="Add a topic…"
          aria-label={`Add a topic to ${subject}`}
          className="min-w-0 flex-1 rounded-[10px] bg-card px-3 py-2 text-[13px] font-medium ring-1 ring-border focus:outline-none"
        />
        <button type="button" onClick={addTopic} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-[12px] font-bold text-primary-foreground">
          <Plus className="size-3.5" /> Add topic
        </button>
      </div>
    </div>
  );
}
