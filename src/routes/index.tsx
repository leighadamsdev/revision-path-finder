import { createFileRoute, Link } from "@tanstack/react-router";

import { LogoOnDark } from "@/components/Logo";
import { PublicHeader } from "@/components/PublicHeader";
import { HomeSteps } from "@/components/HomeSteps";
import { HomeDashboard } from "@/components/HomeDashboard";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { BandChip } from "@/components/BandChip";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RevPlan — GCSE revision planner and knowledge checker" },
      {
        name: "description",
        content:
          "Pick your subjects, say how much time you have, and RevPlan builds a week-by-week GCSE revision timetable you can actually follow.",
      },
      { property: "og:title", content: "RevPlan — GCSE revision planner and knowledge checker" },
      {
        property: "og:description",
        content:
          "Pick your subjects, say how much time you have, and get a week-by-week revision timetable.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const POINTS = [
  {
    title: "Your subjects and topics",
    body: "Search for each subject and add the sub-topics you want to focus on. Alternatively upload your school's options booklet and revision guide and let RevPlan draft the list for you.",
    dot: "bg-maths",
  },
  {
    title: "One week at a time",
    body: "Sessions are laid out by week and day, so you only ever look at what's next — not the whole mountain.",
    dot: "bg-sci",
  },
  {
    title: "Honest confidence ratings",
    body: "Rate each topic red, amber or green and jot down gaps. Red topics can come back around before the exams.",
    dot: "bg-hist",
  },
];

