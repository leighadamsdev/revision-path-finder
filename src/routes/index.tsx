import { createFileRoute, Link } from "@tanstack/react-router";

import { LogoOnDark } from "@/components/Logo";
import { PublicHeader } from "@/components/PublicHeader";
import { NextBestAction } from "@/components/planner/NextBestAction";

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
  {
    title: "Pick your subjects",
    body: "Tick every subject you take and choose your tier and exam board.",
  },
  {
    title: "Get your exam dates",
    body: "Your summer exams are added from the official timetable. Add mocks from your school's website, a printed sheet or a downloaded list.",
  },
  {
    title: "Choose your topics",
    body: "Use a ready-made exam board list, upload a photo of your revision guide, or type your own.",
  },
  {
    title: "Check what you know",
    body: "Use the Knowledge Checker, then rate each topic red, amber or green.",
  },
  {
    title: "Get your plan",
    body: "A week-by-week timetable that puts your red topics first and adds more sessions as exams get closer, including holidays.",
  },
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
    body: "Rate each topic red, amber or green and jot down gaps. Red topics can come back around before the exams.",
    dot: "bg-hist",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-5 pb-20 pt-6">
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          GCSE REVISION PLANNER AND KNOWLEDGE CHECKER
        </p>
        <h1 className="mt-3 max-w-[30ch] text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          A bespoke revision timetable, built around exactly what you need to focus on and the time
          you have
        </h1>
        <div className="relative mt-8 w-full">
          <div
            aria-hidden="true"
            className="absolute bottom-6 left-[26px] top-6 hidden w-0.5 bg-primary sm:block"
          />
          <ol className="space-y-6">
            {HOW_STEPS.map((step, i) => (
              <li key={step.title} className="relative flex items-start">
                <div className="z-10 hidden h-14 w-14 shrink-0 items-center justify-center rounded-[8px] bg-primary text-lg font-extrabold text-primary-foreground shadow-lg sm:flex">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div
                  className={`w-full rounded-[8px] bg-structure p-5 text-lg font-medium leading-relaxed text-structure-foreground shadow-lg transition-transform duration-300 hover:-translate-y-1 sm:ml-8 sm:p-6 ${i === HOW_STEPS.length - 1 ? "ring-2 ring-primary" : ""}`}
                >
                  <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-[8px] bg-primary text-sm font-extrabold text-primary-foreground shadow-md sm:hidden">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-xl font-extrabold tracking-tight">{step.title}</h2>
                  <p className="mt-1 text-base font-medium leading-relaxed opacity-90">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-8">
          <NextBestAction />
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
        <Link
          to="/revision-guide"
          className="mt-3 inline-flex text-[13px] font-bold text-muted-foreground underline underline-offset-4"
        >
          {"\n"}
        </Link>

        <QuickLinks />

        <CheckerMockup />

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
          className={`size-4 rounded-full ${value >= v ? fill : "ring-1 ring-border"}`}
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
      <div className="mt-3 overflow-hidden rounded-[8px] bg-card shadow-[0_20px_60px_-25px] shadow-structure/35 ring-1 ring-border">
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

const CHECKER_ROWS = [
  {
    component: "Lock-and-key model",
    recall: [
      "Enzyme's active site shape matches the substrate",
      "High temperatures denature the active site",
    ],
    gaps: ["Optimum pH: pepsin is around pH 2 — recheck notes"],
  },
  {
    component: "Rate of reaction",
    recall: ["Rate rises with temperature until the enzyme denatures"],
    gaps: [
      "Substrate concentration: what happens at the plateau?",
      "Denatured vs saturated — which is which",
    ],
  },
];

function CheckerMockup() {
  return (
    <div className="mt-14">
      <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        What a knowledge checker looks like
      </p>
      <div className="mt-3 overflow-hidden rounded-[8px] border border-structure bg-card shadow-[0_20px_60px_-25px] shadow-structure/35">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-structure px-4 py-3 text-structure-foreground">
          <div>
            <p className="text-[11px] font-extrabold uppercase text-primary">
              rev.plan · active recall
            </p>
            <p className="mt-0.5 text-[15px] font-extrabold">
              Closed book first. Be honest with the gaps.
            </p>
          </div>
          <span className="rounded-[8px] border border-primary/60 px-2.5 py-1 text-[13px] font-extrabold tabular-nums">
            21:47 ⏱
          </span>
        </div>

        <div className="grid gap-2 border-b border-border bg-background px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground sm:grid-cols-[1fr_1.4fr_0.7fr]">
          <span>
            Subject
            <span className="mt-1 block text-[13px] font-bold normal-case tracking-normal text-foreground">
              Biology
            </span>
          </span>
          <span>
            Topic title
            <span className="mt-1 block text-[13px] font-bold normal-case tracking-normal text-foreground">
              Enzymes
            </span>
          </span>
          <span>
            Date
            <span className="mt-1 block text-[13px] font-bold normal-case tracking-normal text-foreground">
              24 Sep
            </span>
          </span>
        </div>

        {CHECKER_ROWS.map((row, index) => (
          <div
            key={row.component}
            className="grid border-b border-border md:grid-cols-[0.7fr_1.3fr]"
          >
            <div className="border-b border-border bg-background p-4 md:border-b-0 md:border-r">
              <p className="text-[11px] font-extrabold uppercase text-muted-foreground">
                Key component {index + 1}
              </p>
              <p className="mt-2 text-[14px] font-bold leading-snug">{row.component}</p>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-extrabold uppercase text-muted-foreground">
                  What I already know
                </p>
                <ul className="mt-2 space-y-1.5">
                  {row.recall.map((line) => (
                    <li
                      key={line}
                      className="text-[12.5px] font-semibold leading-relaxed text-foreground"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase text-foreground">
                  Gaps and corrections
                </p>
                <div className="mt-2 rounded-[6px] border-l-4 border-primary bg-accent p-2.5">
                  <ul className="space-y-1.5">
                    {row.gaps.map((line) => (
                      <li
                        key={line}
                        className="text-[12.5px] font-semibold leading-relaxed text-foreground"
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-col justify-between gap-2 bg-accent px-4 py-3 text-[13px] font-extrabold text-foreground sm:flex-row sm:items-center">
          <span>3 secure items · 3 highlighted gaps</span>
          <span className="self-start rounded-full bg-primary px-3 py-1.5 text-[11px] text-primary-foreground sm:self-auto">
            Priority: Target highlighted gaps next
          </span>
        </div>
      </div>
      <p className="mt-3 text-center text-[13px] font-semibold text-muted-foreground">
        Brain dump from memory, then open your notes and highlight exactly what was missing — every
        gap becomes a flashcard or a lower confidence rating in your plan.
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
