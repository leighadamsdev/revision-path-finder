/**
 * Confidence traffic lights: 1–2 red, 3–4 amber, 5 green.
 * Static class strings so Tailwind can see them.
 */

export type ConfidenceTone = {
  fill: string;
  ring: string;
  text: string;
  tag: string;
};

const BLANK: ConfidenceTone = {
  fill: "bg-border",
  ring: "ring-border",
  text: "text-muted-foreground",
  tag: "bg-muted text-muted-foreground",
};

const LOW: ConfidenceTone = {
  fill: "bg-conf-low",
  ring: "ring-conf-low/50",
  text: "text-conf-low",
  tag: "bg-conf-low/15 text-conf-low",
};

const MID: ConfidenceTone = {
  fill: "bg-conf-mid",
  ring: "ring-conf-mid/50",
  text: "text-conf-mid",
  tag: "bg-conf-mid/15 text-conf-mid",
};

const HIGH: ConfidenceTone = {
  fill: "bg-conf-high",
  ring: "ring-conf-high/50",
  text: "text-conf-high",
  tag: "bg-conf-high/10 text-conf-high",
};

export function confidenceTone(value: number | null | undefined): ConfidenceTone {
  if (value == null) return BLANK;
  if (value <= 2) return LOW;
  if (value <= 4) return MID;
  return HIGH;
}

/** Mean of whatever ratings exist, to one decimal place. Null when nothing is rated. */
export function averageConfidence(values: Array<number | null | undefined>): number | null {
  const rated = values.filter((value): value is number => typeof value === "number");
  if (rated.length === 0) return null;
  const mean = rated.reduce((sum, value) => sum + value, 0) / rated.length;
  return Math.round(mean * 10) / 10;
}

export type Band = "red" | "amber" | "green" | "unrated";

export function confidenceBand(value: number | null | undefined): Band {
  if (value == null) return "unrated";
  if (value <= 2) return "red";
  if (value <= 4) return "amber";
  return "green";
}

export const BAND_LABEL: Record<Band, string> = {
  red: "Red",
  amber: "Amber",
  green: "Green",
  unrated: "Not rated",
};
