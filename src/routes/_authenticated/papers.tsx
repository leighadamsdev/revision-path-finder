import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { useActivePlan, usePlanSubjects } from "@/hooks/useActivePlan";
import { supabase } from "@/integrations/supabase/client";
import { subjectStyle } from "@/lib/subjects";

export const Route = createFileRoute("/_authenticated/papers")({
  head: () => ({
    meta: [
      { title: "Past papers — RevisionPath" },
      {
        name: "description",
        content:
          "Spec codes, official past-paper portals and free topic question banks for every subject in your revision plan.",
      },
      { property: "og:title", content: "Past papers — RevisionPath" },
      {
        property: "og:description",
        content: "Official past papers and free question banks for your subjects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PapersPage,
});

type PaperRow = {
  id: string;
  subject_id: string;
  spec_code: string;
  official_portal_url: string;
  free_resource_url: string;
  free_resource_name: string;
};

function PapersPage() {
  const { plan } = useActivePlan();
  const subjects = usePlanSubjects(plan?.id).data ?? [];
  const ids = subjects.map((s) => s.id);

  const papers = useQuery({
    queryKey: ["past-papers", ids.join(",")],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("past_papers")
        .select("id, subject_id, spec_code, official_portal_url, free_resource_url, free_resource_name")
        .in("subject_id", ids);
      if (error) throw error;
      return (data ?? []) as PaperRow[];
    },
  });

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold tracking-tight">Past papers</h1>
      <p className="mt-1 text-[13px] font-medium text-muted-foreground">
        One row per subject in your plan — the official portal plus a free question bank.
      </p>

      <div className="mt-5 space-y-3">
        {subjects.map((subject) => {
          const row = papers.data?.find((p) => p.subject_id === subject.id);
          const style = subjectStyle(subject.color_key);
          return (
            <div key={subject.id} className="rounded-[16px] bg-card p-4 ring-1 ring-black/5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${style.tag}`}
                >
                  <span className={`size-1.5 rounded-full ${style.dot}`} />
                  {subject.name} · {subject.exam_board}
                </span>
                {row ? (
                  <span className="ml-auto text-[11px] font-bold text-muted-foreground">
                    Spec {row.spec_code}
                  </span>
                ) : null}
              </div>

              {row ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={row.official_portal_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-2 text-[13px] font-bold ring-1 ring-border"
                  >
                    Official past papers
                    <ExternalLink className="size-3.5" strokeWidth={2.5} />
                  </a>
                  <a
                    href={row.free_resource_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-2 text-[13px] font-bold ring-1 ring-border"
                  >
                    {row.free_resource_name}
                    <ExternalLink className="size-3.5" strokeWidth={2.5} />
                  </a>
                </div>
              ) : (
                <p className="mt-3 text-[13px] font-medium text-muted-foreground">
                  We don't have links for this subject and board yet. Your teacher's exam-board page
                  is the safest place to start.
                </p>
              )}
            </div>
          );
        })}
        {subjects.length === 0 ? (
          <p className="text-[13px] font-medium text-muted-foreground">
            Add subjects to your plan and they'll show up here.
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
