import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { GCSE_SUBJECTS, SUBJECT_GROUPS, isTiered } from "@/lib/gcse-subjects";
import { addSubject, type LibSubject } from "@/lib/library";
import { libField } from "./LibraryManager";

const BOARDS = ["AQA", "Edexcel (Pearson)", "OCR", "WJEC / Eduqas", "CCEA", "Cambridge (CAIE)"];

type Pick = { name: string; exam_board: string; qualification_level: string };

/**
 * Tick every subject at once, set tiers and exam boards, then add them all in one save.
 * Subjects already in the library are shown as added and can't be picked twice.
 */
export function MultiSubjectPicker({
  existing,
  onDone,
  onCancel,
}: {
  existing: LibSubject[];
  onDone: () => void;
  onCancel?: (() => void) | undefined;
}) {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [search, setSearch] = useState("");
  const [customName, setCustomName] = useState("");
  const [busy, setBusy] = useState(false);

  const added = useMemo(
    () => new Set(existing.map((s) => s.name.trim().toLowerCase())),
    [existing],
  );
  const isPicked = (name: string) => picks.some((p) => p.name.toLowerCase() === name.toLowerCase());

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SUBJECT_GROUPS.map((g) => ({
      label: g,
      names: GCSE_SUBJECTS.filter(
        (s) => s.group === g && (!q || s.name.toLowerCase().includes(q)),
      ).map((s) => s.name),
    })).filter((g) => g.names.length > 0);
  }, [search]);

  function toggle(name: string) {
    setPicks((prev) =>
      prev.some((p) => p.name === name)
        ? prev.filter((p) => p.name !== name)
        : [...prev, { name, exam_board: "", qualification_level: isTiered(name) ? "" : "GCSE" }],
    );
  }

  function update(name: string, patch: Partial<Pick>) {
    setPicks((prev) => prev.map((p) => (p.name === name ? { ...p, ...patch } : p)));
  }

  function addCustom() {
    const name = customName.trim();
    if (!name) return;
    if (added.has(name.toLowerCase()) || isPicked(name)) {
      toast.error("That subject is already on your list.");
      return;
    }
    setPicks((prev) => [...prev, { name, exam_board: "", qualification_level: "GCSE" }]);
    setCustomName("");
  }

  const missingTier = picks.filter((p) => isTiered(p.name) && !p.qualification_level);

  async function saveAll() {
    if (!picks.length || missingTier.length) return;
    setBusy(true);
    let saved = 0;
    try {
      for (const p of picks) {
        await addSubject(p);
        saved++;
      }
      toast.success(`Added ${saved} subject${saved === 1 ? "" : "s"}.`);
      setPicks([]);
      onDone();
    } catch {
      toast.error(
        saved
          ? `Added ${saved} of ${picks.length} subjects. The rest weren't saved, so please try again.`
          : "Your subjects weren't saved. Please try again.",
      );
      setPicks((prev) => prev.slice(saved));
      if (saved) onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-extrabold">Tick every subject you're taking</p>
        <p className="mt-0.5 text-[13px] font-medium text-muted-foreground">
          Choose as many as you like, then add them all at once.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-[12px] bg-background px-3 py-2.5 ring-1 ring-border">
        <Search className="size-4 text-muted-foreground" strokeWidth={2.5} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subjects…"
          aria-label="Search subjects"
          className="w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="pb-1 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </p>
            <div className="grid gap-1 sm:grid-cols-2">
              {group.names.map((name) => {
                const already = added.has(name.toLowerCase());
                const on = isPicked(name);
                return (
                  <button
                    key={name}
                    type="button"
                    disabled={already}
                    aria-pressed={on}
                    onClick={() => toggle(name)}
                    className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left hover:bg-background disabled:cursor-default disabled:hover:bg-transparent"
                  >
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-[6px] ${
                        on || already ? "bg-structure" : "ring-1 ring-border"
                      } ${already ? "opacity-50" : ""}`}
                    >
                      {on || already ? (
                        <Check className="size-3 text-structure-foreground" strokeWidth={3} />
                      ) : null}
                    </span>
                    <span className={`text-sm font-bold ${already ? "text-muted-foreground" : ""}`}>
                      {name}
                    </span>
                    {already ? (
                      <span className="ml-auto text-[11px] font-bold text-muted-foreground">
                        Added
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {groups.length === 0 ? (
          <p className="text-[12px] font-bold text-muted-foreground">
            Nothing matched. Add it as your own subject below.
          </p>
        ) : null}
      </div>

      <div className="rounded-[12px] bg-background p-3 ring-1 ring-border">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
          Not listed?
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="Subject name"
            aria-label="Your own subject name"
            className="min-w-0 flex-1 rounded-[10px] bg-card px-3 py-2 text-[13px] font-medium ring-1 ring-border focus:outline-none"
          />
          <Button type="button" variant="outline" onClick={addCustom}>
            Add to list
          </Button>
        </div>
      </div>

      {picks.length ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-extrabold uppercase text-muted-foreground">
              Your selection ({picks.length})
            </p>
            <label className="flex items-center gap-2 text-[12px] font-bold text-muted-foreground">
              Same exam board for all
              <select
                className="rounded-[10px] bg-background px-2 py-1.5 text-[12px] font-bold ring-1 ring-border"
                value=""
                onChange={(e) => {
                  const board = e.target.value;
                  if (board) setPicks((prev) => prev.map((p) => ({ ...p, exam_board: board })));
                }}
              >
                <option value="">Choose…</option>
                {BOARDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {picks.map((p) => (
            <div
              key={p.name}
              className="grid items-center gap-2 rounded-[12px] bg-background p-2.5 ring-1 ring-border sm:grid-cols-[1fr_11rem_11rem_auto]"
            >
              <span className="text-sm font-bold">{p.name}</span>
              <select
                className={libField}
                aria-label={`Exam board for ${p.name}`}
                value={p.exam_board}
                onChange={(e) => update(p.name, { exam_board: e.target.value })}
              >
                <option value="">Exam board (optional)</option>
                {BOARDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {isTiered(p.name) ? (
                <select
                  className={`${libField} ${!p.qualification_level ? "ring-destructive" : ""}`}
                  aria-label={`Tier for ${p.name}`}
                  value={p.qualification_level}
                  onChange={(e) => update(p.name, { qualification_level: e.target.value })}
                >
                  <option value="">Choose tier…</option>
                  <option value="GCSE Foundation">Foundation tier</option>
                  <option value="GCSE Higher">Higher tier</option>
                </select>
              ) : (
                <div className={`${libField} text-muted-foreground`}>GCSE (no tiers)</div>
              )}
              <button
                type="button"
                onClick={() => setPicks((prev) => prev.filter((x) => x.name !== p.name))}
                aria-label={`Remove ${p.name}`}
                className="justify-self-end rounded-full p-1.5 text-muted-foreground hover:bg-card"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          disabled={busy || !picks.length || missingTier.length > 0}
          onClick={() => void saveAll()}
        >
          {busy
            ? "Adding…"
            : picks.length
              ? `Add ${picks.length} subject${picks.length === 1 ? "" : "s"}`
              : "Add subjects"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        {missingTier.length ? (
          <span className="text-[12px] font-bold text-destructive">
            Choose a tier for {missingTier.map((p) => p.name).join(", ")}.
          </span>
        ) : null}
      </div>
    </div>
  );
}
