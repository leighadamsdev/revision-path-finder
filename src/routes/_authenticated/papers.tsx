import { createFileRoute } from "@tanstack/react-router";
import { FileText, ClipboardCheck, ChevronDown, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { useActivePlan, usePlanSubjects } from "@/hooks/useActivePlan";
import { papersForSubject, papersByBoard, type PaperFile } from "@/lib/past-paper-files";
import { subjectStyle } from "@/lib/subjects";

export const Route = createFileRoute("/_authenticated/papers")({
  head: () => ({
    meta: [
      { title: "Past papers — rev.plan" },
      {
        name: "description",
        content:
          "Question papers and mark schemes for the subjects in your revision plan, ready to open right here.",
      },
      { property: "og:title", content: "Past papers — rev.plan" },
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

function PaperList({
  title,
  icon,
  files,
}: {
  title: string;
  icon: React.ReactNode;
  files: PaperFile[];
}) {
  if (files.length === 0) return null;

  async function downloadPaper(file: PaperFile) {
    try {
      const response = await fetch(file.url);
      if (!response.ok) throw new Error("Download failed");
      const blobUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = decodeURIComponent(file.url.split("/").pop() ?? `${file.paper}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1_000);
    } catch (error) {
      console.error(error);
      toast.error("That paper couldn't be downloaded. Please try again.");
    }
  }

  return (
    <div className="mt-3">
      <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </p>
      <div className="mt-2 space-y-2">
        {files.map((file) => (
          <div
            key={`${file.board}-${file.tier}-${file.series}-${file.kind}-${file.paper}`}
            className="flex items-center justify-between gap-3 rounded-[12px] bg-background px-3 py-2.5 text-[13px] font-bold ring-1 ring-border"
          >
            <span className="min-w-0">
              <span className="block truncate">{file.paper}</span>
              <span className="block text-[11px] font-bold text-muted-foreground">
                {file.tier ? `${file.tier} · ` : ""}
                {file.series}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <a
                href={file.url}
                className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-extrabold text-primary-foreground"
              >
                Open
              </a>
              <button
                type="button"
                onClick={() => void downloadPaper(file)}
                aria-label={`Download ${file.paper}`}
                className="rounded-full px-2 py-1.5 text-muted-foreground ring-1 ring-border"
              >
                <Download className="size-3.5" strokeWidth={2.5} />
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PapersPage() {
  const { plan } = useActivePlan();
  const subjects = usePlanSubjects(plan?.id).data ?? [];
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold tracking-tight">Past papers</h1>
      <p className="mt-1 text-[13px] font-medium text-muted-foreground">
        Question papers and mark schemes for your subjects — open them straight from here.
      </p>

      <div className="mt-5 space-y-3">
        {subjects.map((subject) => {
          const papers = papersForSubject(subject.name, subject.tier);
          const boardGroups = papersByBoard(subject.name, subject.tier);
          const style = subjectStyle(subject.color_key);
          const hasFiles = papers.questionPapers.length > 0 || papers.markSchemes.length > 0;
          const isCollapsed = collapsed[subject.id] ?? false;

          return (
            <div key={subject.id} className="rounded-[16px] bg-card p-4 ring-1 ring-black/5">
              <button
                type="button"
                onClick={() => toggle(subject.id)}
                aria-expanded={!isCollapsed}
                className="flex w-full items-center justify-between gap-2 text-left"
              >
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${style.tag}`}
                >
                  <span className={`size-1.5 rounded-full ${style.dot}`} />
                  {subject.name}
                  {subject.tier ? ` · ${subject.tier}` : ""}
                </span>
                <ChevronDown
                  strokeWidth={2.5}
                  className={`size-4 shrink-0 text-muted-foreground transition-transform ${isCollapsed ? "" : "rotate-180"}`}
                />
              </button>

              {!isCollapsed ? (
                hasFiles ? (
                  <div className="mt-2 space-y-4">
                    {boardGroups.map((group) => (
                      <div key={group.board}>
                        <p className="text-[12px] font-extrabold tracking-tight">
                          {group.board}
                        </p>
                        <PaperList
                          title="Question papers"
                          icon={<FileText className="size-3.5" strokeWidth={2.5} />}
                          files={group.questionPapers}
                        />
                        <PaperList
                          title="Mark schemes"
                          icon={<ClipboardCheck className="size-3.5" strokeWidth={2.5} />}
                          files={group.markSchemes}
                        />
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
        {subjects.length === 0 ? (
          <p className="text-[13px] font-medium text-muted-foreground">
            Add subjects to your plan and their papers will show up here.
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
