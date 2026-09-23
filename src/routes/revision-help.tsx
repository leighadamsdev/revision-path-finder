import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Pencil, RefreshCw, RotateCcw, SquareStack, X } from "lucide-react";

export const Route = createFileRoute("/revision-help")({
  head: () => ({
    meta: [
      { title: "Revision Help — the Leitner system, explained simply | rev.plan" },
      {
        name: "description",
        content:
          "A simple way to review flashcards so you spend more time on what you don't know yet, and less on what you already do.",
      },
      {
        property: "og:title",
        content: "Revision Help — the Leitner system, explained simply | rev.plan",
      },
      {
        property: "og:description",
        content:
          "A simple way to review flashcards so you spend more time on what you don't know yet, and less on what you already do.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RevisionHelp,
});

const STEPS = [
  "Make flashcards — a question or term on one side, the answer on the other.",
  "Set up 3 boxes: Box 1 (learning it), Box 2 (getting there), Box 3 (know it well).",
  "Give each box a review frequency, e.g. Box 1 = every day, Box 2 = every few days, Box 3 = once a week.",
  "Review Box 1 first. Got it right? Move the card to Box 2. Got it wrong? It stays in Box 1.",
  "When it's time to review Box 2 or 3: right answer moves the card up a box; wrong answer sends it all the way back to Box 1.",
  "Keep reviewing each box on its schedule — cards keep moving up as you get more confident, or back down if you forget.",
];

const GOOD_FOR = [
  "Focusing more time on the topics you find hardest",
  "Seeing your progress as cards move up the boxes",
  "Building long-term memory through regular, spaced review",
  "Making revision feel a bit more like a game",
];

const WORTH_KNOWING = [
  "Can feel like a lot to manage if you have many cards",
  "Takes a bit of setup time upfront",
  "Works best if you keep each subject's cards separate",
];

function RevisionHelp() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
        <Link to="/" className="inline-flex items-center rounded-2xl bg-white px-4 py-2.5 shadow-[0_2px_10px_rgba(3,49,58,0.08)]">
          <span className="text-[15px] font-extrabold tracking-tight">rev.plan</span>
        </Link>
        <Link
          to="/auth"
          className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-5 pb-20 pt-6">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Revision Help
        </h1>
        <p className="mt-3 max-w-[55ch] text-lg font-medium leading-relaxed text-muted-foreground">
          A simple way to review flashcards so you spend more time on what you don't know yet, and
          less on what you already do.
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-extrabold tracking-tight">What is the Leitner System?</h2>
          <div className="mt-4 rounded-r-[24px] border-l-4 border-primary bg-structure p-5 text-lg font-medium leading-relaxed text-structure-foreground shadow-lg sm:p-6">
            It's a flashcard method that sorts your cards into boxes based on how well you know
            them. Cards you get right move to a box you review less often; cards you get wrong go
            back to the box you review most often. Think of it as a simple game — the goal is to
            get all your cards into the "know it well" box.
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-extrabold tracking-tight">How it works</h2>
          <div className="relative mt-6 w-full max-w-xl">
            <div
              aria-hidden="true"
              className="absolute left-[26px] bottom-6 top-6 hidden w-1 rounded-full bg-primary/40 sm:block"
            />
            <ol className="space-y-6">
              {STEPS.map((step, i) => (
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
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-extrabold tracking-tight">The boxes at a glance</h2>
          <div className="mt-5 overflow-x-auto pb-2">
            <div className="flex min-w-[640px] items-stretch gap-2 sm:min-w-0">
              <BoxCard box="Box 1" name="Learning it" schedule="Daily" tone="bg-conf-low" />
              <MoveArrows />
              <BoxCard box="Box 2" name="Getting there" schedule="Every few days" tone="bg-conf-mid" />
              <MoveArrows />
              <BoxCard box="Box 3" name="Know it well" schedule="Weekly" tone="bg-conf-high" />
            </div>
            <p className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
              <RotateCcw className="size-4 shrink-0" />
              Got one wrong? The card goes all the way back to Box 1 — and that's the system working.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-extrabold tracking-tight">Why it works</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[16px] bg-card p-5 ring-1 ring-black/5">
              <p className="flex items-center gap-2 text-[15px] font-extrabold tracking-tight">
                <Check className="size-4 text-conf-high" strokeWidth={3} />
                Good for
              </p>
              <ul className="mt-3 space-y-2.5">
                {GOOD_FOR.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-[13px] font-medium leading-relaxed text-muted-foreground">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-conf-high" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[16px] bg-card p-5 ring-1 ring-black/5">
              <p className="flex items-center gap-2 text-[15px] font-extrabold tracking-tight">
                <X className="size-4 text-conf-low" strokeWidth={3} />
                Worth knowing
              </p>
              <ul className="mt-3 space-y-2.5">
                {WORTH_KNOWING.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-[13px] font-medium leading-relaxed text-muted-foreground">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-conf-low" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-[20px] bg-card p-6 shadow-[0_20px_60px_-25px] shadow-structure/35 ring-1 ring-black/10 sm:p-8">
          <p className="text-xl font-extrabold tracking-tight">Want to bring this into your plan?</p>
          <p className="mt-1.5 text-[14px] font-medium text-muted-foreground">
            Build your week-by-week timetable first — then slot flashcard boxes in around it.
          </p>
          <Link
            to="/auth"
            className="mt-5 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground"
          >
            Create your plan
          </Link>
        </section>
      </main>
    </div>
  );
}

function BoxCard({ box, name, schedule, tone }: { box: string; name: string; schedule: string; tone: string }) {
  return (
    <div className="flex-1 rounded-[16px] bg-card p-4 shadow-[0_10px_30px_-18px] shadow-structure/40 ring-1 ring-black/5">
      <span className={`inline-flex size-9 items-center justify-center rounded-full ${tone}`}>
        <SquareStack className="size-4 text-white" strokeWidth={2.5} />
      </span>
      <p className="mt-3 text-[15px] font-extrabold tracking-tight">{box}</p>
      <p className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">{name}</p>
      <p className="mt-2 inline-flex rounded-full bg-secondary px-3 py-1 text-[11px] font-extrabold text-secondary-foreground">
        Review {schedule.toLowerCase()}
      </p>
    </div>
  );
}

function MoveArrows() {
  return (
    <div className="flex w-10 shrink-0 flex-col items-center justify-center gap-1 sm:w-12" aria-hidden="true">
      <span className="grid size-7 place-items-center rounded-full bg-conf-high/15">
        <Check className="size-3.5 text-conf-high" strokeWidth={3} />
      </span>
      <span className="grid size-7 place-items-center rounded-full bg-conf-low/15">
        <RotateCcw className="size-3.5 text-conf-low" strokeWidth={3} />
      </span>
    </div>
  );
}
