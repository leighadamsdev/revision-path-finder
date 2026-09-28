import { createFileRoute, Link } from "@tanstack/react-router";

import { LogoOnDark } from "@/components/Logo";
import { PublicHeader } from "@/components/PublicHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "rev.plan — a calm GCSE revision timetable" },
      {
        name: "description",
        content:
          "Pick your subjects, say how much time you have, and rev.plan builds a week-by-week GCSE revision timetable you can actually follow.",
      },
      { property: "og:title", content: "rev.plan — a calm GCSE revision timetable" },
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

const HOW_STEPS = [
  "Tell revplan the subjects and tiers you are studying",
  "Lock in how many weeks you have until exam day",
  "Use our bespoke knowledge checker to work out what you know and what you don't, before you create your revision plan or any flashcards\n",
  "Choose the exact topics you need to revise from a pre-populated list or upload your own topic list\n",
  "Let revplan build you a week-by-week, session by session plan, linked to exam dates and your subject confidence",
];

const POINTS = [
  {
    title: "Your subjects and topics",
    body: "Search for each subject and add the sub-topics you want to focus on. Alternatively upload your school's options booklet and revision guide and let rev.plan draft the list for you.",
    dot: "bg-maths",
  },
  {
    title: "One week at a time",
    body: "Sessions are laid out by week and day, so you only ever look at what's next — not the whole mountain.",
    dot: "bg-sci",
  },
  {
    title: "Honest confidence ratings",
    body: "Rate each topic 1–5 and jot down gaps. Low-rated topics can come back around before the exams.",
    dot: "bg-hist",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-5 pb-20 pt-6">
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          GCSE revision planner
        </p>
        <h1 className="mt-3 max-w-[30ch] text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          A bespoke timetable, designed around the time you've got and exactly what you need to revise
        </h1>
        <div className="relative mt-8 w-full max-w-xl">
          <div
            aria-hidden="true"
            className="absolute left-[26px] bottom-6 top-6 hidden w-1 rounded-full bg-primary/40 sm:block"
          />
          <ol className="space-y-6">
            {HOW_STEPS.map((step, i) => (
              <li key={step} className="relative flex items-start">
                <div className="z-10 hidden h-14 w-14 shrink-0 items-center justify-center rounded-full bg-structure text-xl font-bold text-primary ring-4 ring-primary sm:flex">
                  {i + 1}
                </div>
                <div className="w-full rounded-r-[24px] border-l-4 border-primary bg-structure p-5 text-lg font-medium leading-relaxed text-structure-foreground shadow-lg sm:ml-8 sm:p-6">
                  <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground sm:hidden">
                    {i + 1}
                  </span>
                  {step}
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            to="/auth"
            search={{ mode: "signup", context: "create-plan", returnTo: "/setup" }}
            className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground"
          >
            Create your plan
          </Link>
          <span className="text-[13px] font-semibold text-muted-foreground">
            Free · your plan stays private to you
          </span>
        </div>
        <Link to="/revision-guide" className="mt-3 inline-flex text-[13px] font-bold text-muted-foreground underline underline-offset-4">
          Not sure how to revise yet? Read the Effective Revision guide.
        </Link>

        <QuickLinks />

        <PlanMockup />

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {POINTS.map((point) => (
            <div key={point.title} className="rounded-[16px] bg-card p-5 ring-1 ring-black/5">
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
        confidence: 4,
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
        confidence: 2,
        gaps: "Can't remember the stages in order.",
      },
      {
        subject: "History",
        color: "hist",
        topic: "Weimar Germany — hyperinflation and recovery",
        confidence: 4,
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

function ConfidenceDots({ value, fill }: { value: number; fill: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((v) => (
        <span
          key={v}
          className={`size-4 rounded-full ${value >= v ? fill : "ring-1 ring-black/15"}`}
        />
      ))}
    </div>
  );
}

function PlanMockup() {
  return (
    <div className="mt-14">
      <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        What a week looks like
      </p>
      <div className="mt-3 overflow-hidden rounded-[20px] bg-card shadow-[0_20px_60px_-25px] shadow-structure/35 ring-1 ring-black/10">
        <div className="flex flex-wrap items-center gap-3 bg-structure px-4 py-3">
          <LogoOnDark className="h-5 w-auto" />
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
                      className="rounded-[14px] bg-background/60 p-3 ring-1 ring-black/5"
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
                        <ConfidenceDots value={session.confidence} fill={style.fill} />
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
        Two sessions a day, one topic each — rate how it went and rev.plan brings weak topics back
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
    to: "/library",
    title: "Lock in my subjects and topics",
    body: "List what you are studying, tell us how confident you  are with each, then photograph and upload revision guide contents pages or use lists from school to make sure you have everything covered",
  },
  {
    to: "/setup",
    title: "Create my own revision plan",
    body: "Choose when and for long you study daily, based on your subjects, confidence levels and your next exams, mocks or tests ",
  },
  {
    to: "/exams",
    title: "Manage my exam timetable",
    body: "Map when D-Day is for each subject and paper and link this to your revision plan",
  },
  {
    to: "/knowledge-checker",
    title: "Check how much I already know",
    body: "Yes yourself with individual knowledge checkers and then create targeted flashcards for every subject",
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
      <h2 id="quick-links-heading" className="text-xl font-extrabold tracking-tight">What would you like to do?</h2>
      <ol className="mt-4 space-y-3">
        {QUICK_ACTIONS.map((q, i) => (
          <li key={q.to} className="flex items-center gap-3 rounded-[14px] bg-card p-4 ring-1 ring-black/5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[13px] font-extrabold text-primary">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-extrabold">{q.title}</p>
              <p className="mt-0.5 text-[12px] font-medium text-muted-foreground">{q.body}</p>
            </div>
            <Link to={q.to} className="shrink-0 rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-primary-foreground">Go</Link>
          </li>
        ))}
        <li className="flex items-center gap-3 rounded-[14px] bg-card p-4 ring-1 ring-black/5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[13px] font-extrabold text-primary">
            7
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-extrabold">Find more help</p>
            <p className="mt-0.5 text-[12px] font-medium text-muted-foreground">Test yourself with past papers and find subject specific revision sites</p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Link to="/papers" className="rounded-full bg-primary px-4 py-2 text-center text-[13px] font-bold text-primary-foreground">Past papers</Link>
            <Link to="/sites" className="rounded-full bg-primary px-4 py-2 text-center text-[13px] font-bold text-primary-foreground">Revision links</Link>
          </div>
        </li>
      </ol>
    </section>
  );
}
