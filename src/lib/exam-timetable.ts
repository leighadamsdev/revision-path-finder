import {
  EXAM_SERIES,
  EXAM_TIMETABLE,
  PROVISIONAL_BOARDS,
  TIMETABLE_BOARDS,
  type TimetableBoard,
  type TimetablePaper,
} from "./exam-timetable-data";
import { MAX_EXAM_DATES } from "./exam-dates";

export { EXAM_SERIES, TIMETABLE_BOARDS, type TimetableBoard, type TimetablePaper };

/** Reads any way a student might write a board ("Edexcel", "Pearson", "Eduqas"…) as one of ours. */
export function timetableBoard(board: string | null | undefined): TimetableBoard | null {
  const b = (board ?? "").trim().toLowerCase();
  if (!b) return null;
  if (b.includes("aqa")) return "AQA";
  if (b.includes("edexcel") || b.includes("pearson")) return "Edexcel (Pearson)";
  if (b.includes("eduqas") || b.includes("wjec")) return "WJEC / Eduqas";
  return null;
}

/** Short board name for labels. */
export function boardShortName(board: TimetableBoard): string {
  return board === "Edexcel (Pearson)" ? "Edexcel" : board === "WJEC / Eduqas" ? "Eduqas" : board;
}

export function isProvisional(board: TimetableBoard): boolean {
  return PROVISIONAL_BOARDS.includes(board);
}

/** The most commonly taken specification comes first, so it's the default. */
const COMMON_FIRST = ["", "Trilogy", "Religious Studies A", "Geography A", "Route A"];

function entriesFor(subject: string, board: TimetableBoard) {
  const name = subject.trim().toLowerCase();
  const rank = (v: string) => {
    const i = COMMON_FIRST.indexOf(v);
    return i < 0 ? COMMON_FIRST.length : i;
  };
  return EXAM_TIMETABLE.filter((e) => e.board === board && e.subject.toLowerCase() === name).sort(
    (a, b) => rank(a.variant) - rank(b.variant),
  );
}

/** Boards that publish this subject's exams in the timetable. */
export function boardsWithExams(subject: string): TimetableBoard[] {
  return TIMETABLE_BOARDS.filter((b) => entriesFor(subject, b).length > 0);
}

/** The specifications a board offers for a subject, e.g. ["", "English Language 2.0"]; "" is the main one. */
export function timetableVariants(subject: string, board: TimetableBoard): string[] {
  return entriesFor(subject, board).map((e) => e.variant);
}

/** Display name for a specification option. */
export function variantLabel(variant: string): string {
  return variant || "Main specification";
}

export type TimetableExam = TimetablePaper & { board: TimetableBoard; variant: string };

/**
 * The papers a student sits for a subject with a board, optionally narrowed to one tier
 * ("Foundation"/"Higher") and one specification. With no tier, papers sat by both tiers at
 * the same time are shown once.
 */
export function timetableExams(
  subject: string,
  board: TimetableBoard | null,
  tier?: string | null,
  variant?: string | null,
): TimetableExam[] {
  if (!board) return [];
  const entries = entriesFor(subject, board);
  const entry = entries.find((e) => e.variant === (variant ?? "")) ?? entries[0];
  if (!entry) return [];
  const t = (tier ?? "").toLowerCase();
  const wanted = t.includes("found") ? "F" : t.includes("high") ? "H" : null;
  const out: TimetableExam[] = [];
  for (const p of entry.papers) {
    if (wanted && p.tier && p.tier !== wanted) continue;
    if (!wanted && p.tier) {
      // Unknown tier: keep one copy of a paper both tiers sit at the same time.
      const twin = out.find(
        (o) => o.date === p.date && o.session === p.session && o.paper === p.paper,
      );
      if (twin) {
        delete twin.tier;
        if (twin.duration !== p.duration)
          twin.duration = `${twin.duration} (Foundation) / ${p.duration} (Higher)`;
        continue;
      }
    }
    out.push({ ...p, board, variant: entry.variant });
  }
  return out.sort((a, b) => (a.date + a.session).localeCompare(b.date + b.session));
}

/** "9:00am" or "1:30pm". */
export function sessionTime(session: "am" | "pm"): string {
  return session === "am" ? "9:00am" : "1:30pm";
}

/** "Paper 1 (non-calculator) · Higher" style label for one exam. */
export function examLabel(exam: TimetableExam): string {
  const tier = exam.tier === "F" ? "Foundation" : exam.tier === "H" ? "Higher" : "";
  return [exam.paper, tier].filter(Boolean).join(" · ");
}

/**
 * Plans keep up to three exam dates per subject for scheduling and the countdown. When a
 * subject has more papers, keep the first, the middle and the last so the plan still knows
 * when exams start and finish.
 */
export function planningDates(dates: string[]): string[] {
  const unique = [...new Set(dates.filter(Boolean))].sort();
  if (unique.length <= MAX_EXAM_DATES) return unique;
  return [unique[0]!, unique[Math.floor((unique.length - 1) / 2)]!, unique[unique.length - 1]!];
}

/** Source note shown under auto-added exams. */
export function timetableSource(board: TimetableBoard): string {
  return `${boardShortName(board)} ${EXAM_SERIES} timetable${isProvisional(board) ? " (provisional, so check with your school)" : ""}`;
}
