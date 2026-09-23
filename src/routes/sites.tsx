import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ExternalLink } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { REVISION_LINK_GROUPS } from "@/lib/revision-sites";
import { subjectStyle } from "@/lib/subjects";

export const Route = createFileRoute("/sites")({
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

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold tracking-tight">Revision links</h1>
      <p className="mt-1 text-[13px] font-medium text-muted-foreground">
        Free, currently-active resources for every GCSE subject.
      </p>

      <div className="mt-6 space-y-8">
        {REVISION_LINK_GROUPS.map((group) => (
          <section key={group.label}>
            <h2 className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              {group.label}
            </h2>
            <div className="space-y-2">
              {group.subjects.map((subject) => {
                const style = subjectStyle(subject.colorKey);
                const rows = (sites.data ?? []).filter((site) => site.subject_name === subject.name);
                return (
                  <details key={subject.name} className="group rounded-[8px] bg-card ring-1 ring-border">
                    <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3">
                      <span className={`size-2 shrink-0 rounded-full ${style.dot}`} />
                      <span className="min-w-0 flex-1 text-[14px] font-extrabold">{subject.name}</span>
                      <span className="text-[11px] font-bold text-muted-foreground">
                        {rows.length} {rows.length === 1 ? "link" : "links"}
                      </span>
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="space-y-2 border-t border-border p-3">
                      {rows.map((row) => <SiteCard key={row.id} row={row} />)}
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        ))}
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
      className="block rounded-[8px] bg-secondary/40 p-4 ring-1 ring-border transition-colors hover:bg-secondary"
    >
      <div className="flex items-center gap-2">
        <p className="text-[15px] font-extrabold tracking-tight">{row.site_name}</p>
        <ExternalLink className="size-3.5 text-muted-foreground" strokeWidth={2.5} />
      </div>
      {row.description ? <p className="mt-1 text-[13px] font-medium leading-relaxed text-muted-foreground">{row.description}</p> : null}
    </a>
  );
}
