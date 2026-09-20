import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RevisionPath — a calm GCSE revision timetable" },
      {
        name: "description",
        content:
          "Pick your subjects and exam boards, say how much time you have, and RevisionPath builds a week-by-week GCSE revision timetable you can actually follow.",
      },
      { property: "og:title", content: "RevisionPath — a calm GCSE revision timetable" },
      {
        property: "og:description",
        content:
          "Pick your subjects and exam boards, say how much time you have, and get a week-by-week revision timetable.",
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
    body: "Search for each subject and add the topics you want to focus on. Alternatively upload your school's options booklet and revision guide and let RevisionPath draft the list for you.",
    dot: "bg-maths",
  },
  {
    title: "A week at a time",
    body: "Sessions are laid out by week and day, so you only ever look at what's next — not the whole mountain.",
    dot: "bg-sci",
  },
  {
    title: "Honest confidence ratings",
    body: "Rate each session 1–5 and jot down gaps. Low-rated topics can come back around before the exams.",
    dot: "bg-hist",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-[10px] bg-structure">
            <span className="text-sm font-extrabold text-structure-foreground">R</span>
          </div>
          <p className="text-[15px] font-extrabold tracking-tight">RevisionTrax</p>
        </div>
        <Link
          to="/auth"
          className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-5 pb-20 pt-6">
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          GCSE revision planner
        </p>
        <h1 className="mt-3 max-w-[30ch] text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          A revision timetable that fits the time you've actually got.
        </h1>
        <p className="mt-4 max-w-[52ch] text-base font-medium text-muted-foreground">
          Tell RevisionPath your subjects, how many weeks you have until exam day and what topics you need to study. RevisionTrax builds a week-by-week plan of study sessions — one topic at a time, no spreadsheet required.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            to="/auth"
            className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground"
          >
            Create your plan
          </Link>
          <span className="text-[13px] font-semibold text-muted-foreground">
            Free · your plan stays private to you
          </span>
        </div>

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
