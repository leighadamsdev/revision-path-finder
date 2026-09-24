import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";

import { supabase } from "@/integrations/supabase/client";

/** Box 1 daily, Box 2 weekly, Box 3 fortnightly. Bench = resting, not deleted. */
export type Box = "1" | "2" | "3" | "bench";

export const BOX_INTERVAL_DAYS: Record<Exclude<Box, "bench">, number> = { "1": 1, "2": 7, "3": 14 };
export const BOX_LABEL: Record<Box, string> = {
  "1": "Box 1 · daily",
  "2": "Box 2 · weekly",
  "3": "Box 3 · every two weeks",
  bench: "Bench · resting",
};

export type Flashcard = {
  id: string;
  plan_id: string;
  subject_id: string;
  plan_topic_id: string | null;
  subtopic_id: string | null;
  prompt: string;
  box: Box;
  due_on: string;
  last_reviewed_at: string | null;
  refreshed_for_exam_id: string | null;
};

export type Subtopic = {
  id: string;
  plan_topic_id: string;
  name: string;
  confidence: number | null;
  position: number;
};

const today = () => format(new Date(), "yyyy-MM-dd");

/** Correct moves up a box (Box 3 → Bench). Any wrong answer goes back to Box 1. */
export function nextBox(box: Box, correct: boolean): Box {
  if (!correct) return "1";
  if (box === "1") return "2";
  if (box === "2") return "3";
  return "bench";
}

export function dueAfter(box: Box, from = new Date()) {
  if (box === "bench") return format(from, "yyyy-MM-dd");
  return format(addDays(from, BOX_INTERVAL_DAYS[box]), "yyyy-MM-dd");
}

export async function fetchFlashcards(planId: string): Promise<Flashcard[]> {
  const { data, error } = await supabase
    .from("flashcards")
    .select(
      "id, plan_id, subject_id, plan_topic_id, subtopic_id, prompt, box, due_on, last_reviewed_at, refreshed_for_exam_id",
    )
    .eq("plan_id", planId)
    .order("due_on");
  if (error) throw error;
  return (data ?? []) as Flashcard[];
}

export async function fetchSubtopics(planId: string): Promise<Subtopic[]> {
  const { data, error } = await supabase
    .from("plan_subtopics")
    .select("id, plan_topic_id, name, confidence, position, plan_topics!inner(plan_id)")
    .eq("plan_topics.plan_id", planId)
    .order("position");
  if (error) throw error;
  return (data ?? []).map(({ plan_topics: _ignored, ...rest }) => rest as Subtopic);
}

export async function reviewCard(card: Flashcard, correct: boolean, sessionId?: string | null) {
  const to = nextBox(card.box, correct);
  const { error } = await supabase
    .from("flashcards")
    .update({ box: to, due_on: dueAfter(to), last_reviewed_at: new Date().toISOString() })
    .eq("id", card.id);
  if (error) throw error;
  await supabase.from("flashcard_reviews").insert({
    flashcard_id: card.id,
    session_id: sessionId ?? null,
    correct,
    from_box: card.box,
    to_box: to,
  });
  return to;
}

/**
 * Cards due today, plus reactivation rules:
 *  - one random Bench card slipped in as a "decay check" roughly one day in five
 */
export function dueToday(cards: Flashcard[], seed = today()) {
  const now = today();
  const due = cards.filter((c) => c.box !== "bench" && c.due_on <= now);
  const bench = cards.filter((c) => c.box === "bench");
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const decay = bench.length && hash % 5 === 0 ? bench[hash % bench.length]! : null;
  return { due, decay };
}

/**
 * Keeps cards in step with ratings. A subtopic (or a topic with no subtopics) rated 1–4
 * gets a card; rating 5 creates none. Lowering a rating wakes a benched card. When a linked
 * exam enters its final 4 weeks every benched card for that subject gets a one-off refresh.
 */
export async function syncFlashcards(planId: string) {
  const [{ data: topics }, subtopics, cards, { data: exams }] = await Promise.all([
    supabase.from("plan_topics").select("id, subject_id, topic, confidence").eq("plan_id", planId),
    fetchSubtopics(planId),
    fetchFlashcards(planId),
    supabase.from("exams").select("id, subject_id, exam_date").eq("plan_id", planId),
  ]);

  const inserts: Array<Record<string, unknown>> = [];
  const wake: string[] = [];
  const topicRows = topics ?? [];

  const consider = (
    subjectId: string,
    topicId: string,
    subtopicId: string | null,
    prompt: string,
    confidence: number | null,
  ) => {
    const card = cards.find((c) =>
      subtopicId ? c.subtopic_id === subtopicId : c.plan_topic_id === topicId && !c.subtopic_id,
    );
    if (confidence == null || confidence >= 5) return;
    if (!card) {
      inserts.push({
        plan_id: planId,
        subject_id: subjectId,
        plan_topic_id: topicId,
        subtopic_id: subtopicId,
        prompt,
        box: "1",
        due_on: today(),
      });
    } else if (card.box === "bench" && confidence <= 3) {
      wake.push(card.id);
    }
  };

  for (const topic of topicRows) {
    const subs = subtopics.filter((s) => s.plan_topic_id === topic.id);
    if (subs.length) {
      for (const sub of subs) {
        consider(topic.subject_id, topic.id, sub.id, `${topic.topic} — ${sub.name}`, sub.confidence);
      }
    } else {
      consider(topic.subject_id, topic.id, null, topic.topic, topic.confidence);
    }
  }

  if (inserts.length) await supabase.from("flashcards").insert(inserts as never);
  if (wake.length) {
    await supabase.from("flashcards").update({ box: "1", due_on: today() }).in("id", wake);
  }

  // Pre-exam refresh, once per exam.
  for (const exam of exams ?? []) {
    const gap = differenceInCalendarDays(parseISO(exam.exam_date), new Date());
    if (gap < 0 || gap > 28) continue;
    const benched = cards.filter(
      (c) => c.subject_id === exam.subject_id && c.box === "bench" && c.refreshed_for_exam_id !== exam.id,
    );
    if (benched.length) {
      await supabase
        .from("flashcards")
        .update({ box: "1", due_on: today(), refreshed_for_exam_id: exam.id })
        .in(
          "id",
          benched.map((c) => c.id),
        );
    }
  }
}

/** Manually lowering a rating counts as a reactivation signal. */
export async function rateSubtopic(subtopicId: string, confidence: number | null) {
  const { error } = await supabase.from("plan_subtopics").update({ confidence }).eq("id", subtopicId);
  if (error) throw error;
}

export async function addSubtopic(planTopicId: string, name: string, position: number) {
  const { error } = await supabase
    .from("plan_subtopics")
    .insert({ plan_topic_id: planTopicId, name, position });
  if (error) throw error;
}

export async function removeSubtopic(id: string) {
  const { error } = await supabase.from("plan_subtopics").delete().eq("id", id);
  if (error) throw error;
}

export async function rateTopic(topicId: string, confidence: number | null) {
  const { error } = await supabase.from("plan_topics").update({ confidence }).eq("id", topicId);
  if (error) throw error;
}
