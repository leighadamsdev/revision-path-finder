import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bot, ChevronDown } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { BandLegend } from "@/components/BandChip";
import { ConfidencePicker } from "@/components/ConfidencePicker";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivePlan, usePlanSubjects } from "@/hooks/useActivePlan";
import { useLibrary } from "@/hooks/useLibrary";
import { useTopicRatings } from "@/hooks/useTopicRatings";
import { GCSE_SUBJECTS, catalogueSubject } from "@/lib/gcse-subjects";
import { detailedTopicText, subjectUnits } from "@/lib/gcse-topics";
import { TOPIC_SUB_SEP, topicLines, withWholeTopicRatings, type LibSubject } from "@/lib/library";
import { specUnits } from "@/lib/spec-topics";
import { subjectStyle } from "@/lib/subjects";
import { ratingsAreLocalOnly } from "@/lib/topic-ratings";
import { saveTutorHandoff } from "@/lib/tutor-handoff";
import { usePremium } from "@/hooks/usePremium";
import { PremiumTag } from "@/components/PremiumGate";

export const Route = createFileRoute("/_authenticated/rate-topics")({
  head: () => ({
    meta: [
      { title: "Rate my topics — RevPlan" },
      {
        name: "description",
        content: "Rate every GCSE topic red, amber or green so you know what to revise first.",
      },
      { property: "og:title", content: "Rate my topics — RevPlan" },
      {
        property: "og:description",
        content: "Red, amber or green for every topic in every subject.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RateTopicsPage,
});

type ListKind = "library" | "spec" | "dfe";
const LIST_LABEL: Record<ListKind, string> = {
  library: "My topics",
  spec: "Exam board list",
  dfe: "DfE list",
};

/** One rateable topic: `key` is the text plans use for it, so ratings carry across. */
type RateRow = { key: string; label: string; detail?: string | undefined };
type RateGroup = { heading: string | null; rows: RateRow[] };

function listsFor(name: string, lib: LibSubject | undefined): ListKind[] {
  const out: ListKind[] = [];
  if (lib?.topics.length) out.push("library");
  if (specUnits(name).length) out.push("spec");
  if (subjectUnits(name).length) out.push("dfe");
  return out;
}

function groupsFor(name: string, kind: ListKind, lib: LibSubject | undefined): RateGroup[] {
  if (kind === "library") {
    // One row per sub-topic, grouped under its topic, so "Number" isn't rated as one block.
    return (lib?.topics ?? []).map((t) => ({
      heading: t.items.length ? t.title : null,
      rows: topicLines(t).map((line) => ({
        key: line,
        label: line.includes(TOPIC_SUB_SEP)
          ? line.slice(line.indexOf(TOPIC_SUB_SEP) + TOPIC_SUB_SEP.length)
          : line,
      })),
    }));
  }
  const units = kind === "spec" ? specUnits(name) : subjectUnits(name);
  return units.map((u) => ({
    heading: u.unit,
    rows: u.elements.map((e) => ({
      key: kind === "dfe" ? detailedTopicText(name, e.label) : e.label,
      label: e.label,
      detail: kind === "dfe" ? e.detail : undefined,
    })),
  }));
}

/** Every topic rated red for a subject, across all of its lists, once each. */
function redTopics(
  name: string,
  lib: LibSubject | undefined,
  mine: Record<string, number | null>,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const kind of listsFor(name, lib)) {
    for (const r of groupsFor(name, kind, lib).flatMap((g) => g.rows)) {
      const v = mine[r.key];
      const label = r.label.trim();
      if (!v || v > 2 || seen.has(label.toLowerCase())) continue;
      seen.add(label.toLowerCase());
      out.push(kind === "library" ? r.key : label);
    }
  }
  return out;
}

function RateTopicsPage() {
  const navigate = useNavigate();
  const library = useLibrary();
  const { plan } = useActivePlan();
  const planSubjectsData = usePlanSubjects(plan?.id).data;
  const { ratings, rate, isLoading } = useTopicRatings();
  const [extra, setExtra] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [list, setList] = useState<Record<string, ListKind>>({});

  /** My Subjects first, then plan subjects, then any the student adds here. */
  const names = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const n of [
      ...library.subjects.map((s) => s.name),
      ...(planSubjectsData ?? []).map((s) => s.name),
      ...extra,
    ]) {
      const k = n.trim().toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(n);
    }
    return out;
  }, [library.subjects, planSubjectsData, extra]);

  const addable = GCSE_SUBJECTS.filter(
    (s) => !names.some((n) => n.toLowerCase() === s.name.toLowerCase()),
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-extrabold tracking-tight">Rate my topics</h1>
        <p className="mt-1 text-[13px] font-medium text-muted-foreground">
          Rate how well you know each topic. Red topics get the most revision time when you build a
          plan, and your ratings carry into any plan you make.
        </p>
        <div className="mt-2">
          <BandLegend />
        </div>
        {ratingsAreLocalOnly() ? (
          <p className="mt-2 rounded-[8px] bg-secondary px-3 py-2 text-[12px] font-semibold">
            Your ratings are being saved on this device for now.
          </p>
        ) : null}

        <div className="mt-4 space-y-2">
          {library.isLoading || isLoading ? <Skeleton className="h-24 w-full" /> : null}
          {names.map((name) => {
            const lib = library.subjects.find(
              (s) => s.name.trim().toLowerCase() === name.trim().toLowerCase(),
            );
            const kinds = listsFor(name, lib);
            const kind = list[name] && kinds.includes(list[name]!) ? list[name]! : kinds[0];
            const groups = kind ? groupsFor(name, kind, lib) : [];
            const rows = groups.flatMap((g) => g.rows);
            const mine = withWholeTopicRatings(ratings[name] ?? {}, lib?.topics ?? []);
            const count = { red: 0, amber: 0, green: 0 };
            for (const r of rows) {
              const v = mine[r.key];
              if (!v) continue;
              if (v <= 2) count.red++;
              else if (v <= 4) count.amber++;
              else count.green++;
            }
            const rated = count.red + count.amber + count.green;
            const isOpen = open === name;
            const style = subjectStyle(catalogueSubject(name)?.colorKey);
            return (
              <div key={name} className="rounded-[12px] bg-card ring-1 ring-black/5">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : name)}
                  aria-expanded={isOpen}
                  className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left"
                >
                  <span className={`size-2 shrink-0 rounded-full ${style.dot}`} />
                  <span className="min-w-0 flex-1 text-sm font-extrabold">{name}</span>
                  <span className="flex items-center gap-2 text-[12px] font-bold tabular-nums">
                    <span className="text-conf-low">{count.red} red</span>
                    <span className="text-conf-mid">{count.amber} amber</span>
                    <span className="text-conf-high">{count.green} green</span>
                    <span className="text-muted-foreground">
                      {rated}/{rows.length} rated
                    </span>
                  </span>
                  <ChevronDown
                    className={`size-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen ? (
                  <div className="border-t border-border px-4 py-3">
                    <TutorFromReds
                      name={name}
                      reds={redTopics(name, lib, mine)}
                      onBuild={(reds) => {
                        saveTutorHandoff({
                          subject: name,
                          board: lib?.exam_board,
                          tier: lib?.qualification_level,
                          topics: reds.map((text) => ({ text, rating: 1 })),
                        });
                        void navigate({ to: "/ai-tutor" });
                      }}
                    />
                    {kinds.length > 1 ? (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {kinds.map((k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => setList((prev) => ({ ...prev, [name]: k }))}
                            className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${
                              k === kind
                                ? "bg-structure text-structure-foreground"
                                : "bg-background text-muted-foreground ring-1 ring-border"
                            }`}
                          >
                            {LIST_LABEL[k]}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {!rows.length ? (
                      <p className="text-[13px] font-medium text-muted-foreground">
                        There's no topic list for {name} yet.{" "}
                        <Link to="/topics" className="font-extrabold underline">
                          Add your topics
                        </Link>{" "}
                        to rate them.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {groups.map((g, gi) => (
                          <div key={g.heading ?? gi}>
                            {g.heading ? (
                              <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                                {g.heading}
                              </p>
                            ) : null}
                            <ul className="divide-y divide-border/60">
                              {g.rows.map((r) => (
                                <li
                                  key={r.key}
                                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[13px] font-bold">{r.label}</p>
                                    {r.detail ? (
                                      <p className="text-[12px] font-medium text-muted-foreground">
                                        {r.detail}
                                      </p>
                                    ) : null}
                                  </div>
                                  <ConfidencePicker
                                    size="sm"
                                    label={r.label}
                                    value={mine[r.key] ?? null}
                                    onChange={(v) => void rate(name, r.key, v)}
                                  />
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <label className="mt-4 flex flex-wrap items-center gap-2 text-[12px] font-bold text-muted-foreground">
          Rate another subject
          <select
            value=""
            onChange={(e) => {
              const v = e.target.value;
              if (v) {
                setExtra((prev) => [...prev, v]);
                setOpen(v);
              }
            }}
            className="rounded-[10px] bg-card px-3 py-2 text-[13px] font-semibold text-foreground ring-1 ring-border"
          >
            <option value="">Choose a subject…</option>
            {addable.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </AppShell>
  );
}

function TutorFromReds({
  name,
  reds,
  onBuild,
}: {
  name: string;
  reds: string[];
  onBuild: (reds: string[]) => void;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[10px] bg-background px-3 py-2.5 ring-1 ring-border">
      <Bot className="size-4 shrink-0 text-muted-foreground" />
      <p className="min-w-0 flex-1 text-[12px] font-semibold text-muted-foreground">
        {reds.length
          ? `Build an AI tutor that focuses on your ${reds.length} red ${name} topic${reds.length === 1 ? "" : "s"}.`
          : `Rate some ${name} topics red and you can build an AI tutor that focuses on them.`}
      </p>
      <button
        type="button"
        disabled={!reds.length}
        onClick={() => onBuild(reds)}
        className="rounded-full bg-structure px-3 py-1.5 text-[12px] font-bold text-structure-foreground disabled:opacity-40"
      >
        Build my AI tutor
      </button>
      <PremiumTagIfFree />
    </div>
  );
}

function PremiumTagIfFree() {
  const { isPremium, loading } = usePremium();
  return !loading && !isPremium ? <PremiumTag /> : null;
}
