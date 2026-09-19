export type SubjectStyle = {
  tag: string;
  dot: string;
  fill: string;
  ring: string;
  text: string;
  soft: string;
};

// Static class strings so Tailwind can see them. One consistent colour per subject.
const STYLES: Record<string, SubjectStyle> = {
  maths: {
    tag: "bg-maths/10 text-maths",
    dot: "bg-maths",
    fill: "bg-maths",
    ring: "ring-maths/40",
    text: "text-maths",
    soft: "bg-maths/10",
  },
  eng: {
    tag: "bg-eng/10 text-eng",
    dot: "bg-eng",
    fill: "bg-eng",
    ring: "ring-eng/40",
    text: "text-eng",
    soft: "bg-eng/10",
  },
  lit: {
    tag: "bg-lit/10 text-lit",
    dot: "bg-lit",
    fill: "bg-lit",
    ring: "ring-lit/40",
    text: "text-lit",
    soft: "bg-lit/10",
  },
  sci: {
    tag: "bg-sci/10 text-sci",
    dot: "bg-sci",
    fill: "bg-sci",
    ring: "ring-sci/40",
    text: "text-sci",
    soft: "bg-sci/10",
  },
  chem: {
    tag: "bg-chem/10 text-chem",
    dot: "bg-chem",
    fill: "bg-chem",
    ring: "ring-chem/40",
    text: "text-chem",
    soft: "bg-chem/10",
  },
  phys: {
    tag: "bg-phys/10 text-phys",
    dot: "bg-phys",
    fill: "bg-phys",
    ring: "ring-phys/40",
    text: "text-phys",
    soft: "bg-phys/10",
  },
  hist: {
    tag: "bg-hist/10 text-hist",
    dot: "bg-hist",
    fill: "bg-hist",
    ring: "ring-hist/40",
    text: "text-hist",
    soft: "bg-hist/10",
  },
  biz: {
    tag: "bg-biz/10 text-biz",
    dot: "bg-biz",
    fill: "bg-biz",
    ring: "ring-biz/40",
    text: "text-biz",
    soft: "bg-biz/10",
  },
  media: {
    tag: "bg-media/10 text-media",
    dot: "bg-media",
    fill: "bg-media",
    ring: "ring-media/40",
    text: "text-media",
    soft: "bg-media/10",
  },
  pe: {
    tag: "bg-pe/10 text-pe",
    dot: "bg-pe",
    fill: "bg-pe",
    ring: "ring-pe/40",
    text: "text-pe",
    soft: "bg-pe/10",
  },
};

export function subjectStyle(colorKey: string | null | undefined): SubjectStyle {
  return STYLES[colorKey ?? "media"] ?? STYLES["media"]!;
}

export const EXAM_BOARDS = ["AQA", "Edexcel", "OCR", "WJEC Eduqas"] as const;

export const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const SESSION_LENGTHS = [30, 45, 60, 90] as const;

export function subjectLabel(name: string, board: string) {
  return `${name} · ${board}`;
}
