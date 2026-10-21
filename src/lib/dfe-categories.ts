import { subjectUnits } from "./gcse-topics";

const STOP = new Set(["and", "the", "of", "in", "to", "a", "an", "for", "with", "on", "by", "or", "its", "their", "how", "what", "paper", "section", "topic", "unit"]);

function words(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w))
      .map((w) => w.replace(/(ies|es|s)$/, "")),
  );
}

export const OTHER_CATEGORY = "Other topics";

/** Groups a subject's topics under the DfE checklist categories, in DfE order; unmatched topics go last under "Other topics". */
export function groupByDfeCategory<T extends { title: string; items: { title: string }[] }>(
  subjectName: string,
  topics: T[],
): { category: string; topics: T[] }[] {
  const units = subjectUnits(subjectName);
  if (!units.length) return topics.length ? [{ category: OTHER_CATEGORY, topics }] : [];
  const unitWords = units.map((u) => ({
    title: words(u.unit),
    all: words([u.unit, ...u.elements.map((e) => e.label)].join(" ")),
  }));
  const buckets = new Map<number, T[]>();
  for (const t of topics) {
    const tw = words([t.title, ...t.items.map((i) => i.title)].join(" "));
    let best = -1;
    let bestScore = 0;
    unitWords.forEach((u, i) => {
      if (units[i].unit.toLowerCase() === t.title.trim().toLowerCase()) { best = i; bestScore = Infinity; return; }
      let score = 0;
      for (const w of tw) { if (u.title.has(w)) score += 3; else if (u.all.has(w)) score += 1; }
      if (score > bestScore) { bestScore = score; best = i; }
    });
    const k = bestScore >= 2 ? best : -1;
    buckets.set(k, [...(buckets.get(k) ?? []), t]);
  }
  const out = units.flatMap((u, i) => (buckets.get(i) ? [{ category: u.unit, topics: buckets.get(i)! }] : []));
  if (buckets.get(-1)) out.push({ category: OTHER_CATEGORY, topics: buckets.get(-1)! });
  return out;
}
