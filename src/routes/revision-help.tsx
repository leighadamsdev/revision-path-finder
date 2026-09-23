import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  Clock3,
  Dumbbell,
  Eye,
  EyeOff,
  Highlighter,
  Lightbulb,
  ListChecks,
  Target,
  X,
  Download,
} from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/revision-help")({
  head: () => ({
    meta: [
      { title: "Revision Knowledge Checker — active recall guide | rev.plan" },
      {
        name: "description",
        content:
          "Use the RevPlan Knowledge Checker to test what you remember, reveal gaps, and decide what to revise next.",
      },
      {
        property: "og:title",
        content: "Revision Knowledge Checker — active recall guide | rev.plan",
      },
      {
        property: "og:description",
        content:
          "Use the RevPlan Knowledge Checker to test what you remember, reveal gaps, and decide what to revise next.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RevisionHelp,
});

const STEPS = [
  {
    number: "1",
    short: "Headings",
    title: "Set up the headings",
    strap: "Build the skeleton — not the notes.",
    icon: ListChecks,
    points: [
      "Use your exam specification, revision guide contents page, or class checklist.",
      "Write recognisable subheadings in the left column: Mitosis, Enzyme Action, Macbeth Act 1 Themes.",
    ],
    doText: "Keep each heading short enough to act as a memory cue.",
    dontText: "Do not write notes or answers in this column.",
  },
  {
    number: "2",
    short: "Brain dump",
    title: "Brain dump — closed book",
    strap: "Make your memory do the work.",
    icon: Brain,
    points: [
      "Close your books, put your phone away, and bullet-point everything you can recall.",
      "Stop after 30 minutes. The time limit keeps your effort focused and manageable.",
    ],
    doText: "Stay with the struggle — trying to remember strengthens recall.",
    dontText: "Do not peek when an answer feels just out of reach.",
  },
  {
    number: "3",
    short: "Spot gaps",
    title: "Spot the gaps — open book",
    strap: "Turn missing details into your next to-do list.",
    icon: Highlighter,
    points: [
      "Check your brain dump against your notes or revision guide.",
      "Highlight missed facts, keywords, and corrections so they stand out instantly.",
    ],
    doText: "Revise highlighted gaps in your next study block.",
    dontText: "Do not spend equal time on points you already recalled.",
  },
] as const;

const SCIENCE = [
  {
    icon: Dumbbell,
    label: "The Testing Effect",
    title: "Remembering is like a workout",
    copy: "Re-reading can feel easy because the answer is right there. Pulling it from long-term memory strengthens the pathway, like lifting a weight strengthens a muscle.",
  },
  {
    icon: Eye,
    label: "Metacognition",
    title: "See what you don't know",
    copy: "The highlighter exposes blind spots. You stop circling comfortable topics and put your time where it can make a real difference.",
  },
  {
    icon: Target,
    label: "Targeted keywords",
    title: "Recover dropped marks",
    copy: "Missing words often match exam-board marking points. Highlighting them gives you a focused list of details to secure before the exam.",
  },
] as const;

function RevisionHelp() {
  const [activeStep, setActiveStep] = useState(0);
  const [demoOpen, setDemoOpen] = useState(false);
  const step = STEPS[activeStep] ?? STEPS[0];
  const StepIcon = step.icon;

  return (
    <div className="min-h-screen bg-checker-paper font-sans text-checker-ink">
      <PublicHeader />

      <main className="pb-20">
        <section className="bg-checker-ink text-checker-paper">
          <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
            <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase text-checker-mint">
              <span className="rounded-full bg-checker-mint px-3 py-1 text-checker-ink">Year 10 + 11</span>
              <span>RevPlan Knowledge Checker</span>
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">
              Find the gaps before the exam does.
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold leading-relaxed text-checker-paper/75 sm:text-xl">
              A 30-minute routine to test what you really remember, reveal the missing details, and
              choose exactly what to revise next.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-[8px] border border-checker-mint/35 bg-checker-mint/10 px-4 py-3 text-sm font-extrabold text-checker-mint">
                <Clock3 className="size-4" /> One sheet · three steps · 30 minutes max
              </div>
              <Button asChild variant="outline" className="border-checker-mint/40 bg-transparent text-checker-mint hover:bg-checker-mint/10 hover:text-checker-mint">
                <Link to="/knowledge-checker">Use online <ArrowRight /></Link>
              </Button>
              <Button asChild variant="ghost" className="text-checker-paper hover:bg-checker-mint/10 hover:text-checker-paper">
                <a href="/revplan-knowledge-checker.pdf" download><Download /> Download PDF</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 pt-12" aria-labelledby="routine-title">
          <p className="text-xs font-extrabold uppercase text-muted-foreground">The 3-step routine</p>
          <h2 id="routine-title" className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Use the sheet without fooling yourself
          </h2>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-relaxed text-muted-foreground">
            Keep the stages separate. The closed-book bit only works if the answers stay hidden.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2" role="tablist" aria-label="Knowledge Checker steps">
            {STEPS.map((item, index) => (
              <Button
                key={item.number}
                type="button"
                role="tab"
                aria-selected={activeStep === index}
                aria-controls="step-panel"
                variant="ghost"
                onClick={() => setActiveStep(index)}
                className={cn(
                  "h-auto min-w-0 flex-col gap-2 whitespace-normal rounded-[8px] border px-2 py-4 text-center sm:flex-row sm:px-4",
                  activeStep === index
                    ? "border-checker-ink bg-checker-ink text-checker-paper hover:bg-checker-ink hover:text-checker-paper"
                    : "border-checker-line bg-card text-checker-ink hover:bg-checker-mint/20",
                )}
              >
                <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-xs font-black", activeStep === index ? "bg-checker-mint text-checker-ink" : "bg-checker-line text-checker-ink")}>{item.number}</span>
                <span className="text-xs font-extrabold sm:text-sm">{item.short}</span>
              </Button>
            ))}
          </div>

          <div id="step-panel" role="tabpanel" className="mt-3 grid overflow-hidden rounded-[8px] border border-checker-line bg-card shadow-sm md:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-checker-ink p-6 text-checker-paper sm:p-8">
              <StepIcon className="size-8 text-checker-mint" />
              <p className="mt-6 text-xs font-extrabold uppercase text-checker-mint">Step {step.number}</p>
              <h3 className="mt-2 text-2xl font-extrabold">{step.title}</h3>
              <p className="mt-2 font-semibold text-checker-paper/70">{step.strap}</p>
            </div>
            <div className="p-6 sm:p-8">
              <ul className="space-y-3">
                {step.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm font-semibold leading-relaxed">
                    <Check className="mt-0.5 size-4 shrink-0 text-conf-high" strokeWidth={3} /> {point}
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[8px] bg-checker-mint/20 p-4">
                  <p className="flex items-center gap-2 text-xs font-extrabold uppercase"><Check className="size-4" /> Do</p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed">{step.doText}</p>
                </div>
                <div className="rounded-[8px] bg-destructive/10 p-4">
                  <p className="flex items-center gap-2 text-xs font-extrabold uppercase text-destructive"><X className="size-4" /> Don’t</p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed">{step.dontText}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 pt-14" aria-labelledby="demo-title">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase text-muted-foreground">Try a sample row</p>
              <h2 id="demo-title" className="mt-2 text-3xl font-extrabold">Closed book first. Then check.</h2>
            </div>
            <div className="inline-flex self-start rounded-[8px] border border-checker-line bg-card p-1">
              <Button type="button" size="sm" variant="ghost" onClick={() => setDemoOpen(false)} className={cn("rounded-[6px]", !demoOpen && "bg-checker-ink text-checker-paper hover:bg-checker-ink hover:text-checker-paper")}>
                <EyeOff /> Closed book
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setDemoOpen(true)} className={cn("rounded-[6px]", demoOpen && "bg-checker-mint text-checker-ink hover:bg-checker-mint hover:text-checker-ink")}>
                <BookOpen /> Check gaps
              </Button>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[8px] border border-checker-ink bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-checker-ink px-5 py-4 text-checker-paper">
              <div>
                <p className="text-xs font-bold text-checker-mint">REVISION KNOWLEDGE CHECKER</p>
                <p className="mt-1 font-extrabold">GCSE Biology · Enzymes</p>
              </div>
              <span className="rounded-full bg-checker-mint px-3 py-1.5 text-xs font-extrabold text-checker-ink">30 min max</span>
            </div>
            <div className="grid md:grid-cols-[0.75fr_1.25fr]">
              <div className="border-b border-checker-line bg-checker-paper p-5 md:border-b-0 md:border-r">
                <p className="text-xs font-extrabold uppercase text-muted-foreground">Key Components</p>
                <p className="mt-4 text-lg font-extrabold">Enzyme action</p>
                <p className="mt-1 text-sm font-semibold text-muted-foreground">Structure, binding and temperature</p>
              </div>
              <div className="min-h-64 p-5 sm:p-6">
                <p className="text-xs font-extrabold uppercase text-muted-foreground">What I already know</p>
                <ul className="mt-4 space-y-3 text-sm font-semibold leading-relaxed">
                  <li>• Biological catalysts that speed up reactions without being used up</li>
                  <li>• Have an active site</li>
                  {demoOpen ? (
                    <>
                      <li className="gap-reveal"><mark className="box-decoration-clone rounded bg-checker-highlight px-1 text-checker-ink">• Substrate binds using a complementary lock-and-key model</mark></li>
                      <li className="gap-reveal"><mark className="box-decoration-clone rounded bg-checker-highlight px-1 text-checker-ink">• High temperatures denature the active site, changing its shape</mark></li>
                    </>
                  ) : (
                    <li className="rounded-[8px] border border-dashed border-checker-line p-4 text-muted-foreground">Stop here. What else can you retrieve without looking?</li>
                  )}
                </ul>
              </div>
            </div>
            <div className={cn("flex flex-col justify-between gap-2 border-t border-checker-line px-5 py-4 text-sm font-extrabold sm:flex-row sm:items-center", demoOpen ? "bg-checker-highlight/35" : "bg-checker-paper")}>
              <span>{demoOpen ? "2 secure items · 2 highlighted gaps" : "2 recalled items · gaps still hidden"}</span>
              <span className={cn("inline-flex self-start rounded-full px-3 py-1.5 text-xs", demoOpen ? "bg-destructive text-destructive-foreground" : "bg-checker-line text-checker-ink")}>{demoOpen ? "Priority: High — target next" : "Priority: Not checked"}</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 pt-14" aria-labelledby="science-title">
          <p className="text-xs font-extrabold uppercase text-muted-foreground">Why it works</p>
          <h2 id="science-title" className="mt-2 text-3xl font-extrabold">Revision that makes your brain respond</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {SCIENCE.map((item) => (
              <article key={item.label} className="rounded-[8px] border border-checker-line bg-card p-5 shadow-sm">
                <item.icon className="size-6 text-checker-ink" />
                <p className="mt-5 text-xs font-extrabold uppercase text-muted-foreground">{item.label}</p>
                <h3 className="mt-1 text-lg font-extrabold">{item.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-muted-foreground">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 pt-14">
          <div className="grid overflow-hidden rounded-[8px] border border-checker-ink sm:grid-cols-2">
            <div className="bg-card p-6 sm:p-8">
              <p className="text-xs font-extrabold uppercase text-destructive">Myth</p>
              <p className="mt-3 text-xl font-extrabold">“I read my notes five times, so I know it.”</p>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-muted-foreground">Recognition feels familiar, but it does not prove you can produce the answer under exam pressure.</p>
            </div>
            <div className="bg-checker-ink p-6 text-checker-paper sm:p-8">
              <p className="text-xs font-extrabold uppercase text-checker-mint">Science</p>
              <p className="mt-3 text-xl font-extrabold">One brain dump + one honest gap check</p>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-checker-paper/70">Retrieval tests the memory. Highlighting turns every miss into a clear, useful next action.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 pt-14">
          <div className="rounded-[8px] bg-checker-mint p-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
            <div>
              <p className="flex items-center gap-2 text-xl font-extrabold"><Lightbulb className="size-5" /> Ready to target the right topics?</p>
              <p className="mt-2 text-sm font-semibold text-checker-ink/75">Use what your highlighter found to shape your next revision sessions.</p>
            </div>
            <Button asChild size="lg" className="mt-5 bg-checker-ink font-extrabold text-checker-paper hover:bg-checker-ink/90 sm:mt-0">
              <Link to="/auth">Create your plan <ArrowRight /></Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
