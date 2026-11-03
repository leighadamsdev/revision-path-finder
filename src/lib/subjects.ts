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
    tag: "bg-maths/15 text-maths",
    dot: "bg-maths",
    fill: "bg-maths",
    ring: "ring-maths/40",
    text: "text-maths",
    soft: "bg-maths/15",
  },
  eng: {
    tag: "bg-eng/15 text-eng",
    dot: "bg-eng",
    fill: "bg-eng",
    ring: "ring-eng/40",
    text: "text-eng",
    soft: "bg-eng/15",
  },
  lit: {
    tag: "bg-lit/15 text-lit",
    dot: "bg-lit",
    fill: "bg-lit",
    ring: "ring-lit/40",
    text: "text-lit",
    soft: "bg-lit/15",
  },
  sci: {
    tag: "bg-sci/15 text-sci",
    dot: "bg-sci",
    fill: "bg-sci",
    ring: "ring-sci/40",
    text: "text-sci",
    soft: "bg-sci/15",
  },
  chem: {
    tag: "bg-chem/15 text-chem",
    dot: "bg-chem",
    fill: "bg-chem",
    ring: "ring-chem/40",
    text: "text-chem",
    soft: "bg-chem/15",
  },
  phys: {
    tag: "bg-phys/15 text-phys",
    dot: "bg-phys",
    fill: "bg-phys",
    ring: "ring-phys/40",
    text: "text-phys",
    soft: "bg-phys/15",
  },
  hist: {
    tag: "bg-hist/15 text-hist",
    dot: "bg-hist",
    fill: "bg-hist",
    ring: "ring-hist/40",
    text: "text-hist",
    soft: "bg-hist/15",
  },
  biz: {
    tag: "bg-biz/15 text-biz",
    dot: "bg-biz",
    fill: "bg-biz",
    ring: "ring-biz/40",
    text: "text-biz",
    soft: "bg-biz/15",
  },
  media: {
    tag: "bg-media/15 text-media",
    dot: "bg-media",
    fill: "bg-media",
    ring: "ring-media/40",
    text: "text-media",
    soft: "bg-media/15",
  },
  pe: {
    tag: "bg-pe/15 text-pe",
    dot: "bg-pe",
    fill: "bg-pe",
    ring: "ring-pe/40",
    text: "text-pe",
    soft: "bg-pe/15",
  },
};

export function subjectStyle(colorKey: string | null | undefined): SubjectStyle {
  return STYLES[colorKey ?? "media"] ?? STYLES["media"]!;
}

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

