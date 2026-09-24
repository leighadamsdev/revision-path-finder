import { differenceInCalendarDays, format, parseISO, startOfWeek } from "date-fns";

import { supabase } from "@/integrations/supabase/client";
import type { Flashcard, Subtopic } from "@/lib/leitner";
import type { PlanTopic, SessionRow } from "@/lib/plan";

const BAND_SCORE = (c: number | null) => (c == null ? 25 : c <= 2 ? 0 : c <= 4 ? 50 : 100);
const BOX_SCORE: Record<string, number> = { "1": 0, "2": 35, "3": 70, bench: 100 };

/** The ratings that count for a subject: subtopics where they exist, else topics. */
export function subjectRatings(subjectId: string, topics: PlanTopic[], subtopics: Subtopic[]) {
  const out: Array<number | null> = [];
  for (const topic of topics.filter((t) => t.subject_id === subjectId)) {
    const subs = subtopics.filter((s) => s.plan_topic_id === topic.id);
    if (subs.length) subs.forEach((s) => out.push(s.confidence));
    else out.push(topic.confidence);
  }
  return out;
}

/**
 * 0–100 mastery: 60% confidence bands, 40% how far flashcards have climbed.
 * With no cards yet the bands count for everything.
 */
export function masteryScore(
  subjectId: string,
  topics: PlanTopic[],
  subtopics: Subtopic[],
  cards: Flashcard[],
  fallbackConfidence: number | null = null,
) {
  const ratings = subjectRatings(subjectId, topics, subtopics);
  const bands = ratings.length
    ? ratings.reduce<number>((sum, c) => sum + BAND_SCORE(c), 0) / ratings.length
    : BAND_SCORE(fallbackConfidence);
  const own = cards.filter((c) => c.subject_id === subjectId);
  if (!own.length) return Math.round(bands);
  const boxes = own.reduce((sum, c) => sum + (BOX_SCORE[c.box] ?? 0), 0) / own.length;
  return Math.round(bands * 0.6 + boxes * 0.4);
}

export async function saveMasterySnapshot(planId: string, subjectId: string, score: number) {
  const week_start = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  await supabase
    .from("mastery_snapshots")
    .upsert({ plan_id: planId, subject_id: subjectId, week_start, score }, {
      onConflict: "plan_id,subject_id,week_start",
    });
}

/** Minutes a subject's weak ratings still need: red 40, amber 20 each. */
export function minutesNeeded(ratings: Array<number | null>) {
  return ratings.reduce<number>((sum, c) => sum + (c == null ? 20 : c <= 2 ? 40 : c <= 4 ? 20 : 0), 0);
}

/** Scheduled, uncompleted minutes for a subject from today up to its next exam. */
export function minutesScheduled(
  subjectId: string,
  sessions: SessionRow[],
  dateOf: (s: SessionRow) => Date | null,
  examDate: string | null,
  fallbackMinutes: number,
) {
  const now = new Date();
  const limit = examDate ? parseISO(examDate) : null;
  return sessions
    .filter((s) => s.subject_id === subjectId && !s.completed_at)
    .filter((s) => {
      const d = dateOf(s);
      if (!d) return false;
      if (differenceInCalendarDays(d, now) < 0) return false;
      return !limit || differenceInCalendarDays(limit, d) >= 0;
    })
    .reduce((sum, s) => sum + (s.length_minutes ?? fallbackMinutes), 0);
}
