import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenCheck,
  Boxes,
  Check,
  ClipboardCheck,
  FlaskConical,
  Layers,
  PhoneOff,
  Timer,
} from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/revision-guide")({
  head: () => ({
    meta: [
      { title: "How to Revise Effectively (And Actually Remember It!) | rev.plan" },
      {
        name: "description",
        content:
          "A science-backed GCSE revision guide: set up your space, time your sessions, use the Knowledge Checker and the Leitner system, and tweak your approach per subject.",
      },
      {
        property: "og:title",
        content: "How to Revise Effectively (And Actually Remember It!) | rev.plan",
      },
      {
        property: "og:description",
        content:
          "A science-backed GCSE revision guide: set up your space, time your sessions, use the Knowledge Checker and the Leitner system, and tweak your approach per subject.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RevisionGuide,
});

function ScienceBox({ children }: { children: React.ReactNode }) {
  return (
    <aside className="mt-5 overflow-hidden rounded-[8px] bg-checker-ink text-checker-paper">
      <p className="flex items-center gap-2 border-b border-checker-mint/25 px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-checker-mint">
        <FlaskConical className="size-4" /> The Science
      </p>
      <p className="px-5 py-4 text-sm font-semibold leading-relaxed text-checker-paper/80">
        {children}
      </p>
    </aside>
  );
}

const CARDS = [
  {
    number: "1",
    icon: PhoneOff,
    title: "Set the stage (the environment)",
    intro:
      "Your brain has a limited amount of working memory. If your environment is cluttered, your focus drops.",
    points: [
      { bold: "Clear the desk:", text: "Only keep what you need for the current session (pens, paper, flashcards, water)." },
      { bold: "Banish the phone:", text: "Put your phone in a completely different room." },
      { bold: "Control the noise:", text: "Avoid music with lyrics, which competes for your brain's language processing centres. Stick to instrumental music (like lo-fi beats) or white noise." },
    ],
    science:
      "A famous 2017 study by Ward et al. proved the “Brain Drain” effect — just having your phone in the same room reduces your cognitive capacity, even if it is turned off!",
    link: null,
  },
  {
    number: "2",
    icon: Timer,
    title: "Time your sessions (the Pomodoro Technique)",
    intro: "Your brain learns best in short, intense bursts.",
    points: [
      { bold: "The 30-minute rule:", text: "Set a timer for 25 to 30 minutes of pure, uninterrupted focus." },
      { bold: "Take a break:", text: "When the timer rings, step away from your desk for 5 minutes. Stretch, get a snack, or look out the window." },
    ],
    science:
      "This is called the Pomodoro Technique. Breaking work into chunks prevents burnout and takes advantage of the “Spacing Effect”, giving your brain time to physically wire the new information into your memory.",
    link: null,
  },
] as const;

const BOXES = [
  { label: "Box 1", cadence: "Every day", tone: "bg-destructive/10 text-destructive" },
  { label: "Box 2", cadence: "Every 2–3 days", tone: "bg-checker-highlight/40 text-checker-ink" },
  { label: "Box 3", cadence: "Once a week", tone: "bg-conf-high/15 text-conf-high" },
] as const;

function RevisionGuide() {
  return (
    <div className="min-h-screen bg-checker-paper font-sans text-checker-ink">
      <PublicHeader />

      <main className="pb-20">
        <section className="bg-checker-ink text-checker-paper">
          <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
            <p className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase text-checker-mint">
              <span className="rounded-full bg-checker-mint px-3 py-1 text-checker-ink">EFFECTIVE REVISION</span>
              <span>SCIENCE-BACKED</span>
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">
              How to revise effectively (and actually remember it!)
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold leading-relaxed text-checker-paper/75 sm:text-xl">
              Revision doesn't have to mean staring at a textbook for hours until your brain hurts.
              To get the best GCSE grades, it's not about how <em>long</em> you study, but{" "}
              <em>how</em> you study. Here is your ultimate setup for brain-friendly,
              science-backed revision.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl space-y-6 px-5 pt-12">
          {CARDS.map((card) => (
            <article
              key={card.number}
              className="rounded-[8px] border border-checker-line bg-card p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-checker-mint text-sm font-black text-checker-ink">
                  {card.number}
                </span>
                <card.icon className="size-5 text-checker-ink" />
                <h2 className="text-xl font-extrabold leading-tight sm:text-2xl">{card.title}</h2>
              </div>
              <p className="mt-4 text-sm font-semibold leading-relaxed text-muted-foreground sm:text-base">
                {card.intro}
              </p>
              <ul className="mt-4 space-y-3">
                {card.points.map((point) => (
                  <li key={point.bold} className="flex items-start gap-3 text-sm font-semibold leading-relaxed sm:text-base">
                    <Check className="mt-1 size-4 shrink-0 text-conf-high" strokeWidth={3} />
                    <span>
                      <strong className="font-extrabold">{point.bold}</strong> {point.text}
                    </span>
                  </li>
                ))}
              </ul>
              <ScienceBox>{card.science}</ScienceBox>
            </article>
          ))}

          <article className="rounded-[8px] border border-checker-line bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-checker-mint text-sm font-black text-checker-ink">
                3
              </span>
              <ClipboardCheck className="size-5 text-checker-ink" />
              <h2 className="text-xl font-extrabold leading-tight sm:text-2xl">
                Step one: use the Knowledge Checker
              </h2>
            </div>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-muted-foreground sm:text-base">
              Never just start reading page one of a textbook. You will waste time revising things
              you already know.
            </p>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-sm font-semibold leading-relaxed sm:text-base">
                <Check className="mt-1 size-4 shrink-0 text-conf-high" strokeWidth={3} />
                <span>
                  Before you begin a topic, run through our built-in{" "}
                  <Link
                    to="/knowledge-checker"
                    className="font-extrabold text-primary underline decoration-checker-mint decoration-2 underline-offset-2 hover:text-primary/80"
                  >
                    Knowledge Checker
                  </Link>
                  .
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm font-semibold leading-relaxed sm:text-base">
                <Check className="mt-1 size-4 shrink-0 text-conf-high" strokeWidth={3} />
                <span>
                  Focus your 30-minute sessions strictly on the areas you scored lowest in. Tackle
                  red areas first, amber second, and green last.
                </span>
              </li>
            </ul>
          </article>

          <article className="rounded-[8px] border border-checker-line bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-checker-mint text-sm font-black text-checker-ink">
                4
              </span>
              <Boxes className="size-5 text-checker-ink" />
              <h2 className="text-xl font-extrabold leading-tight sm:text-2xl">
                Step two: master the Leitner system
              </h2>
            </div>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-muted-foreground sm:text-base">
              Rereading notes doesn't work. Active recall does. For facts, quotes, and equations,
              use the{" "}
              <Link
                to="/revision-help"
                className="font-extrabold text-primary underline decoration-checker-mint decoration-2 underline-offset-2 hover:text-primary/80"
              >
                Leitner System
              </Link>{" "}
              with physical flashcards.
            </p>
            <ul className="mt-4 space-y-3 text-sm font-semibold leading-relaxed sm:text-base">
              <li className="flex items-start gap-3">
                <Check className="mt-1 size-4 shrink-0 text-conf-high" strokeWidth={3} />
                <span>
                  <strong className="font-extrabold">Box 1 (every day):</strong> Put all your new
                  flashcards here. Test yourself. If you get it right, move it to Box 2. If you get
                  it wrong, it stays in Box 1.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-1 size-4 shrink-0 text-conf-high" strokeWidth={3} />
                <span>
                  <strong className="font-extrabold">Box 2 (every 2–3 days):</strong> Test yourself.
                  Get it right? Move to Box 3. Get it wrong? Back to Box 1.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-1 size-4 shrink-0 text-conf-high" strokeWidth={3} />
                <span>
                  <strong className="font-extrabold">Box 3 (once a week):</strong> Test yourself.
                  Right? You've mastered it! Wrong? Back to Box 1.
                </span>
              </li>
            </ul>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {BOXES.map((box) => (
                <div key={box.label} className="rounded-[8px] border border-checker-line p-3 text-center">
                  <p className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold ${box.tone}`}>
                    {box.label}
                  </p>
                  <p className="mt-2 text-[11px] font-bold leading-tight sm:text-xs">{box.cadence}</p>
                </div>
              ))}
            </div>
            <ScienceBox>
              Developed in the 1970s, this system beats the “Ebbinghaus Forgetting Curve”. By testing
              yourself just as you are about to forget the information, you lock it into your
              long-term memory permanently.
            </ScienceBox>
          </article>

          <article className="rounded-[8px] border border-checker-line bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-checker-mint text-sm font-black text-checker-ink">
                5
              </span>
              <Layers className="size-5 text-checker-ink" />
              <h2 className="text-xl font-extrabold leading-tight sm:text-2xl">
                Subject-specific tweaks
              </h2>
            </div>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-muted-foreground sm:text-base">
              Not all GCSEs are revised the same way!
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[8px] bg-checker-mint/20 p-4">
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase">
                  <BookOpenCheck className="size-4" /> Maths &amp; sciences
                </p>
                <p className="mt-2 text-sm font-semibold leading-relaxed">
                  Reading isn't revising. You have to <em>do</em>. Spend 20% of your time on
                  flashcards (formulas/definitions) and 80% doing past-paper practice questions.
                </p>
              </div>
              <div className="rounded-[8px] bg-checker-mint/20 p-4">
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase">
                  <BookOpenCheck className="size-4" /> English &amp; history
                </p>
                <p className="mt-2 text-sm font-semibold leading-relaxed">
                  Use the Leitner system heavily for dates, context facts, and quote banks. Then,
                  practice writing essay plans under timed conditions.
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="mx-auto max-w-3xl px-5 pt-10">
          <div className="rounded-[8px] bg-checker-mint p-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
            <div>
              <p className="text-xl font-extrabold">Want a plan that puts this into practice?</p>
              <p className="mt-2 text-sm font-semibold text-checker-ink/75">
                Build a week-by-week timetable around your exam dates and confidence ratings.
              </p>
            </div>
            <Button asChild size="lg" className="mt-5 bg-checker-ink font-extrabold text-checker-paper hover:bg-checker-ink/90 sm:mt-0">
              <Link to="/auth">Create your revision plan <ArrowRight /></Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