function Landing() {
  const { user } = useAuth();
  // Signed-in students get a personal guide instead of the visitor homepage.
  if (user) {
    return (
      <AppShell>
        <HomeDashboard />
      </AppShell>
    );
  }
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-5 pb-20 pt-6">
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          GCSE REVISION PLANNER AND KNOWLEDGE CHECKER
        </p>
        <h1 className="mt-3 max-w-[30ch] text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          A bespoke revision timetable, built around exactly what you need to focus on and the time
          you have.
        </h1>
        <HomeSteps />
        <Link
          to="/revision-guide"
          className="mt-3 inline-flex text-[13px] font-bold text-muted-foreground underline underline-offset-4"
        >
          {"\n"}
        </Link>

        <QuickLinks />

        <PlanMockup />

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {POINTS.map((point) => (
            <div key={point.title} className="rounded-[8px] bg-card p-5 ring-1 ring-border">
              <span className={`block size-2.5 rounded-full ${point.dot}`} />
              <p className="mt-3 text-[15px] font-extrabold tracking-tight">{point.title}</p>
              <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-muted-foreground">
                {point.body}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const MOCK_WEEK = [
  {
    day: "Monday",
    date: "22 Sep",
    sessions: [
      {
        subject: "Maths",
        color: "maths",
        topic: "Quadratic equations — solving by factorising",
        confidence: 5,
        gaps: "Mixed up the negative case — redo Q7–Q9.",
      },
      {
        subject: "English Language",
        color: "eng",
        topic: "Paper 2 — comparing writers' viewpoints",
        confidence: 3,
        gaps: null,
      },
    ],
  },
  {
    day: "Tuesday",
    date: "23 Sep",
    sessions: [
      {
        subject: "Biology",
        color: "sci",
        topic: "Cell division — mitosis and stem cells",
        confidence: 1,
        gaps: "Can't remember the stages in order.",
      },
      {
        subject: "History",
        color: "hist",
        topic: "Weimar Germany — hyperinflation and recovery",
        confidence: 3,
        gaps: null,
      },
    ],
  },
];

const SUBJECT_STYLES: Record<string, { tag: string; dot: string; fill: string }> = {
  maths: { tag: "bg-maths/10 text-maths", dot: "bg-maths", fill: "bg-maths" },
  eng: { tag: "bg-eng/10 text-eng", dot: "bg-eng", fill: "bg-eng" },
  sci: { tag: "bg-sci/10 text-sci", dot: "bg-sci", fill: "bg-sci" },
  hist: { tag: "bg-hist/10 text-hist", dot: "bg-hist", fill: "bg-hist" },
};

function PlanMockup() {
  return (
    <div className="mt-14">
      <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        What a week looks like
      </p>
      <div className="mt-3 overflow-hidden rounded-[8px] bg-card shadow-[0_20px_60px_-25px] shadow-structure/35 ring-1 ring-border">
        <div className="flex flex-wrap items-center gap-3 bg-structure px-4 py-3">
          <LogoOnDark />
          <div className="ml-auto flex items-center gap-1.5">
            {["Week 2", "Week 3", "Week 4"].map((week, i) => (
              <span
                key={week}
                className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
                  i === 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-structure-foreground/10 text-structure-foreground/70"
                }`}
              >
                {week}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3 px-4 py-4 sm:grid-cols-2">
          {MOCK_WEEK.map((day) => (
            <div key={day.day}>
              <p className="text-[13px] font-extrabold tracking-tight">
                {day.day}
                <span className="ml-2 text-[11px] font-bold text-muted-foreground">{day.date}</span>
              </p>
              <div className="mt-2 space-y-2.5">
                {day.sessions.map((session) => {
                  const style = SUBJECT_STYLES[session.color]!;
                  return (
                    <div
                      key={session.topic}
                      className="rounded-[14px] bg-background/60 p-3 ring-1 ring-border"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${style.tag}`}
                        >
                          <span className={`size-1.5 rounded-full ${style.dot}`} />
                          {session.subject}
                        </span>
                        <span className="ml-auto text-[11px] font-bold text-muted-foreground">
                          45 min
                        </span>
                      </div>
                      <p className="mt-2 text-[14px] font-bold leading-snug">{session.topic}</p>
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                          Confidence
                        </span>
                        <BandChip value={session.confidence} />
                      </div>
                      <p className="mt-2 rounded-[10px] bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground ring-1 ring-border">
                        {session.gaps ?? "Gaps to revisit…"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-[13px] font-semibold text-muted-foreground">
        Two sessions a day, one topic each — rate how it went and RevPlan brings weak topics back
        before exam day.
      </p>
    </div>
  );
}

const QUICK_ACTIONS = [
  {
    to: "/revision-guide",
    title: "Learn how to revise effectively",
    body: "Follow our simple 5 step plan",
  },
  {
    to: "/revision-tools",
    title: "Find my focus and get in the zone",
    body: "3 simple tools to help you concentrate better",
  },
] as const;

function QuickLinks() {
  return (
    <section className="mt-10" aria-labelledby="quick-links-heading">
      <h2 id="quick-links-heading" className="text-xl font-extrabold tracking-tight">
        You can do the following for free
      </h2>
      <ol className="mt-4 space-y-3">
        {QUICK_ACTIONS.map((q, i) => (
          <li
            key={q.to}
            className="flex items-center gap-3 rounded-[8px] border-l-4 border-primary bg-card p-4 shadow-sm ring-1 ring-border transition-colors hover:bg-accent/40"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-primary text-[13px] font-extrabold text-primary-foreground">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-extrabold">{q.title}</p>
              <p className="mt-0.5 text-[12px] font-medium text-muted-foreground">{q.body}</p>
            </div>
            <Link
              to={q.to}
              className="shrink-0 rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-primary-foreground"
            >
              Go
            </Link>
          </li>
        ))}
        <li className="flex items-center gap-3 rounded-[8px] border-l-4 border-primary bg-card p-4 shadow-sm ring-1 ring-border transition-colors hover:bg-accent/40">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-primary text-[13px] font-extrabold text-primary-foreground">
            3
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-extrabold">Find more help</p>
            <p className="mt-0.5 text-[12px] font-medium text-muted-foreground">
              Test yourself with past papers and find subject specific revision sites
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Link
              to="/papers"
              className="rounded-full bg-primary px-4 py-2 text-center text-[13px] font-bold text-primary-foreground"
            >
              Past papers
            </Link>
            <Link
              to="/sites"
              className="rounded-full bg-primary px-4 py-2 text-center text-[13px] font-bold text-primary-foreground"
            >
              Revision links
            </Link>
          </div>
        </li>
      </ol>
    </section>
  );
}
