import type { TutorTopic } from "@/lib/tutor-prompt";

/**
 * Hands a signed-in student's red topics to the free AI tutor page.
 * Kept in sessionStorage for one hop only, so the tutor page itself never needs an account.
 */
export type TutorHandoff = {
  subject: string;
  board?: string | null | undefined;
  tier?: string | null | undefined;
  topics: TutorTopic[];
};

const KEY = "revplan.aiTutor.handoff";

export function saveTutorHandoff(h: TutorHandoff) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(h));
  } catch {
    /* storage unavailable: the tutor page just opens blank */
  }
}

/** Reads the handoff once and clears it, so a refresh doesn't re-apply it. */
export function takeTutorHandoff(): TutorHandoff | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(KEY);
    const h = JSON.parse(raw) as TutorHandoff;
    return h && typeof h.subject === "string" && Array.isArray(h.topics) ? h : null;
  } catch {
    return null;
  }
}

/** Library tiers are stored as "GCSE Foundation" / "GCSE Higher"; the tutor form uses short names. */
export function tutorTier(level: string | null | undefined): string {
  const l = (level ?? "").toLowerCase();
  if (l.includes("foundation")) return "Foundation";
  if (l.includes("higher")) return "Higher";
  return "";
}
