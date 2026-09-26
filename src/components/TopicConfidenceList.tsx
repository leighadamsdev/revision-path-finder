import { ConfidencePicker } from "@/components/ConfidencePicker";
import { confidenceTone } from "@/lib/confidence";

/** A 1–5 rating for every topic a student has chosen. */
export function TopicConfidenceList({
  topics,
  ratings,
  onChange,
}: {
  topics: string[];
  ratings: Record<string, number | null>;
  onChange: (topic: string, value: number | null) => void;
}) {
  if (!topics.length) return null;

  return (
    <div className="space-y-1">
      {topics.map((topic) => {
        const value = ratings[topic] ?? null;
        const tone = confidenceTone(value);
        return (
          <div
            key={topic}
            className={`flex flex-wrap items-center gap-2 rounded-[8px] border-l-4 bg-card px-2.5 py-2 ring-1 ring-border ${value == null ? "border-border" : value <= 2 ? "border-conf-low" : value <= 4 ? "border-conf-mid" : "border-conf-high"}`}
          >
            <span className="min-w-0 flex-1 text-[12px] font-bold leading-relaxed">{topic}</span>
            <span className={`text-[11px] font-extrabold ${tone.text}`}>
              {value ? `${value}/5 · ${value <= 2 ? "Red" : value <= 4 ? "Amber" : "Green"}` : "Not rated"}
            </span>
            <ConfidencePicker
              value={value}
              onChange={(next) => onChange(topic, next)}
              label={`${topic} confidence`}
              size="sm"
            />
          </div>
        );
      })}
    </div>
  );
}
