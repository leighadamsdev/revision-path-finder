import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Check, PartyPopper } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { syncFlashcards } from "@/lib/leitner";
import type { SessionRow } from "@/lib/plan";
import { subjectStyle } from "@/lib/subjects";

type Item = { s: SessionRow; subject: string; colorKey: string | null | undefined };

/** Today's sessions from the plan, tickable right from the home page. */
export function TodaySessions({ planId, items }: { planId: string; items: Item[] }) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  if (!items.length) return null;
  const done = items.filter((i) => i.s.completed_at).length;
  const allDone = done === items.length;
  const minutes = items.reduce((sum, i) => sum + (i.s.length_minutes ?? 0), 0);

  async function toggle(session: SessionRow) {
    setBusy(session.id);
    const completed_at = session.completed_at ? null : new Date().toISOString();
    const { error } = await supabase.from("sessions").update({ completed_at }).eq("id", session.id);
    setBusy(null);
    if (error) {
      toast.error("That didn't save. Check your connection.");
      return;
    }
    queryClient.setQueryData<SessionRow[]>(["sessions", planId], (prev) =>
      (prev ?? []).map((s) => (s.id === session.id ? { ...s, completed_at } : s)),
    );
    void queryClient.invalidateQueries({ queryKey: ["activity"] });
    if (completed_at) {
      const left = items.filter((i) => !i.s.completed_at && i.s.id !== session.id).length;
      toast.success(left ? `Nice. ${left} to go today.` : "That's today done. Brilliant work.");
      await syncFlashcards(planId).catch(() => undefined);
      void queryClient.invalidateQueries({ queryKey: ["flashcards", planId] });
    }
  }

  return (
    <section
      aria-labelledby="today-heading"
      className={`mt-4 rounded-[20px] bg-card p-5 ring-1 transition-shadow ${
        allDone ? "shadow-[0_0_40px_-8px_var(--color-primary)] ring-primary" : "ring-border"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="today-heading" className="text-xl font-bold">
          {allDone ? "Today's done" : "Today"}
        </h2>
        <p className="text-[13px] font-bold text-muted-foreground">
          {done} of {items.length} done{minutes ? ` · ${minutes} min` : ""}
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${(done / items.length) * 100}%` }}
        />
      </div>

      {allDone ? (
        <p className="mt-4 flex items-center gap-2 text-[14px] font-bold text-primary">
          <PartyPopper className="size-5" aria-hidden="true" />
          Every session ticked off. Test yourself on one, or take the rest of the night off.
        </p>
      ) : null}

      <ul className="mt-4 space-y-2">
        {items.map(({ s, subject, colorKey }) => {
          const ticked = Boolean(s.completed_at);
          const style = subjectStyle(colorKey);
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => void toggle(s)}
                disabled={busy === s.id}
                aria-pressed={ticked}
                className={`flex w-full items-center gap-3 rounded-[14px] bg-background p-3 text-left ring-1 ring-border transition-colors hover:ring-primary/50 disabled:opacity-60 ${
                  ticked ? "opacity-70" : ""
                }`}
              >
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-[8px] ${
                    ticked ? "bg-selected text-selected-foreground" : "ring-2 ring-input"
                  }`}
                >
                  {ticked ? <Check className="size-4" strokeWidth={3} /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-[15px] font-bold ${ticked ? "line-through" : ""}`}>
                    {s.topic_text || subject}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
                    <span className={`size-2 rounded-full ${style.dot}`} />
                    {subject}
                    {s.length_minutes ? ` · ${s.length_minutes} min` : ""}
                  </span>
                </span>
                <span className="sr-only">{ticked ? "Done. Tap to untick." : "Tap to mark done."}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <Link
        to="/plan"
        className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-primary"
      >
        Open my plan for timers and notes <ArrowRight className="size-3.5" />
      </Link>
    </section>
  );
}
