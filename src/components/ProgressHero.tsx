import { Link } from "@tanstack/react-router";
import { format, subDays } from "date-fns";
import { Flame } from "lucide-react";

import type { Activity } from "@/hooks/useActivity";

type Bands = { red: number; amber: number; green: number; unrated: number };

const RADIUS = 64;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 6;

/** Ring of red, amber and green topics (unrated as a faint track), "% green" in the middle. */
function RagRing({ bands }: { bands: Bands }) {
  const total = bands.red + bands.amber + bands.green + bands.unrated;
  const pct = total ? Math.round((bands.green / total) * 100) : 0;
  const parts = [
    { n: bands.red, color: "var(--color-conf-low)" },
    { n: bands.amber, color: "var(--color-conf-mid)" },
    { n: bands.green, color: "var(--color-conf-high)" },
  ].filter((p) => p.n > 0);
  const gaps = parts.length > 1 ? parts.length : 0;
  let offset = 0;
  const arcs = parts.map((p) => {
    const len = Math.max(0, (p.n / total) * CIRCUMFERENCE - (gaps ? GAP : 0));
    const arc = { ...p, len, offset };
    offset += (p.n / total) * CIRCUMFERENCE;
    return arc;
  });
  return (
    <div className="relative size-32 shrink-0 sm:size-36">
      <svg
        viewBox="0 0 160 160"
        className="size-full"
        role="img"
        aria-label={`${bands.red} red, ${bands.amber} amber, ${bands.green} green and ${bands.unrated} not rated topics`}
      >
        <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="var(--color-secondary)" strokeWidth="16" />
        <g transform="rotate(-90 80 80)" fill="none" strokeWidth="16" strokeLinecap="round">
          {arcs.map((a) => (
            <circle
              key={a.color}
              cx="80"
              cy="80"
              r={RADIUS}
              stroke={a.color}
              strokeDasharray={`${a.len} ${CIRCUMFERENCE}`}
              strokeDashoffset={-a.offset}
            />
          ))}
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-[family-name:var(--font-display)] text-3xl font-bold leading-none tabular-nums">
          {pct}%
        </span>
        <span className="text-[12px] font-bold text-muted-foreground">green</span>
      </div>
    </div>
  );
}

/** The signed-in home's headline: topic ring, streak and the last 7 days. */
export function ProgressHero({ bands, activity }: { bands: Bands; activity: Activity | undefined }) {
  const total = bands.red + bands.amber + bands.green + bands.unrated;
  const streak = activity?.streak ?? 0;
  const today = new Date();
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const key = format(d, "yyyy-MM-dd");
    return { key, label: i === 6 ? "Today" : format(d, "EEEEE"), long: format(d, "EEEE d MMMM"), active: activity?.days.has(key) ?? false, isToday: i === 6 };
  });

  return (
    <section aria-label="Your progress at a glance" className="mt-5 grid gap-3 sm:grid-cols-2">
      <Link
        to="/rate-topics"
        className="flex items-center gap-5 rounded-[20px] bg-card p-5 ring-1 ring-border transition-colors hover:ring-primary/50"
      >
        {total ? <RagRing bands={bands} /> : null}
        <div className="min-w-0 space-y-2 text-[14px] font-bold">
          {total ? (
            <>
              <Legend color="bg-conf-low" n={bands.red} label="red" />
              <Legend color="bg-conf-mid" n={bands.amber} label="amber" />
              <Legend color="bg-conf-high" n={bands.green} label="green" />
              {bands.unrated ? (
                <Legend color="ring-1 ring-muted-foreground/60" n={bands.unrated} label="not rated" />
              ) : null}
              {activity?.greenThisWeek ? (
                <p className="text-[13px] text-primary">+{activity.greenThisWeek} rated green this week</p>
              ) : (
                <p className="text-[13px] text-muted-foreground">Turn a topic green this week</p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">Add and rate your topics to see your colours here.</p>
          )}
        </div>
      </Link>

      <div className="rounded-[20px] bg-card p-5 ring-1 ring-border">
        <div className="flex items-center gap-3">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-full ${streak ? "bg-conf-mid/15 text-conf-mid" : "bg-secondary text-muted-foreground"}`}
          >
            <Flame className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight">
              {streak ? `${streak}-day streak` : "Start a streak"}
            </p>
            <p className="text-[13px] font-medium text-muted-foreground">
              {streak && activity?.today
                ? "You've revised today. Nice."
                : streak
                  ? "Do something today to keep it going."
                  : "Tick off a session, rate a topic or test yourself today."}
            </p>
          </div>
        </div>
        <ol className="mt-4 grid grid-cols-7 gap-1.5" aria-label="The last 7 days">
          {week.map((d) => (
            <li key={d.key} className="flex flex-col items-center gap-1.5">
              <span
                className={`h-9 w-full rounded-[10px] ${
                  d.active
                    ? "bg-primary"
                    : d.isToday
                      ? "border-2 border-dashed border-primary/70"
                      : "bg-secondary"
                }`}
                aria-hidden="true"
              />
              <span className={`text-[11px] font-bold ${d.isToday ? "text-foreground" : "text-muted-foreground"}`}>
                {d.label}
              </span>
              <span className="sr-only">
                {d.long}: {d.active ? "revised" : "no revision"}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Legend({ color, n, label }: { color: string; n: number; label: string }) {
  return (
    <p className="flex items-center gap-2">
      <span className={`size-2.5 shrink-0 rounded-full ${color}`} />
      <span className="tabular-nums">{n}</span> {label}
    </p>
  );
}
