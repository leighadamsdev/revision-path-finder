import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Item = { id: string; title: string };

/** Drop-down checklist: pick all or some content items, then add them as components. */
export function ItemMultiSelect({ items, disabled, onAdd }: { items: Item[]; disabled?: boolean; onAdd: (items: Item[]) => void }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  useEffect(() => setPicked(new Set(items.map((i) => i.id))), [items]);

  const all = items.length > 0 && picked.size === items.length;
  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" disabled={disabled} className="mt-2 flex h-11 w-full items-center justify-between rounded-md bg-card px-2 text-sm font-bold normal-case ring-1 ring-border disabled:opacity-50">
          <span className="truncate">{disabled ? "Choose a Topic first" : all ? `All ${items.length} items` : `${picked.size} of ${items.length} items`}</span>
          <ChevronDown className="size-4 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <label className="flex cursor-pointer items-center gap-2 border-b border-border px-3 py-2.5 text-sm font-extrabold">
          <Checkbox checked={all} onCheckedChange={() => setPicked(all ? new Set() : new Set(items.map((i) => i.id)))} />
          Select all
        </label>
        <div className="max-h-64 overflow-y-auto py-1">
          {items.map((i) => (
            <label key={i.id} className="flex cursor-pointer items-start gap-2 px-3 py-2 text-sm font-medium hover:bg-muted">
              <Checkbox className="mt-0.5" checked={picked.has(i.id)} onCheckedChange={() => toggle(i.id)} />
              {i.title}
            </label>
          ))}
        </div>
        <div className="border-t border-border p-2">
          <Button type="button" className="w-full" disabled={picked.size === 0} onClick={() => { onAdd(items.filter((i) => picked.has(i.id))); setOpen(false); }}>
            Add {picked.size} {picked.size === 1 ? "component" : "components"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
