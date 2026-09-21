import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";

import { getSharedPlan, type SharedPlanPayload } from "@/lib/share.functions";
import { LogoOnDark } from "@/components/Logo";
import { subjectStyle } from "@/lib/subjects";
import { planDayDate, sortPlanDays } from "@/lib/plan-dates";

export const Route = createFileRoute("/share/$token")({
  head: () => ({
    meta: [
      { title: "Shared revision plan — rev.plan" },
      {
        name: "description",
        content: "A week-by-week GCSE revision plan shared from rev.plan.",
      },
      { property: "og:title", content: "Shared revision plan — rev.plan" },
      {
        property: "og:description",
        content: "A week-by-week GCSE revision plan shared from rev.plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ params }) => getSharedPlan({ data: { token: params.token } }),
  component: SharedPlanPage,
});


function SharedPlanPage() {
  const data = Route.useLoaderData() as SharedPlanPayload | null;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="bg-structure">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-5 py-4">
          <LogoOnDark className="h-5 w-auto" />
          <span className="ml-auto rounded-full bg-structure-foreground/10 px-3 py-1 text-[11px] font-extrabold text-structure-foreground/80">
            Shared read-only
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20 pt-8">
        {!data ? (
          <div className="rounded-[16px] bg-card p-6 ring-1 ring-black/5">
            <p className="text-lg font-extrabold tracking-tight">This link is no longer valid</p>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-muted-foreground">
              The student may have turned sharing off, or the link was copied incorrectly.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground"
            >
              Find out about rev.plan
            </Link>
          </div>
        ) : (
          <>
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Shared revision plan
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{data.plan.name}</h1>
            <p className="mt-2 text-[14px] font-semibold text-muted-foreground">
              {data.plan.weeks} weeks
              {data.plan.start_date
                ? ` · starts ${format(new Date(data.plan.start_date), "d MMM yyyy")}`
                : ""}
              {" · "}
              {data.subjects.length} subjects
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {data.subjects.map((subject) => {
                const style = subjectStyle(subject.color_key);
                return (
                  <span
                    key={subject.id}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-extrabold ${style.tag}`}
                  >
                    <span className={`size-1.5 rounded-full ${style.dot}`} />
                    {subject.name}
                  </span>
                );
              })}
            </div>

            {Array.from({ length: data.plan.weeks }, (_, i) => i + 1).map((week) => {
              const weekSessions = data.sessions.filter((s) => s.week_number === week);
              if (weekSessions.length === 0) return null;
              const days = sortPlanDays(data.plan.start_date, week, data.plan.study_days ?? []);
              return (
                <section key={week} className="mt-10">
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-xl font-extrabold tracking-tight">Week {week}</h2>
                    <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {weekSessions.length} sessions
                    </p>
                  </div>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    {days.map((day) => {
                      const daySessions = weekSessions
                        .filter((s) => s.day_label === day)
                        .sort((a, b) => a.session_slot - b.session_slot);
                      if (daySessions.length === 0) return null;
                      const date = planDayDate(data.plan.start_date, week, day);
                      return (
                        <div key={day} className="rounded-[16px] bg-card p-4 ring-1 ring-black/5">
                          <p className="text-sm font-extrabold tracking-tight">
                            {day}
                            {date && (
                              <span className="ml-2 text-[11px] font-bold text-muted-foreground">
                                {format(date, "d MMM")}
                              </span>
                            )}
                          </p>
                          <div className="mt-2.5 space-y-2.5">
                            {daySessions.map((session) => {
                              const subject = data.subjects.find(
                                (s) => s.id === session.subject_id,
                              );
                              const style = subjectStyle(subject?.color_key);
                              return (
                                <div
                                  key={session.id}
                                  className="rounded-[14px] bg-background/60 p-3 ring-1 ring-black/5"
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${style.tag}`}
                                    >
                                      <span className={`size-1.5 rounded-full ${style.dot}`} />
                                      {subject?.name ?? "Session"}
                                    </span>
                                    <span className="ml-auto text-[11px] font-bold text-muted-foreground">
                                      {session.length_minutes ?? data.plan.session_length_minutes}{" "}
                                      min
                                    </span>
                                  </div>
                                  <p className="mt-2 text-[14px] font-bold leading-snug">
                                    {session.topic_text || "Topic to be confirmed"}
                                  </p>
                                  <p className="mt-2 rounded-[10px] bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground ring-1 ring-border">
                                    {session.gap_notes || "Gaps to revisit…"}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            <p className="mt-12 rounded-[16px] bg-card p-5 text-center text-[13px] font-semibold text-muted-foreground ring-1 ring-black/5">
              Shared from{" "}
              <Link to="/" className="font-extrabold text-primary underline underline-offset-2">
                rev.plan
              </Link>{" "}
              — a topic-focused GCSE revision timetable.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
