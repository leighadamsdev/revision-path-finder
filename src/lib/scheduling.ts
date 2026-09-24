import { differenceInCalendarDays, parseISO } from "date-fns";

/**
 * Prioritisation engine.
 *  - weakness weight from the confidence band (red highest)
 *  - urgency multiplier per exam: 1.0 beyond 28 days, rising linearly to 4.0 on exam day
 *  - score = weakness × urgency, then subjects share each week with a floor and a cap
 */

export type TopicWeighting = { topic: string; confidence: number | null };

export type SubjectWeighting = {
  subjectId: string;
  /** Exam dates (yyyy-MM-dd), oldest first. */
  examDates?: string[];
  confidence?: number | null;
  /** Per-topic (or subtopic) ratings. When present these replace the subject-level rating. */
  topics?: TopicWeighting[];
};

export const URGENCY_WINDOW_DAYS = 28;
export const URGENCY_MAX = 4;
export const PIN_WINDOW_DAYS = 3;
export const SUBJECT_CAP_SHARE = 0.45;

/** Flat 1.0 beyond 28 days, linear up to 4.0 on the day. 0 once the exam has passed. */
export function urgencyMultiplier(daysLeft: number) {
  if (daysLeft < 0) return 0;
  if (daysLeft >= URGENCY_WINDOW_DAYS) return 1;
  return 1 + ((URGENCY_MAX - 1) * (URGENCY_WINDOW_DAYS - daysLeft)) / URGENCY_WINDOW_DAYS;
}

/** Red 3, amber 2, green 0.5. Unrated counts as amber. */
export function weaknessWeight(confidence: number | null | undefined) {
  if (confidence == null) return 2;
  if (confidence <= 2) return 3;
  if (confidence <= 4) return 2;
  return 0.5;
}

export function priorityScore(confidence: number | null | undefined, daysLeft: number | null) {
  return weaknessWeight(confidence) * (daysLeft == null ? 1 : urgencyMultiplier(daysLeft));
}

/** Kept for older callers: 1 (shaky) gets 1.5× the sessions of a 3; 5 gets half. */
export function confidenceWeight(confidence: number | null | undefined) {
  if (confidence == null) return 1;
  const clamped = Math.min(5, Math.max(1, confidence));
  return 1 + (3 - clamped) * 0.25;
}

function ratedTopics(subject: SubjectWeighting) {
  return (subject.topics ?? []).filter((topic) => topic.confidence != null);
}

/** Mean weakness across the subject's topics, or its own rating. */
export function subjectWeakness(subject: SubjectWeighting) {
  const rated = ratedTopics(subject);
  if (rated.length) {
    return rated.reduce((sum, t) => sum + weaknessWeight(t.confidence), 0) / rated.length;
  }
  return weaknessWeight(subject.confidence);
}

/** Every rating is a 5. */
export function isFullyGreen(subject: SubjectWeighting) {
  const rated = ratedTopics(subject);
  if (rated.length) return rated.every((t) => (t.confidence ?? 0) >= 5);
  return (subject.confidence ?? 0) >= 5;
}

export function subjectConfidenceWeight(subject: SubjectWeighting) {
  return subjectWeakness(subject);
}

/** Which week of the plan a date falls in (1-based), or null if it isn't readable. */
export function weekOfPlan(startDate: string | null | undefined, date: string | null | undefined) {
  if (!startDate || !date) return null;
  const start = parseISO(startDate);
  const target = parseISO(date);
  if (Number.isNaN(start.getTime()) || Number.isNaN(target.getTime())) return null;
  const days = differenceInCalendarDays(target, start);
  return Math.floor(days / 7) + 1;
}

/** Days from a reference date to the subject's next exam on or after it. */
export function daysToNextExam(examDates: string[] | null | undefined, from: Date) {
  const gaps = (examDates ?? [])
    .map((date) => differenceInCalendarDays(parseISO(date), from))
    .filter((gap) => Number.isFinite(gap) && gap >= 0)
    .sort((a, b) => a - b);
  return gaps[0] ?? null;
}

/**
 * Urgency for one plan week, measured from the middle of that week.
 * No exam dates = 1. Every exam sat = 0.
 */
