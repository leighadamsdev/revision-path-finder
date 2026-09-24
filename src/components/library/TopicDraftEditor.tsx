import { useState } from "react";
import { AlertTriangle, GripVertical, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newKey, type DraftTopic } from "@/lib/library";

type Drag = { kind: "topic"; topic: number } | { kind: "item"; topic: number; item: number } | null;

/** Editable list of Topics and their content items, with drag-to-reorder. */
export function TopicDraftEditor({
  topics,
  onChange,
  allowAddTopic = true,
}: {
  topics: DraftTopic[];
  onChange: (next: DraftTopic[]) => void;
  allowAddTopic?: boolean;
}) {
  const [drag, setDrag] = useState<Drag>(null);

  const update = (fn: (draft: DraftTopic[]) => void) => {
    const next = topics.map((t) => ({ ...t, items: [...t.items] }));
    fn(next);
    onChange(next);
  };

  function dropOnTopic(target: number) {
    if (!drag) return;
    update((next) => {
      if (drag.kind === "topic") {
        const [moved] = next.splice(drag.topic, 1);
        if (moved) next.splice(target, 0, moved);
      } else {
        const [moved] = next[drag.topic]!.items.splice(drag.item, 1);
        if (moved) next[target]!.items.push(moved);
      }
    });
    setDrag(null);
  }

  function dropOnItem(topic: number, item: number) {
    if (!drag || drag.kind !== "item") return;
    update((next) => {
      const [moved] = next[drag.topic]!.items.splice(drag.item, 1);
      if (moved) next[topic]!.items.splice(item, 0, moved);
    });
    setDrag(null);
  }

  return (
    <div className="space-y-3">
      {topics.map((topic, ti) => (
        <div
          key={topic.key}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.stopPropagation();
            dropOnTopic(ti);
          }}
          className="rounded-[14px] bg-background p-3 ring-1 ring-border"
        >
          <div className="flex items-center gap-2">
            <span
              draggable
              onDragStart={() => setDrag({ kind: "topic", topic: ti })}
              className="cursor-grab text-muted-foreground"
              aria-label="Drag to reorder topic"
            >
              <GripVertical className="size-4" />
            </span>
            <Input
              value={topic.title}
              onChange={(e) => update((n) => void (n[ti]!.title = e.target.value))}
              placeholder="Topic title, e.g. Topic 1 — Energy"
              className="h-9 text-sm font-extrabold"
            />
            <Button type="button" variant="ghost" size="icon" aria-label="Delete topic" onClick={() => update((n) => void n.splice(ti, 1))}>
              <Trash2 />
            </Button>
          </div>
          <ul className="mt-2 space-y-1.5 pl-6">
            {topic.items.map((item, ii) => (
              <li
                key={item.key}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.stopPropagation();
                  dropOnItem(ti, ii);
                }}
                className="flex items-center gap-2"
              >
                <span
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    setDrag({ kind: "item", topic: ti, item: ii });
                  }}
                  className="cursor-grab text-muted-foreground"
                  aria-label="Drag to reorder item"
                >
                  <GripVertical className="size-3.5" />
                </span>
                <Input
                  value={item.title}
                  onChange={(e) =>
                    update((n) => {
                      n[ti]!.items[ii] = { ...n[ti]!.items[ii]!, title: e.target.value, uncertain: false };
                    })
                  }
                  className={`h-8 text-[13px] font-medium ${item.uncertain ? "ring-2 ring-checker-highlight bg-checker-highlight/30" : ""}`}
                />
                {item.uncertain ? (
                  <span title="Please check this reading" className="text-amber-700">
                    <AlertTriangle className="size-4" />
                  </span>
                ) : null}
                {topics.length > 1 ? (
                  <select
                    aria-label="Move to topic"
                    value=""
                    onChange={(e) => {
                      const to = Number(e.target.value);
                      update((n) => {
                        const [moved] = n[ti]!.items.splice(ii, 1);
                        if (moved) n[to]!.items.push(moved);
                      });
                    }}
                    className="h-8 w-20 rounded-md bg-card px-1 text-[11px] font-bold ring-1 ring-border"
                  >
                    <option value="">Move…</option>
                    {topics.map((t, i) => (i === ti ? null : <option key={t.key} value={i}>{t.title.slice(0, 30) || `Topic ${i + 1}`}</option>))}
                  </select>
                ) : null}
                <Button type="button" variant="ghost" size="icon" aria-label="Delete item" onClick={() => update((n) => void n[ti]!.items.splice(ii, 1))}>
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => update((n) => void n[ti]!.items.push({ key: newKey(), title: "", uncertain: false }))}
            className="mt-2 ml-6 inline-flex items-center gap-1 text-[12px] font-bold text-muted-foreground"
          >
            <Plus className="size-3.5" /> Add content item
          </button>
        </div>
      ))}
      {allowAddTopic ? (
        <Button type="button" variant="outline" onClick={() => onChange([...topics, { key: newKey(), title: "", items: [{ key: newKey(), title: "", uncertain: false }] }])}>
          <Plus /> Add a Topic
        </Button>
      ) : null}
    </div>
  );
}
