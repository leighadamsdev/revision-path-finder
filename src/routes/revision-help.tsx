import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, Check, Clock3, RotateCcw, SquareStack, X } from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";

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
      <PublicHeader />

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
          <p className="mt-2 text-[14px] font-medium text-muted-foreground">
            Make a card, start in Box 1, then follow the arrows after each answer.
          </p>
          <div className="mt-6 rounded-[8px] bg-card p-4 ring-1 ring-border sm:p-6">
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <FlowBox box="Box 1" label="Learning it" schedule="Daily" tone="low" />
              <FlowArrow />
              <FlowBox box="Box 2" label="Getting there" schedule="Every few days" tone="mid" />
              <FlowArrow />
              <FlowBox box="Box 3" label="Know it well" schedule="Weekly" tone="high" />
            </div>
            <div className="mt-5 grid gap-2 border-t border-border pt-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-[8px] bg-conf-high/10 px-3 py-3 text-[13px] font-extrabold text-conf-high">
                <Check className="size-5 shrink-0" strokeWidth={3} />
                Correct answer
                <ArrowRight className="ml-auto hidden size-5 sm:block" />
                <ArrowDown className="ml-auto size-5 sm:hidden" />
                Move to the next box
              </div>
              <div className="flex items-center gap-3 rounded-[8px] bg-conf-low/10 px-3 py-3 text-[13px] font-extrabold text-conf-low">
                <RotateCcw className="size-5 shrink-0" strokeWidth={3} />
                Incorrect answer
                <ArrowRight className="ml-auto size-5 rotate-180" />
                Return to Box 1
              </div>
            </div>
            <p className="mt-4 text-center text-[13px] font-semibold text-muted-foreground">
              Repeat each box on its schedule. Cards move forward as your memory strengthens.
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

function FlowBox({ box, label, schedule, tone }: { box: string; label: string; schedule: string; tone: "low" | "mid" | "high" }) {
  const colors = {
    low: "border-conf-low/35 bg-conf-low/10 text-conf-low",
    mid: "border-conf-mid/40 bg-conf-mid/10 text-conf-mid",
    high: "border-conf-high/35 bg-conf-high/10 text-conf-high",
  };
  return (
    <div className="flex min-h-40 flex-1 flex-col items-center justify-center rounded-[8px] border-2 border-border p-4 text-center">
      <span className={`grid size-14 place-items-center rounded-[8px] border-2 ${colors[tone]}`}>
        <SquareStack className="size-6" strokeWidth={2.5} />
      </span>
      <p className="mt-3 text-[16px] font-extrabold">{box}</p>
      <p className="text-[12px] font-bold text-muted-foreground">{label}</p>
      <p className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold ${colors[tone]}`}>
        <Clock3 className="size-3" /> {schedule}
      </p>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="grid shrink-0 place-items-center text-conf-high" aria-hidden="true">
      <ArrowRight className="hidden size-6 sm:block" strokeWidth={3} />
      <ArrowDown className="size-6 sm:hidden" strokeWidth={3} />
    </div>
  );
}
