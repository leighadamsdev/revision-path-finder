import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { useActivePlan, usePlanSubjects } from "@/hooks/useActivePlan";
import { supabase } from "@/integrations/supabase/client";
import { subjectStyle } from "@/lib/subjects";

export const Route = createFileRoute("/_authenticated/sites")({
  head: () => ({
    meta: [
      { title: "Revision sites — rev.plan" },
      {
        name: "description",
        content:
          "Free revision websites and YouTube channels worth using, grouped by the subjects in your own GCSE plan.",
      },
      { property: "og:title", content: "Revision sites — rev.plan" },
      {
        property: "og:description",
        content: "Free revision sites and channels for your GCSE subjects.",
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
  const { plan } = useActivePlan();
  const subjects = usePlanSubjects(plan?.id).data ?? [];
  const names = Array.from(new Set(subjects.map((s) => s.name)));

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

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold tracking-tight">Revision sites</h1>
      <p className="mt-1 text-[13px] font-medium text-muted-foreground">
        Free, currently-active resources — picked for the subjects in your plan.
      </p>

      <div className="mt-6 space-y-6">
        {names.map((name) => {
          const subject = subjects.find((s) => s.name === name)!;
          const style = subjectStyle(subject.color_key);
          const rows = (sites.data ?? []).filter((s) => s.subject_name === name);
          if (rows.length === 0) return null;
          return (
            <section key={name}>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${style.tag}`}
              >
                <span className={`size-1.5 rounded-full ${style.dot}`} />
                {name}
              </span>
              <div className="mt-2 space-y-2">
                {rows.map((row) => (
                  <SiteCard key={row.id} row={row} />
                ))}
              </div>
            </section>
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
