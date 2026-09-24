import { BAND_LABEL, confidenceBand, confidenceTone, LIKERT } from "@/lib/confidence";

/** Red / Amber / Green chip for a 1–5 rating, with the Likert wording on hover. */
export function BandChip({ value }: { value: number | null | undefined }) {
  const tone = confidenceTone(value);
  const band = confidenceBand(value);
  return (
    <span
      title={value ? `${value}/5 — ${LIKERT[value]}` : "Not rated yet"}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${tone.tag}`}
    >
      <span className={`size-1.5 rounded-full ${tone.fill}`} />
      {BAND_LABEL[band]}
    </span>
  );
}

/** One-line key explaining the scale. */
export function LikertLegend() {
  return (
    <p className="text-[11px] font-semibold leading-relaxed text-muted-foreground">
      Rate 1 (not confident at all) to 5 (very confident).{" "}
      <span className="text-conf-low">1–2 red</span> ·{" "}
      <span className="text-conf-mid">3–4 amber</span> ·{" "}
      <span className="text-conf-high">5 green</span>
    </p>
  );
}
