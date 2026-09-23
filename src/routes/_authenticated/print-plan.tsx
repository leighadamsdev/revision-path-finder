import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useActivePlan, usePlanSessions, usePlanSubjects } from "@/hooks/useActivePlan";
import { detailedTopicText } from "@/lib/gcse-topics";
import { planDayLabel, sortPlanDays } from "@/lib/plan-dates";

export const Route = createFileRoute("/_authenticated/print-plan")({
  validateSearch: (search: Record<string, unknown>) => ({
    week: Math.max(1, Number(search["week"]) || 1),
  }),
  head: () => ({
    meta: [
      { title: "Print revision week — rev.plan" },
      {
        name: "description",
        content: "A clean printable view of one week from your GCSE revision timetable.",
      },
      { property: "og:title", content: "Print revision week — rev.plan" },
      {
        property: "og:description",
        content: "A clean printable view of one GCSE revision week.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrintablePlanPage,
});


function PrintablePlanPage() {
  const { week: requestedWeek } = Route.useSearch();
  const { plan, isLoading } = useActivePlan();
  const subjectsQuery = usePlanSubjects(plan?.id);
  const sessionsQuery = usePlanSessions(plan?.id);

  if (isLoading || subjectsQuery.isLoading || sessionsQuery.isLoading) {
    return <p className="print-loading">Preparing your week…</p>;
  }

  if (!plan) {
    return (
      <main className="print-preview-shell">
        <p>No revision plan was found.</p>
        <Button asChild variant="outline">
          <Link to="/plan">Back to timetable</Link>
        </Button>
      </main>
    );
  }

  const week = Math.min(requestedWeek, plan.weeks);
  const subjects = subjectsQuery.data ?? [];
  const sessions = (sessionsQuery.data ?? []).filter((session) => session.week_number === week);

  return (
    <main className="print-preview-shell">
      <div className="print-preview-actions">
        <nav className="flex flex-wrap items-center gap-1" aria-label="Main navigation">
          <Button asChild variant="outline"><Link to="/plan">Home</Link></Button>
          <Button asChild variant="ghost"><Link to="/exams">Exam timetable</Link></Button>
          <Button asChild variant="ghost"><Link to="/papers">Past Papers</Link></Button>
          <Button asChild variant="ghost"><Link to="/sites">Revision links</Link></Button>
          <Button asChild variant="ghost"><Link to="/revision-help">Revision Help</Link></Button>
          <Button asChild variant="ghost"><Link to="/knowledge-checker">Knowledge Checker</Link></Button>
        </nav>
        <Button type="button" onClick={() => window.print()}>
          <Printer aria-hidden="true" />
          Print this week / Export as PDF
        </Button>
      </div>

      <article className="print-plan-week">
        <header className="print-plan-heading">
          <div>
            <p>rev.plan</p>
            <h1>{plan.name}</h1>
          </div>
          <strong>Week {week} of {plan.weeks}</strong>
        </header>

        <div className="print-plan-days">
          {sortPlanDays(plan.start_date, week, plan.study_days).map((day) => {
            const daySessions = sessions
              .filter((session) => session.day_label === day)
              .sort((a, b) => a.session_slot - b.session_slot);
            if (daySessions.length === 0) return null;

            return (
              <section key={day} className="print-plan-day">
                <h2>{planDayLabel(plan.start_date, week, day)}</h2>
                {daySessions.map((session) => {
                  const subject = subjects.find((item) => item.id === session.subject_id);
                  const minutes = session.length_minutes ?? plan.session_length_minutes;
                  return (
                    <article key={session.id} className="print-plan-session">
                      <div className="print-plan-session-meta">
                        <strong>
                          {subject?.name ?? "Subject removed"}
                        </strong>
                        <span>{minutes < 60 ? `${minutes} min` : `${minutes / 60} hr`}</span>
                      </div>
                      <h3>{detailedTopicText(subject?.name ?? "", session.topic_text) || "Topic to be decided"}</h3>
                      <p><strong>Gaps to revisit:</strong> {session.gap_notes || "—"}</p>
                    </article>
                  );
                })}
              </section>
            );
          })}
        </div>
      </article>
    </main>
  );
}