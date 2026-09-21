import { differenceInCalendarDays, parseISO } from "date-fns";

/**
 * Session weighting. Two things pull a subject up the queue:
 *  - a low confidence rating (1–2 means "I need more of this")
 *  - an exam that is close (and nothing at all once every exam has been sat)
 */

export type SubjectWeighting = {
  subjectId: string;
  /** Up to three exam dates (yyyy-MM-dd), oldest first. */
  examDates?: string[];
  confidence?: number | null;
};

/** 1 (shaky) gets 1.5× the sessions of a 3; 5 (solid) gets half. */
export function confidenceWeight(confidence: number | null | undefined) {
  if (confidence == null) return 1;
  const clamped = Math.min(5, Math.max(1, confidence));
  return 1 + (3 - clamped) * 0.25;
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

/**
 * Ramps a subject up as its first exam approaches and drops it to zero once the last
 * of its exams has been sat. No exam dates means an even spread (weight 1 every week).
 */
export function examDateWeight(
  startDate: string | null | undefined,
  examDates: string[] | null | undefined,
  week: number,
) {
  const weeks = (examDates ?? [])
    .map((date) => weekOfPlan(startDate, date))
    .filter((value): value is number => value != null)
    .sort((a, b) => a - b);
  if (weeks.length === 0) return 1;

  const last = weeks[weeks.length - 1]!;
  if (week > last) return 0;

  const first = weeks[0]!;
  const span = Math.max(1, first - 1);
  const urgency = Math.min(1, Math.max(0, (week - 1) / span));
  return 0.7 + 1.1 * urgency;
}

export function weekWeight(
  startDate: string | null | undefined,
  subject: SubjectWeighting,
  week: number,
) {
  return examDateWeight(startDate, subject.examDates, week) * confidenceWeight(subject.confidence);
}

/**
 * Hands out each week's session slots between subjects in proportion to their weight,
 * carrying fractional leftovers into later weeks so nothing drifts.
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

  const out: string[] = [];
  for (let i = 0; i < slotCount; i += 1) {
    let best = subjects[0]!.subjectId;
    let bestScore = -Infinity;
    for (const subject of subjects) {
      const score = credit[subject.subjectId] ?? 0;
      if (score > bestScore) {
        bestScore = score;
        best = subject.subjectId;
      }
    }
    credit[best] = (credit[best] ?? 0) - 1;
    out.push(best);
  }
  return out;
}
