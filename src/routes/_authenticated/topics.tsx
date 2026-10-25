import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { LibraryManager } from "@/components/library/LibraryManager";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLibrary } from "@/hooks/useLibrary";

export const Route = createFileRoute("/_authenticated/topics")({
  head: () => ({
    meta: [
      { title: "My Topics — RevPlan" },
      { name: "description", content: "Add, import and edit the topics and content for your GCSE subjects." },
      { property: "og:title", content: "My Topics — RevPlan" },
      { property: "og:description", content: "Add, import and edit the topics and content for your GCSE subjects." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TopicsPage,
});

function TopicsPage() {
  const { subjects, isLoading, refresh } = useLibrary();
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-extrabold tracking-tight">My Topics</h1>
        <p className="mt-1 text-[13px] font-medium text-muted-foreground">Add or import topics under the subjects you study, then rate each one red, amber or green. Red topics get the most revision time. You can change them any time.</p>
        <div className="mt-4">
          {isLoading ? <Skeleton className="h-24 w-full" /> : subjects.length ? <LibraryManager subjects={subjects} refresh={refresh} mode="topics" /> : (
            <div className="space-y-3">
              <p className="text-[13px] font-medium text-muted-foreground">Add a subject first, then come back to add its topics.</p>
              <Button asChild><Link to="/library"><ArrowLeft /> Go to My Subjects</Link></Button>
            </div>
          )}
        </div>
        {subjects.length ? <div className="mt-6 flex justify-end"><Button asChild><Link to="/knowledge-checker">Continue to Knowledge Checker <ArrowRight /></Link></Button></div> : null}
      </div>
    </AppShell>
  );
}