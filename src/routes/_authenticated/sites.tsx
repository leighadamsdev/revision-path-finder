import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ExternalLink } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { GCSE_SUBJECTS } from "@/lib/gcse-subjects";
import { subjectStyle } from "@/lib/subjects";

export const Route = createFileRoute("/_authenticated/sites")({
  head: () => ({
    meta: [
      { title: "Revision links — rev.plan" },
      {
        name: "description",
        content:
          "Free revision links and YouTube channels worth using, grouped across the full GCSE subject list.",
      },
      { property: "og:title", content: "Revision links — rev.plan" },
      {
        property: "og:description",
        content: "Free revision links and channels for your GCSE subjects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SitesPage,
});

type SiteRow = {
  id: string;
  subject_name: string | null;
  site_name: string;
  site_url: string;
  description: string;
};

function SitesPage() {
  const sites = useQuery({
    queryKey: ["revision-sites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revision_sites")
        .select("id, subject_name, site_name, site_url, description");
      if (error) throw error;
      return (data ?? []) as SiteRow[];
    },
  });

  const universal = (sites.data ?? []).filter((s) => !s.subject_name);
  const subjects = Array.from(new Map(GCSE_SUBJECTS.map((subject) => [subject.name, subject])).values());

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold tracking-tight">Revision links</h1>
      <p className="mt-1 text-[13px] font-medium text-muted-foreground">
        Free, currently-active resources for every GCSE subject.
      </p>

      <div className="mt-6 space-y-6">
        {subjects.map((subject) => {
          const style = subjectStyle(subject.colorKey);
          const rows = (sites.data ?? []).filter((s) => s.subject_name === subject.name);
          return (
            <details key={subject.name} className="group rounded-[8px] bg-card ring-1 ring-border">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3">
                <span className={`size-2 shrink-0 rounded-full ${style.dot}`} />
                <span className="min-w-0 flex-1 text-[14px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold text-muted-foreground">
                  {rows.length || "No links yet"}
                </span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-2 border-t border-border p-3">
                {rows.length > 0 ? rows.map((row) => <SiteCard key={row.id} row={row} />) : (
                  <p className="px-1 py-2 text-[13px] font-medium text-muted-foreground">
                    Resources for this subject will appear here when they are added.
                  </p>
                )}
              </div>
            </details>
          );
        })}

        <section>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            Useful for everything
          </p>
          <div className="mt-2 space-y-2">
            {universal.map((row) => (
              <SiteCard key={row.id} row={row} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function SiteCard({ row }: { row: SiteRow }) {
  return (
    <a
      href={row.site_url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-[14px] bg-card p-4 ring-1 ring-black/5"
    >
      <div className="flex items-center gap-2">
        <p className="text-[15px] font-extrabold tracking-tight">{row.site_name}</p>
        <ExternalLink className="size-3.5 text-muted-foreground" strokeWidth={2.5} />
      </div>
      <p className="mt-1 text-[13px] font-medium leading-relaxed text-muted-foreground">
        {row.description}
      </p>
    </a>
  );
}
