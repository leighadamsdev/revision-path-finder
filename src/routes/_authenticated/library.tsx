import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LibraryManager } from "@/components/library/LibraryManager";
import { MultiSubjectPicker } from "@/components/library/MultiSubjectPicker";
import { useLibrary } from "@/hooks/useLibrary";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({
    meta: [
      { title: "My Subjects — RevPlan" },
      { name: "description", content: "Add and manage your GCSE subjects before adding topics to your revision library." },
      { property: "og:title", content: "My Subjects — RevPlan" },
      { property: "og:description", content: "Add and manage your GCSE subjects before adding topics to your revision library." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { subjects, isLoading, refresh } = useLibrary();
  const [adding, setAdding] = useState(false);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-extrabold tracking-tight">My Subjects</h1>
        <p className="mt-1 text-[13px] font-medium text-muted-foreground">
          Tick all your subjects at once and set their tiers here. Add topics for each subject on the next screen.
        </p>
        <div className="mt-4 rounded-[16px] bg-card p-4 ring-1 ring-black/5">
          {adding || (!isLoading && subjects.length === 0) ? (
            <MultiSubjectPicker
              existing={subjects}
              onDone={() => {
                setAdding(false);
                refresh();
              }}
              onCancel={subjects.length ? () => setAdding(false) : undefined}
            />
          ) : (
            <Button onClick={() => setAdding(true)}><Plus /> Add subjects</Button>
          )}
        </div>
        <div className="mt-4">
          {isLoading ? <Skeleton className="h-24 w-full" /> : subjects.length ? <LibraryManager subjects={subjects} refresh={refresh} mode="subjects" /> : (
            <p className="text-[13px] font-medium text-muted-foreground">No subjects yet. Tick your subjects above and add them all at once.</p>
          )}
        </div>
        {subjects.length ? <div className="mt-6 flex justify-end"><Button asChild><Link to="/topics">Continue to My Topics <ArrowRight /></Link></Button></div> : null}
      </div>
    </AppShell>
  );
}
