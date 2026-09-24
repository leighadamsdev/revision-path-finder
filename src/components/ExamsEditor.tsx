import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import { DatePicker } from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { useExams, useOfficialExams, usePlanTopics } from "@/hooks/useActivePlan";
import { MAX_EXAM_DATES, saveSubjectExams, type ExamInput, type ExamKind } from "@/lib/exams";
import { syncFlashcards } from "@/lib/leitner";
import type { PlanSubject } from "@/lib/plan";
import { subjectStyle } from "@/lib/subjects";

const blank = (paper_no: number): ExamInput => ({
  subject_id: "",
  paper_no,
  kind: "mock",
  label: "",
  exam_date: "",
  official_exam_id: null,
  verified: false,
  all_topics: true,
  topic_ids: [],
});

/**
 * Per-subject, per-paper exams. Mocks: the student types the date. Finals: picked from the
 * official list; if the paper isn't listed yet it can be typed, marked unverified.
 * Each exam ticks which of the plan's topics it covers.
 */
export function ExamsEditor({ planId, subjects, onDone }: { planId: string; subjects: PlanSubject[]; onDone?: () => void }) {
  const queryClient = useQueryClient();
  const examsQuery = useExams(planId);
  const official = useOfficialExams().data ?? [];
  const topics = usePlanTopics(planId).data ?? [];
  const [draft, setDraft] = useState<Record<string, ExamInput[]>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const exams = examsQuery.data ?? [];
    setDraft(
      Object.fromEntries(
        subjects.map((s) => [
          s.id,
          exams
            .filter((e) => e.subject_id === s.id)
            .map((e) => ({ ...e, kind: e.kind === "untagged" ? ("mock" as ExamKind) : e.kind })),
        ]),
      ),
    );
  }, [examsQuery.data, subjects]);

  function update(subjectId: string, index: number, patch: Partial<ExamInput>) {
    setDraft((prev) => ({
      ...prev,
      [subjectId]: (prev[subjectId] ?? []).map((e, i) => (i === index ? { ...e, ...patch } : e)),
    }));
  }

  async function save() {
    setSaving(true);
    try {
      for (const subject of subjects) {
        const list = (draft[subject.id] ?? []).map((e, i) => ({ ...e, subject_id: subject.id, paper_no: i + 1 }));
        await saveSubjectExams(planId, subject.id, list);
      }
      await syncFlashcards(planId).catch(() => undefined);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["exams", planId] }),
        queryClient.invalidateQueries({ queryKey: ["plan-subjects", planId] }),
        queryClient.invalidateQueries({ queryKey: ["flashcards", planId] }),
      ]);
      toast.success("Exams saved. Rebuild the plan from Edit plan to re-weight your sessions.");
      onDone?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save exams.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-5 rounded-[16px] bg-card p-4 ring-1 ring-border sm:p-5">
      <p className="text-sm font-extrabold tracking-tight">Your exams</p>
      <p className="mt-1 text-[12px] font-medium text-muted-foreground">
        Up to three papers per subject. Mocks: type the date your school gave you. Finals: pick the
        official paper. Tick the topics each exam covers.
      </p>
      <div className="mt-4 space-y-5">
        {subjects.map((subject) => {
          const list = draft[subject.id] ?? [];
          const style = subjectStyle(subject.color_key);
          const subjectTopics = topics.filter((t) => t.subject_id === subject.id);
          const papers = official.filter((o) => o.subject_id === subject.id);
          return (
            <div key={subject.id} className="rounded-[12px] bg-background p-3 ring-1 ring-black/5">
              <p className="flex items-center gap-2 text-[13px] font-extrabold">
                <span className={`size-2 rounded-full ${style.dot}`} />
                {subject.name}
              </p>
              <div className="mt-3 space-y-3">
                {list.map((exam, index) => (
                  <div key={exam.id ?? `new-${index}`} className="rounded-[10px] bg-card p-3 ring-1 ring-border">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-muted-foreground">Paper {index + 1}</span>
                      <div className="inline-flex rounded-full bg-background p-0.5 ring-1 ring-border">
                        {(["mock", "final"] as const).map((kind) => (
                          <button
                            key={kind}
                            type="button"
                            onClick={() =>
                              update(subject.id, index, {
                                kind,
                                official_exam_id: null,
                                verified: kind === "mock",
                              })
                            }
                            className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
                              exam.kind === kind ? "bg-structure text-structure-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {kind === "mock" ? "Mock" : "Final"}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({ ...prev, [subject.id]: list.filter((_, i) => i !== index) }))
                        }
                        className="ml-auto text-muted-foreground hover:text-foreground"
                        aria-label="Remove this exam"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <div className="mt-2">
                      {exam.kind === "final" ? (
                        <div className="space-y-2">
                          <select
                            value={exam.official_exam_id ?? (exam.exam_date ? "custom" : "")}
                            onChange={(e) => {
                              const value = e.target.value;
                              const pick = papers.find((p) => p.id === value);
                              if (pick) {
                                update(subject.id, index, {
                                  official_exam_id: pick.id,
                                  exam_date: pick.exam_date,
                                  label: pick.paper,
                                  verified: true,
                                });
                              } else {
                                update(subject.id, index, { official_exam_id: null, verified: false, label: "" });
                              }
                            }}
                            className="w-full rounded-[8px] bg-background px-3 py-2 text-[13px] font-semibold ring-1 ring-border focus:outline-none"
                          >
                            <option value="">Choose the official paper…</option>
                            {papers.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.paper}
                                {p.exam_board ? ` · ${p.exam_board}` : ""}
                                {p.tier ? ` · ${p.tier}` : ""} — {format(parseISO(p.exam_date), "EEE d MMM yyyy")}
                              </option>
                            ))}
                            <option value="custom">My paper isn't listed</option>
                          </select>
                          {!exam.official_exam_id ? (
                            <>
                              <DatePicker
                                value={exam.exam_date}
                                onChange={(v) => update(subject.id, index, { exam_date: v })}
                                label="Exam date"
                              />
                              <p className="text-[11px] font-semibold text-muted-foreground">
                                {papers.length
                                  ? "Not on the official list yet — marked as unconfirmed."
                                  : "Official dates for this subject aren't loaded yet — type it for now; it's marked as unconfirmed."}
                              </p>
                            </>
                          ) : null}
                        </div>
                      ) : (
                        <DatePicker
                          value={exam.exam_date}
                          onChange={(v) => update(subject.id, index, { exam_date: v })}
                          label="Mock date"
                        />
                      )}
                    </div>

                    {subjectTopics.length ? (
                      <div className="mt-3">
                        <label className="flex items-center gap-2 text-[12px] font-bold">
                          <input
                            type="checkbox"
                            checked={exam.all_topics}
                            onChange={(e) =>
                              update(subject.id, index, {
                                all_topics: e.target.checked,
                                topic_ids: e.target.checked ? [] : subjectTopics.map((t) => t.id),
                              })
                            }
                          />
                          Covers all my {subject.name} topics
                        </label>
                        {!exam.all_topics ? (
                          <div className="mt-2 max-h-56 space-y-1 overflow-y-auto pr-1">
                            {subjectTopics.map((t) => (
                              <label key={t.id} className="flex items-start gap-2 text-[12px] font-medium">
                                <input
                                  type="checkbox"
                                  className="mt-0.5"
                                  checked={exam.topic_ids.includes(t.id)}
                                  onChange={(e) =>
                                    update(subject.id, index, {
                                      topic_ids: e.target.checked
                                        ? [...exam.topic_ids, t.id]
                                        : exam.topic_ids.filter((id) => id !== t.id),
                                    })
                                  }
                                />
                                {t.topic}
                              </label>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
                {list.length < MAX_EXAM_DATES ? (
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({ ...prev, [subject.id]: [...list, blank(list.length + 1)] }))
                    }
                    className="inline-flex items-center gap-1 text-[12px] font-extrabold text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="size-3.5" strokeWidth={3} />
                    Add an exam
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <Button className="mt-5" onClick={() => void save()} disabled={saving}>
        {saving ? "Saving…" : "Save exams"}
      </Button>
    </div>
  );
}
