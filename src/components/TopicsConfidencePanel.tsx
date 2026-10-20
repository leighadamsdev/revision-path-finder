import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { BandChip, BandLegend } from "@/components/BandChip";
import { ConfidencePicker } from "@/components/ConfidencePicker";
import {
  addSubtopic,
  rateSubtopic,
  rateTopic,
  removeSubtopic,
  syncFlashcards,
  type Flashcard,
  type Subtopic,
} from "@/lib/leitner";
import { averageConfidence } from "@/lib/confidence";
import type { PlanSubject, PlanTopic } from "@/lib/plan";
import { subjectStyle } from "@/lib/subjects";
import { useTopicRatings } from "@/hooks/useTopicRatings";

/**
 * Topic list with Red/Amber/Green bands and an optional subtopic layer.
 * Every rating change keeps flashcards in step (1–4 makes a card; lowering wakes a benched one).
 */
export function TopicsConfidencePanel({
  planId,
  subjects,
  topics,
  subtopics,
  cards,
}: {
  planId: string;
  subjects: PlanSubject[];
  topics: PlanTopic[];
  subtopics: Subtopic[];
  cards: Flashcard[];
}) {
  const queryClient = useQueryClient();
  const saved = useTopicRatings();
  const [open, setOpen] = useState<string | null>(null);
  const [newSub, setNewSub] = useState<Record<string, string>>({});

  async function refresh() {
    await syncFlashcards(planId);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["plan-topics", planId] }),
      queryClient.invalidateQueries({ queryKey: ["subtopics", planId] }),
      queryClient.invalidateQueries({ queryKey: ["flashcards", planId] }),
    ]);
  }

  async function run(action: () => Promise<void>) {
    try {
      await action();
      await refresh();
    } catch {
      toast.error("That didn't save — try again.");
    }
  }

  const withTopics = subjects.filter((s) => topics.some((t) => t.subject_id === s.id));
  if (!withTopics.length) return null;

  return (
    <section className="mb-7 print:hidden">
      <div className="rounded-[16px] bg-card p-4 ring-1 ring-black/5 sm:p-5">
        <p className="text-sm font-extrabold tracking-tight">Topics and confidence</p>
        <div className="mt-1">
          <BandLegend />
        </div>
        <p className="mt-1 text-[12px] font-medium text-muted-foreground">
          Anything red or amber becomes a flashcard. Split a topic into subtopics to rate the parts
          separately.
        </p>
        <div className="mt-4 space-y-2">
          {withTopics.map((subject) => {
            const own = topics.filter((t) => t.subject_id === subject.id);
            const style = subjectStyle(subject.color_key);
            const avg = averageConfidence(
              own.flatMap((t) => {
                const subs = subtopics.filter((s) => s.plan_topic_id === t.id);
                return subs.length ? subs.map((s) => s.confidence) : [t.confidence];
              }),
            );
            const isOpen = open === subject.id;
            const cardCount = cards.filter((c) => c.subject_id === subject.id && c.box !== "bench").length;
            return (
              <div key={subject.id} className={`rounded-[8px] border-l-4 bg-background ring-1 ring-border/60 ${avg == null ? "border-border" : avg <= 2.49 ? "border-conf-low" : avg < 4.5 ? "border-conf-mid" : "border-conf-high"}`}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : subject.id)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className={`size-2 shrink-0 rounded-full ${style.dot}`} />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold">{subject.name}</span>
                  <span className="hidden text-[11px] font-bold text-muted-foreground sm:inline">
                    {own.length} topics · {cardCount} cards
                  </span>
                  <BandChip value={avg == null ? null : Math.round(avg)} />
                  <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen ? (
                  <div className="space-y-2 px-3 pb-3">
                    {own.map((topic) => {
                      const subs = subtopics.filter((s) => s.plan_topic_id === topic.id);
                      return (
                        <div key={topic.id} className={`rounded-[8px] border-l-[3px] bg-card p-2.5 ring-1 ring-border ${subs.length ? "border-border" : topic.confidence == null ? "border-border" : topic.confidence <= 2 ? "border-conf-low" : topic.confidence <= 4 ? "border-conf-mid" : "border-conf-high"}`}>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="min-w-0 flex-1 text-[12px] font-bold leading-relaxed">
                              {topic.topic}
                            </span>
                            {subs.length ? null : (
                              <>
                                <BandChip value={topic.confidence} />
                                <ConfidencePicker
                                  size="sm"
                                  value={topic.confidence}
                                  label={`${topic.topic} confidence`}
                                  onChange={(v) =>
                                    void run(async () => {
                                      await rateTopic(topic.id, v);
                                      // Mirror onto "Rate my topics" (this plan is already updated).
                                      await saved.rate(subject.name, topic.topic, v, { updatePlans: false }).catch(() => undefined);
                                    })
                                  }
                                />
                              </>
                            )}
                          </div>
                          {subs.length ? (
                            <ul className="mt-2 space-y-1 border-l-2 border-border pl-3">
                              {subs.map((sub) => (
                                <li key={sub.id} className={`flex flex-wrap items-center gap-2 border-l-[3px] pl-2 ${sub.confidence == null ? "border-border" : sub.confidence <= 2 ? "border-conf-low" : sub.confidence <= 4 ? "border-conf-mid" : "border-conf-high"}`}>
                                  <span className="min-w-0 flex-1 text-[12px] font-semibold">{sub.name}</span>
                                  <BandChip value={sub.confidence} />
                                  <ConfidencePicker
                                    size="sm"
                                    value={sub.confidence}
                                    label={`${sub.name} confidence`}
                                    onChange={(v) => void run(() => rateSubtopic(sub.id, v))}
                                  />
                                  <button
                                    type="button"
                                    aria-label={`Remove ${sub.name}`}
                                    onClick={() => void run(() => removeSubtopic(sub.id))}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    <X className="size-3.5" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                          <form
                            className="mt-2 flex gap-2"
                            onSubmit={(e) => {
                              e.preventDefault();
                              const name = (newSub[topic.id] ?? "").trim();
                              if (!name) return;
                              setNewSub((p) => ({ ...p, [topic.id]: "" }));
                              void run(() => addSubtopic(topic.id, name, subs.length));
                            }}
                          >
                            <input
                              value={newSub[topic.id] ?? ""}
                              onChange={(e) => setNewSub((p) => ({ ...p, [topic.id]: e.target.value }))}
                              placeholder="Add a subtopic…"
                              className="min-w-0 flex-1 rounded-[8px] bg-background px-2.5 py-1.5 text-[12px] font-medium ring-1 ring-border focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 rounded-full px-2.5 text-[11px] font-extrabold text-muted-foreground hover:text-foreground"
                            >
                              <Plus className="size-3.5" strokeWidth={3} />
                              Add
                            </button>
                          </form>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
