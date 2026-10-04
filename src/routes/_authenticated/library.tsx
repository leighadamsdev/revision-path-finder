import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Plus } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LibraryManager, SubjectFields } from "@/components/library/LibraryManager";
import { useLibrary } from "@/hooks/useLibrary";
import { addSubject } from "@/lib/library";

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
  const [value, setValue] = useState({ name: "", exam_board: "", qualification_level: "" });

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-extrabold tracking-tight">My Subjects</h1>
        <p className="mt-1 text-[13px] font-medium text-muted-foreground">
          Add your subjects and tiers here. Add topics for each subject on the next screen.
        </p>
        <div className="mt-4 rounded-[16px] bg-card p-4 ring-1 ring-black/5">
          {adding ? (
            <div className="space-y-2">
              <SubjectFields value={value} onChange={setValue} />
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    if (!value.name.trim()) return void toast.error("Subject name is required.");
                    await addSubject(value);
                    setValue({ name: "", exam_board: "", qualification_level: "" });
                    setAdding(false);
                    refresh();
                  }}
                >
                  Save subject
                </Button>
                <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setAdding(true)}><Plus /> Add a subject</Button>
          )}
        </div>
        <div className="mt-4">
          {isLoading ? <Skeleton className="h-24 w-full" /> : subjects.length ? <LibraryManager subjects={subjects} refresh={refresh} mode="subjects" /> : (
            <p className="text-[13px] font-medium text-muted-foreground">No subjects yet — add one above.</p>
          )}
        </div>
        {subjects.length ? <div className="mt-6 flex justify-end"><Button asChild><Link to="/topics">Continue to My Topics <ArrowRight /></Link></Button></div> : null}
      </div>
    </AppShell>
  );
}
