import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
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
      { title: "My Topic Library — rev.plan" },
      { name: "description", content: "Your subjects, Topics and content items for the Knowledge Checker and Revision Planner." },
      { property: "og:title", content: "My Topic Library — rev.plan" },
      { property: "og:description", content: "Manage the subjects and Topics you are studying." },
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
        <h1 className="text-xl font-extrabold tracking-tight">My Topic Library</h1>
        <p className="mt-1 text-[13px] font-medium text-muted-foreground">
          These subjects and Topics are the content for your Knowledge Checker and Revision Planner. Your revision priorities are still set the usual way.
        </p>
        <div className="mt-4 rounded-[16px] bg-card p-4 ring-1 ring-black/5">
          {adding ? (
            <div className="space-y-2">
              <SubjectFields value={value} onChange={setValue} />
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    if (!value.name.trim()) return toast.error("Subject name is required.");
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
          {isLoading ? <Skeleton className="h-24 w-full" /> : subjects.length ? <LibraryManager subjects={subjects} refresh={refresh} /> : (
            <p className="text-[13px] font-medium text-muted-foreground">No subjects yet — add one above.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
