import { BAND_LABEL, confidenceBand, confidenceTone } from "@/lib/confidence";

/** Red / Amber / Green chip for a confidence rating. */
export function BandChip({ value }: { value: number | null | undefined }) {
  const tone = confidenceTone(value);
  const band = confidenceBand(value);
  return (
    <span
      title={value ? `${BAND_LABEL[band]} confidence` : "Not rated yet"}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${tone.tag}`}
    >
      <span className={`size-2 rounded-full ${tone.fill}`} />
      {band === "unrated" ? BAND_LABEL[band] : BAND_LABEL[band]}
    </span>
  );
}

/** One-line key explaining the colours. */
export function BandLegend() {
  return (
    <p className="text-[11px] font-semibold leading-relaxed text-muted-foreground">
      Red, amber or green.{" "}
      <span className="text-conf-low">Red</span> = find it hard ·{" "}
      <span className="text-conf-mid">Amber</span> = some of it ·{" "}
      <span className="text-conf-high">Green</span> = know it well
    </p>
  );
}
