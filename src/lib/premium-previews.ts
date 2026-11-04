/**
 * Example pages for each Premium feature, at /premium/<slug>. Students without Premium
 * (and visitors) are sent here from the menus instead of to the locked feature.
 */
export const PREMIUM_PREVIEWS = [
  { slug: "knowledge-checker", path: "/knowledge-checker", title: "Knowledge Checker" },
  { slug: "exam-timetable", path: "/exams", title: "Exam timetable" },
  { slug: "revision-planner", path: "/plan", title: "Revision Planner" },
  { slug: "ai-tutor", path: "/ai-tutor", title: "Build my AI tutor" },
  { slug: "practice-questions", path: "/practice-questions", title: "Practice questions" },
] as const;

export type PreviewSlug = (typeof PREMIUM_PREVIEWS)[number]["slug"];

/** The example page for a Premium feature's path, if it has one. */
export function previewFor(path: string) {
  return PREMIUM_PREVIEWS.find((p) => p.path === path) ?? null;
}

/**
 * Where a menu link should go: the feature itself, or its example page when it's a
 * Premium feature and the student doesn't have Premium.
 */
export function navHref(path: string, premium: boolean | undefined, showPreview: boolean) {
  if (!premium || !showPreview) return path;
  const preview = previewFor(path);
  return preview ? `/premium/${preview.slug}` : path;
}