export function examDateWeight(
  startDate: string | null | undefined,
  examDates: string[] | null | undefined,
  week: number,
) {
  if (!examDates?.length || !startDate) return 1;
  const start = parseISO(startDate);
  if (Number.isNaN(start.getTime())) return 1;
  const mid = new Date(start);
  mid.setDate(mid.getDate() + (week - 1) * 7 + 3);
  const gap = daysToNextExam(examDates, mid);
  if (gap == null) {
    // Exams may still fall in the first half of this week.
    const early = new Date(start);
    early.setDate(early.getDate() + (week - 1) * 7);
    const earlyGap = daysToNextExam(examDates, early);
    return earlyGap == null ? 0 : urgencyMultiplier(earlyGap);
  }
  return urgencyMultiplier(gap);
}

export function weekWeight(
  startDate: string | null | undefined,
  subject: SubjectWeighting,
  week: number,
) {
  return examDateWeight(startDate, subject.examDates, week) * subjectWeakness(subject);
}

/** Topics in the order they should be studied: priorities first, then shakiest first. */
export function orderTopics(
  topics: Array<{ topic: string; confidence: number | null; isPriority?: boolean }>,
) {
  return [...topics]
    .sort((a, b) => {
      const priority = Number(Boolean(b.isPriority)) - Number(Boolean(a.isPriority));
      if (priority !== 0) return priority;
      return weaknessWeight(b.confidence) - weaknessWeight(a.confidence);
    })
    .map((entry) => entry.topic);
}

/**
 * Hands out a week's slots in proportion to weight, carrying fractional leftovers.
 * Floor: every subject with a live exam that isn't fully green gets at least one slot.
 * Cap: no subject takes more than ~45% of the week (unless there are too few subjects).
 */
export function allocateWeek(
  subjects: SubjectWeighting[],
  slotCount: number,
  weights: number[],
  credit: Record<string, number>,
): string[] {
  const total = weights.reduce((sum, w) => sum + w, 0);
  const useEven = total <= 0;
  subjects.forEach((subject, i) => {
    const share = useEven ? 1 / subjects.length : (weights[i] ?? 0) / total;
    credit[subject.subjectId] = (credit[subject.subjectId] ?? 0) + share * slotCount;
  });

  const active = subjects.filter((_, i) => useEven || (weights[i] ?? 0) > 0);
  const cap = Math.max(
    Math.ceil(slotCount * SUBJECT_CAP_SHARE),
    Math.ceil(slotCount / Math.max(1, active.length)),
  );
  const used: Record<string, number> = {};
  const out: string[] = [];

  const floors = subjects.filter(
    (s, i) => (weights[i] ?? 0) > 0 && !isFullyGreen(s),
  );
  if (floors.length <= slotCount) {
    for (const subject of floors) {
      out.push(subject.subjectId);
      used[subject.subjectId] = 1;
      credit[subject.subjectId] = (credit[subject.subjectId] ?? 0) - 1;
    }
  }

  while (out.length < slotCount) {
    let best: string | null = null;
    let bestScore = -Infinity;
    for (const subject of subjects) {
      if ((used[subject.subjectId] ?? 0) >= cap) continue;
      const score = credit[subject.subjectId] ?? 0;
      if (score > bestScore) {
        bestScore = score;
        best = subject.subjectId;
      }
    }
    best ??= subjects[0]!.subjectId;
    credit[best] = (credit[best] ?? 0) - 1;
    used[best] = (used[best] ?? 0) + 1;
    out.push(best);
  }

  // Interleave so the same subject doesn't sit back to back where avoidable.
  return interleave(out);
}

function interleave(ids: string[]) {
  const counts = new Map<string, number>();
  ids.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
  const out: string[] = [];
  while (out.length < ids.length) {
    const sorted = [...counts.entries()].filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
    const pick = sorted.find(([id]) => id !== out[out.length - 1]) ?? sorted[0]!;
    out.push(pick[0]);
    counts.set(pick[0], pick[1] - 1);
  }
  return out;
}

/**
 * Hard override: on a day within 72 hours of a subject's exam, that subject takes the
 * day's first slot. Whatever was there slides one slot later rather than disappearing.
 */
export function pinUrgent(
  assigned: string[],
  pinFor: Array<string | null>,
): { ids: string[]; pinned: boolean[] } {
  const ids = [...assigned];
  const pinned = ids.map(() => false);
  for (let i = 0; i < ids.length; i += 1) {
    const target = pinFor[i];
    if (!target) continue;
    if (i > 0 && pinFor[i - 1] === target) continue; // only the first slot of the day
    if (ids[i] !== target) {
      const later = ids.findIndex((id, j) => j > i && id === target && !pinned[j]);
      if (later > -1) ids.splice(later, 1);
      else ids.pop();
      ids.splice(i, 0, target);
    }
    pinned[i] = true;
  }
  return { ids, pinned };
}
