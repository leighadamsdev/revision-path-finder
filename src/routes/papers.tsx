import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ExternalLink } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { PublicHeader } from "@/components/PublicHeader";
import { useAuth } from "@/hooks/useAuth";
import { useActivePlan, usePlanSubjects } from "@/hooks/useActivePlan";
import { catalogueSubject } from "@/lib/gcse-subjects";
import { KIND_LABELS, allPaperSubjects, papersByBoard } from "@/lib/past-paper-files";
import { subjectStyle } from "@/lib/subjects";

export const Route = createFileRoute("/papers")({
  head: () => ({
    meta: [
      { title: "Past papers — RevPlan" },
      {
        name: "description",
        content:
          "Question papers and mark schemes for every GCSE subject, grouped by exam board, newest exams first.",
      },
      { property: "og:title", content: "Past papers — RevPlan" },
      {
        property: "og:description",
        content: "Question papers and mark schemes for your subjects, in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PapersPage,
});

function PapersPage() {
  const { user } = useAuth();
  const { plan } = useActivePlan();
  const planSubjects = usePlanSubjects(plan?.id).data ?? [];
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (name: string) => setCollapsed((prev) => ({ ...prev, [name]: !prev[name] }));
  const names = allPaperSubjects();
  const ownNames = names.filter((name) =>
    planSubjects.some((subject) => subject.name.toLowerCase() === name.toLowerCase()),
  );
  const sections = ownNames.length
    ? [{ title: "Your subjects", names: ownNames }, { title: "All subjects", names }]
    : [{ title: null, names }];

  const content = (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight">Past papers</h1>
      <p className="mt-1 text-[13px] font-medium text-muted-foreground">
        Question papers and mark schemes for every subject, most recent exams first.
      </p>

      <div className="mt-6 space-y-8">
        {sections.map((section) => (
          <section key={section.title ?? "papers"}>
            {section.title ? <h2 className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{section.title}</h2> : null}
            <div className="space-y-3">
        {section.names.map((name) => {
          const mine = planSubjects.find((s) => s.name.toLowerCase() === name.toLowerCase());
          const tier = mine?.tier ?? null;
          const boardGroups = papersByBoard(name, tier);
          const style = subjectStyle(mine?.color_key ?? catalogueSubject(name)?.colorKey);
          const isCollapsed = collapsed[name] ?? true;

          return (
            <div key={name} className="rounded-[16px] bg-card p-4 ring-1 ring-black/5">
              <button
                type="button"
                onClick={() => toggle(name)}
                aria-expanded={!isCollapsed}
                className="flex w-full items-center justify-between gap-2 text-left"
              >
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${style.tag}`}
                >
                  <span className={`size-1.5 rounded-full ${style.dot}`} />
                  {name}
                  {tier ? ` · ${tier}` : ""}
                </span>
                <ChevronDown
                  strokeWidth={2.5}
                  className={`size-4 shrink-0 text-muted-foreground transition-transform ${isCollapsed ? "" : "rotate-180"}`}
                />
              </button>

              {!isCollapsed ? (
                boardGroups.length > 0 ? (
                  <div className="mt-3 space-y-5">
                    {boardGroups.map((group) => (
                      <div key={group.board}>
                        <p className="text-[12px] font-extrabold tracking-tight">{group.board}</p>
                        <div className="mt-2 space-y-4">
                          {group.series.map((series) => (
                            <div key={series.seriesKey}>
                              <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                                {series.series}
                              </p>
                              <div className="mt-2 space-y-2">
                                {series.papers.map((paper) => (
                                  <div
                                    key={paper.label}
                                    className="rounded-[12px] bg-background px-3 py-2.5 ring-1 ring-border"
                                  >
                                    <p className="text-[13px] font-bold">{paper.label}</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {paper.files.map((file) => (
                                        <a
                                          key={file.url}
                                          href={file.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-extrabold text-primary-foreground"
                                        >
                                          {KIND_LABELS[file.kind]}
                                          <ExternalLink className="size-3" strokeWidth={2.5} />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-[13px] font-medium text-muted-foreground">
                    No papers here for this subject yet — we're adding more.
                  </p>
                )
              ) : null}
            </div>
          );
        })}
            </div>
          </section>
        ))}
        {names.length === 0 ? (
          <p className="text-[13px] font-medium text-muted-foreground">
            No papers yet — we're adding more.
          </p>
        ) : null}
      </div>
    </>
  );

  return user ? (
    <AppShell>{content}</AppShell>
  ) : (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-5 pb-20 pt-8">{content}</main>
    </div>
  );
}
