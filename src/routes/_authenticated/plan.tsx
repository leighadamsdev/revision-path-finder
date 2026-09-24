import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Link2,
  Pencil,
  Printer,
  Share2,
  Trash2,
  MoreHorizontal,
  X,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { ExamCountdown } from "@/components/ExamCountdown";
import { SessionCard } from "@/components/SessionCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useActivePlan,
  usePlanSessions,
  usePlanSubjects,
  usePlanTopics,
  useFlashcards,
  useSubtopics,
} from "@/hooks/useActivePlan";
import { FlashcardReview } from "@/components/FlashcardReview";
import { MasteryStrip } from "@/components/MasteryStrip";
import { PacePrompts } from "@/components/PacePrompts";
import { TopicsConfidencePanel } from "@/components/TopicsConfidencePanel";
import { planDayDate } from "@/lib/plan-dates";
import { isToday } from "date-fns";
import { averageConfidence, confidenceTone } from "@/lib/confidence";
import type { SessionRow } from "@/lib/plan";
import { deletePlan, disablePlanShare, enablePlanShare } from "@/lib/plan";
import { subjectStyle } from "@/lib/subjects";
import { planDayLabel, sortPlanDays } from "@/lib/plan-dates";

export const Route = createFileRoute("/_authenticated/plan")({
  head: () => ({
    meta: [
      { title: "Your timetable — rev.plan" },
      {
        name: "description",
        content:
          "Your week-by-week GCSE revision timetable: today's sessions, topics, exam countdown and gaps to revisit.",
      },
      { property: "og:title", content: "Your timetable — rev.plan" },
      {
        property: "og:description",
        content: "Your week-by-week GCSE revision timetable with an exam countdown.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TimetablePage,
});

function TimetablePage() {
  const { plan, plans, isLoading } = useActivePlan();
  const [week, setWeek] = useState(1);
  const [shareOpen, setShareOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const subjectsQuery = usePlanSubjects(plan?.id);
  const topicsQuery = usePlanTopics(plan?.id);
  const sessionsQuery = usePlanSessions(plan?.id);
  const cardsQuery = useFlashcards(plan?.id);
  const subtopicsQuery = useSubtopics(plan?.id);
  const cards = cardsQuery.data ?? [];
  const subtopics = subtopicsQuery.data ?? [];
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const subjects = subjectsQuery.data ?? [];
  const sessions = sessionsQuery.data ?? [];

  const weekSessions = useMemo(
    () => sessions.filter((s) => s.week_number === week),
    [sessions, week],
  );

  const days = plan ? sortPlanDays(plan.start_date, week, plan.study_days) : [];

  // Topic ratings decide the priority list; a subject-wide rating is the fallback.
  const topics = topicsQuery.data ?? [];
  const needsWork = subjects
    .map((subject) => {
      const own = topics.filter((topic) => topic.subject_id === subject.id);
      const rating = own.length
        ? averageConfidence(own.map((topic) => topic.confidence))
        : subject.confidence;
      return { ...subject, rating };
    })
    .filter((subject) => subject.rating != null && subject.rating <= 2.5)
    .sort((a, b) => (a.rating ?? 5) - (b.rating ?? 5));

  function patchSession(id: string, patch: Partial<SessionRow>) {
    queryClient.setQueryData<SessionRow[]>(["sessions", plan?.id], (old) =>
      (old ?? []).map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  }

  const shareUrl = plan?.share_token
    ? `${window.location.origin}/share/${plan.share_token}`
    : null;

  async function handleStartSharing() {
    if (!plan) return;
    setShareBusy(true);
    try {
      await enablePlanShare(plan.id);
      await queryClient.invalidateQueries({ queryKey: ["plans"] });
      setCopied(false);
      toast.success("Sharing is on — copy the link to send it.");
    } catch {
      toast.error("Couldn't start sharing — try again.");
    } finally {
      setShareBusy(false);
    }
  }

  async function handleCopyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied.");
    } catch {
      toast.error("Couldn't copy — select the link and copy it manually.");
    }
  }

  async function handleStopSharing() {
    if (!plan) return;
    setShareBusy(true);
    try {
      await disablePlanShare(plan.id);
      await queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Sharing is off — the old link no longer works.");
    } catch {
      toast.error("Couldn't stop sharing — try again.");
    } finally {
      setShareBusy(false);
    }
  }

  async function handleDelete() {
    if (!plan) return;
    setDeleting(true);
    try {
      const wasLast = plans.length <= 1;
      await deletePlan(plan.id);
      window.localStorage.removeItem("revisionpath.activePlan");
      await queryClient.invalidateQueries();
      setDeleteOpen(false);
      toast.success("Plan deleted.");
      navigate({ to: wasLast ? "/setup" : "/plan" });
    } catch (error) {
      console.error(error);
      toast.error("That plan couldn't be deleted — try again.");
    } finally {
      setDeleting(false);
    }
  }

  if (isLoading || (plan && (subjectsQuery.isLoading || topicsQuery.isLoading || sessionsQuery.isLoading))) {
    return (
      <AppShell>
        <div className="space-y-3" aria-label="Checking for your plan"><p className="text-sm font-semibold text-muted-foreground">Checking for your plan…</p><div className="h-28 animate-pulse rounded-[8px] bg-card" /><div className="h-48 animate-pulse rounded-[8px] bg-card" /></div>
      </AppShell>
    );
  }

  if (!plan) {
    return (
      <AppShell>
        <div className="rounded-[16px] bg-card p-6 ring-1 ring-black/5">
          <p className="text-lg font-extrabold tracking-tight">Let's build your first plan</p>
          <p className="mt-2 max-w-[46ch] text-[13px] font-medium leading-relaxed text-muted-foreground">
            It takes about a minute: pick your subjects, say how long you've got, and choose the
            topics you want to cover.
          </p>
          <Link
            to="/setup"
            className="mt-5 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground"
          >
            Start setup
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      headerCentre={
        <div className="flex items-center gap-1 rounded-full bg-card p-1 ring-1 ring-black/5">
          <button
            onClick={() => setWeek((w) => Math.max(1, w - 1))}
            aria-label="Previous week"
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-background"
          >
            <ChevronLeft className="size-4" strokeWidth={2.5} />
          </button>
          <div className="min-w-[78px] px-2 text-center">
            <p className="text-[13px] font-extrabold leading-none">Week {week}</p>
            <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground">
              of {plan.weeks}
            </p>
          </div>
          <button
            onClick={() => setWeek((w) => Math.min(plan.weeks, w + 1))}
            aria-label="Next week"
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-background"
          >
            <ChevronRight className="size-4" strokeWidth={2.5} />
          </button>
        </div>
      }
    >
      <div className="mb-5 flex flex-col items-start justify-between gap-3 print:hidden sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Week {week}</h1>
          <p className="text-[13px] font-semibold text-muted-foreground">{plan.name}</p>
        </div>
        <div className="relative grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Button asChild variant="outline">
            <Link to="/edit-plan">
              <Pencil aria-hidden="true" />
              Edit plan
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setShareOpen(true)}>
            <Share2 aria-hidden="true" />
            Share
          </Button>
          <Button asChild variant="outline">
            <Link to="/print-plan" search={{ week }} target="_blank">
              <Printer aria-hidden="true" />
              Print this week / Export as PDF
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="More plan actions" title="More plan actions" onClick={() => setActionsOpen((open) => !open)}><MoreHorizontal aria-hidden="true" /></Button>
          {actionsOpen ? <div className="absolute right-0 top-full z-10 mt-2 min-w-44 rounded-[8px] bg-card p-1 shadow-lg ring-1 ring-border"><button type="button" onClick={() => { setActionsOpen(false); setDeleteText(""); setDeleteOpen(true); }} className="flex w-full items-center gap-2 rounded-[6px] px-3 py-2 text-left text-sm font-bold text-destructive hover:bg-secondary"><Trash2 className="size-4" />Delete plan</button></div> : null}
        </div>
      </div>

      <ExamCountdown subjects={subjects} />

      <MasteryStrip subjects={subjects} topics={topics} subtopics={subtopics} cards={cards} />

      <PacePrompts plan={plan} subjects={subjects} topics={topics} subtopics={subtopics} sessions={sessions} />

      <section className="mb-7 print:hidden">
        <div className="rounded-[16px] bg-card p-4 ring-1 ring-black/5 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold tracking-tight">This week</p>
              <p className="mt-2 text-[13px] font-medium text-muted-foreground">
                {weekSessions.length} {weekSessions.length === 1 ? "session" : "sessions"} across{" "}
                {days.length} {days.length === 1 ? "day" : "days"} · {subjects.length} subjects
              </p>
              <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                Sessions are weighted by your confidence ratings and exam dates. Update them from{" "}
                <Link to="/edit-plan" className="font-bold underline underline-offset-2">
                  Edit plan
                </Link>
                .
              </p>
            </div>
            <div className="sm:max-w-[220px] sm:border-l sm:border-border sm:pl-6">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                Getting most time
              </p>
              {needsWork.length === 0 ? (
                <p className="text-[13px] font-medium text-muted-foreground">
                  Nothing rated 1 or 2 — time is shared evenly.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {needsWork.slice(0, 3).map((subject) => {
                    const style = subjectStyle(subject.color_key);
                    return (
                      <li
                        key={subject.id}
                        className="flex items-center gap-2 text-[13px] font-semibold"
                      >
                        <span className={`size-2 shrink-0 rounded-full ${style.dot}`} />
                        <span className="truncate">{subject.name}</span>
                        <span
                          className={`ml-auto text-[11px] font-extrabold ${confidenceTone(subject.rating).text}`}
                        >
                          {subject.rating}/5 · {subject.rating <= 2 ? "Red" : subject.rating < 5 ? "Amber" : "Green"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="print-week-sheet">
        <header className="print-week-heading hidden">
          <div>
            <p className="print-brand">rev.plan</p>
            <h1>{plan.name}</h1>
          </div>
          <p>Week {week} of {plan.weeks}</p>
        </header>

        <div key={week} className="print-week-grid week-in grid grid-cols-1 gap-4 md:grid-cols-2">
          {days.map((day) => {
          const daySessions = weekSessions
            .filter((s) => s.day_label === day)
            .sort((a, b) => Number(b.pinned) - Number(a.pinned) || a.session_slot - b.session_slot);
          if (daySessions.length === 0) return null;
          const dayDate = planDayDate(plan.start_date, week, day);
          const today = dayDate ? isToday(dayDate) : false;
          return (
            <section key={day} className="print-day rounded-[16px] bg-card p-3 ring-1 ring-black/5 sm:p-4">
              <div className="print-day-heading mb-2 flex items-center justify-between px-1">
                <p className="text-sm font-extrabold tracking-tight">
                  {day} <span className="font-semibold text-muted-foreground">· {planDayLabel(plan.start_date, week, day).replace(`${day.slice(0, 3)} `, "")}</span>
                </p>
                <p className="text-[11px] font-bold text-muted-foreground">
                  {daySessions.length} {daySessions.length === 1 ? "session" : "sessions"}
                </p>
              </div>
              <div className="space-y-3">
                {today ? <FlashcardReview planId={plan.id} cards={cards} subjects={subjects} /> : null}
                {daySessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    subject={subjects.find((s) => s.id === session.subject_id)}
                    minutes={session.length_minutes ?? plan.session_length_minutes}
                    onChanged={(patch) => patchSession(session.id, patch)}
                  />
                ))}
              </div>
            </section>
          );
          })}
        </div>
      </div>

      <div className="mt-7">
        <TopicsConfidencePanel planId={plan.id} subjects={subjects} topics={topics} subtopics={subtopics} cards={cards} />
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this plan</DialogTitle>
            <DialogDescription>
              Send a read-only copy of the timetable to a parent, friend or teacher. They can see
              your weeks, topics and gaps — but can't change anything.
            </DialogDescription>
          </DialogHeader>
          {shareUrl ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-[12px] bg-background p-2 ring-1 ring-border">
                <Link2 className="ml-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <p className="min-w-0 flex-1 truncate text-[12px] font-semibold">{shareUrl}</p>
              </div>
              <DialogFooter className="sm:justify-between">
                <Button variant="ghost" onClick={handleStopSharing} disabled={shareBusy}>
                  <X aria-hidden="true" />
                  Stop sharing
                </Button>
                <Button onClick={handleCopyLink} disabled={shareBusy}>
                  {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
                  {copied ? "Link copied" : "Copy link"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setShareOpen(false)} disabled={shareBusy}>
                Not now
              </Button>
              <Button onClick={handleStartSharing} disabled={shareBusy}>
                <Link2 aria-hidden="true" />
                Turn on sharing
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete "{plan.name}"?</DialogTitle>
            <DialogDescription>
              This will permanently delete this plan and all its sessions, including your topics and
              gap notes. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <label className="block text-sm font-bold">
            Type <span className="font-extrabold">{plan.name}</span> to confirm
            <input value={deleteText} onChange={(event) => setDeleteText(event.target.value)} className="mt-2 w-full rounded-[8px] bg-background px-3 py-2.5 font-medium ring-1 ring-border focus:outline-none" />
          </label>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Keep this plan
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleting || deleteText !== plan.name}>
              <Trash2 aria-hidden="true" />
              {deleting ? "Deleting…" : "Yes, delete it"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
