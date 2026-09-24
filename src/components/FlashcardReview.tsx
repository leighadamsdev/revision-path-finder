import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Layers } from "lucide-react";
import { toast } from "sonner";

import { BOX_LABEL, dueToday, reviewCard, type Flashcard } from "@/lib/leitner";
import type { Subject } from "@/lib/plan";
import { subjectStyle } from "@/lib/subjects";

/** Today's Leitner cards, shown as a short block inside the day's sessions. */
export function FlashcardReview({
  planId,
  cards,
  subjects,
}: {
  planId: string;
  cards: Flashcard[];
  subjects: Subject[];
}) {
  const queryClient = useQueryClient();
  const { due, decay } = dueToday(cards);
  const queue = decay ? [...due, decay] : due;
  const [done, setDone] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<string | null>(null);
  const left = queue.filter((c) => !done.includes(c.id));
  const card = left[0];

  async function answer(correct: boolean) {
    if (!card) return;
    try {
      const to = await reviewCard(card, correct);
      setDone((d) => [...d, card.id]);
      setRevealed(null);
      toast.success(correct ? `Moved to ${BOX_LABEL[to]}` : "Back to Box 1 — see it again tomorrow");
      if (left.length === 1) await queryClient.invalidateQueries({ queryKey: ["flashcards", planId] });
    } catch {
      toast.error("That didn't save — try again.");
    }
  }

  if (!queue.length) return null;
  const subject = card ? subjects.find((s) => s.id === card.subject_id) : undefined;
  const style = subjectStyle(subject?.color_key);

  return (
    <article className="print-hidden rounded-[14px] bg-background/60 p-3 ring-1 ring-black/5">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-extrabold">
          <Layers className="size-3" strokeWidth={2.5} />
          Flashcard review
        </span>
        <span className="ml-auto text-[11px] font-bold text-muted-foreground">
          {left.length} of {queue.length} left
        </span>
      </div>
      {card ? (
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${style.tag}`}>
              {subject?.name ?? "Subject"}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground">
              {card === decay ? "Decay check · from the Bench" : BOX_LABEL[card.box]}
            </span>
          </div>
          <p className="mt-2 text-[14px] font-bold leading-snug">{card.prompt}</p>
          {revealed === card.id ? (
            <>
              <p className="mt-1 text-[12px] font-medium text-muted-foreground">
                Could you explain this from memory, without notes?
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => void answer(false)}
                  className="flex-1 rounded-full bg-conf-low/10 px-3 py-2 text-[12px] font-extrabold text-conf-low"
                >
                  Not yet
                </button>
                <button
                  type="button"
                  onClick={() => void answer(true)}
                  className="flex-1 rounded-full bg-conf-high/10 px-3 py-2 text-[12px] font-extrabold text-conf-high"
                >
                  Got it
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(card.id)}
              className="mt-3 rounded-full bg-card px-3 py-1.5 text-[12px] font-extrabold ring-1 ring-border"
            >
              I've tried to recall it
            </button>
          )}
        </div>
      ) : (
        <p className="text-[13px] font-semibold text-muted-foreground">All of today's cards are done.</p>
      )}
    </article>
  );
}
