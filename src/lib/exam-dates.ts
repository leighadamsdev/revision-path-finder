/** Helpers for the up-to-three exam dates a subject can have inside one plan. */

export const MAX_EXAM_DATES = 3;

export type ExamDateFields = {
  exam_date: string | null;
  exam_date_2?: string | null;
  exam_date_3?: string | null;
};

/** The subject's exam dates, oldest first, with blanks and duplicates removed. */
export function examDateList(row: ExamDateFields | null | undefined): string[] {
  if (!row) return [];
  const raw = [row.exam_date, row.exam_date_2 ?? null, row.exam_date_3 ?? null];
  const seen = new Set<string>();
  for (const value of raw) {
    if (value) seen.add(value);
  }
  return [...seen].sort();
}

/** Turns a list back into the three database columns. */
export function examDateColumns(dates: Array<string | null | undefined>) {
  const clean = [...new Set(dates.filter((d): d is string => Boolean(d)))].sort();
  return {
    exam_date: clean[0] ?? null,
    exam_date_2: clean[1] ?? null,
    exam_date_3: clean[2] ?? null,
  };
}

/** "Paper 1" style label when a subject has more than one exam. */
export function paperLabel(index: number, total: number) {
  return total > 1 ? `Paper ${index + 1}` : "Exam";
}
