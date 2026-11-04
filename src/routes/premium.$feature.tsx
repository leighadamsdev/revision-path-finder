import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  Lock,
  PenLine,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import {
  CheckerExample,
  ExamsExample,
  PlannerExample,
  PracticeExample,
  TutorExample,
} from "@/components/premium/Examples";
import { PremiumTag } from "@/components/PremiumGate";
import { PublicHeader } from "@/components/PublicHeader";
import { useAuth } from "@/hooks/useAuth";
import { PREMIUM_PRICES, usePremium } from "@/hooks/usePremium";
import { PREMIUM_PREVIEWS, type PreviewSlug } from "@/lib/premium-previews";

type Feature = {
  title: string;
  tagline: string;
  icon: LucideIcon;
  points: string[];
  Example: () => ReactNode;
};

const FEATURES: Record<PreviewSlug, Feature> = {
  "knowledge-checker": {
    title: "Knowledge Checker",
    tagline: "Write down what you know from memory, then fill the gaps from your notes.",
    icon: ClipboardCheck,
    points: [
      "Closed-book first, with a timer and focus sounds",
      "Highlight the gaps, and they become flashcards",
      "Save every checker and update your colours afterwards",
    ],
    Example: CheckerExample,
  },
  "exam-timetable": {
    title: "Exam timetable",
    tagline: "Every exam in one place, with a countdown to the next one.",
    icon: CalendarDays,
    points: [
      "Summer exams added for you from the official timetable",
      "Add mocks from a photo, a printed sheet or a list",
      "Your plan gives more time to subjects whose exams are closer",
    ],
    Example: ExamsExample,
  },
  "revision-planner": {
    title: "Revision Planner",
    tagline: "A week-by-week plan built around your hardest topics and the time you have.",
    icon: CalendarRange,
    points: [
      "Red topics come round most, green ones just for a check-up",
      "Fits round your week, with rest days and holidays",
      "Tick sessions off and keep your streak going",
    ],
    Example: PlannerExample,
  },
  "ai-tutor": {
    title: "Build my AI tutor",
    tagline: "Turn ChatGPT, Gemini or similar into a tutor that knows your subjects and topics.",
    icon: Bot,
    points: [
      "Pick your subject, style and the topics you find hardest",
      "RevPlan writes the tutor instructions for you",
      "Paste them into the AI you already use",
    ],
    Example: TutorExample,
  },
  "practice-questions": {
    title: "Practice questions",
    tagline: "Exam-style questions on your topics, with mark schemes, written by your AI.",
    icon: PenLine,
    points: [
      "More questions on red topics, fewer on green",
      "Marks and command words like the real exam",
      "Reveal the mark scheme, print the paper, save the set",
    ],
    Example: PracticeExample,
  },
};

export const Route = createFileRoute("/premium/$feature")({
  loader: ({ params }) => {
    if (!(params.feature in FEATURES)) throw notFound();
  },
  head: ({ params }) => {
    const f = FEATURES[params.feature as PreviewSlug];
    const title = f ? `${f.title}: see an example | RevPlan Premium` : "RevPlan Premium";
    return {
      meta: [
        { title },
        { name: "description", content: f?.tagline ?? "See what RevPlan Premium includes." },
        { property: "og:title", content: title },
        { property: "og:type", content: "website" },
      ],
    };
  },
  component: PreviewPage,
});

function PreviewPage() {
  const { feature } = Route.useParams();
  const { user } = useAuth();
  const content = <Preview slug={feature as PreviewSlug} signedIn={Boolean(user)} />;
  if (user) return <AppShell>{content}</AppShell>;
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <PublicHeader />
      <main className="mx-auto max-w-4xl px-5 pb-20 pt-8">{content}</main>
    </div>
  );
}

function Preview({ slug, signedIn }: { slug: PreviewSlug; signedIn: boolean }) {
  const f = FEATURES[slug];
  const { isPremium } = usePremium();
  const path = PREMIUM_PREVIEWS.find((p) => p.slug === slug)!.path;
  const Icon = f.icon;

  const cta = isPremium ? (
    <Link
      to={path}
      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-primary-foreground"
    >
      Open {f.title} <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  ) : signedIn ? (
    <Link
      to="/upgrade"
      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-primary-foreground"
    >
      Upgrade to Premium <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  ) : (
    <Link
      to="/auth"
      search={{ mode: "signup", context: "create-plan", returnTo: "/upgrade" }}
      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-primary-foreground"
    >
      Sign up free, then upgrade <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center gap-2">
        <PremiumTag />
        <span className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
          Example
        </span>
      </div>
      <div className="mt-3 flex items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-[16px] bg-primary/15 text-primary ring-1 ring-primary/30">
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{f.title}</h1>
          <p className="mt-1 max-w-[56ch] text-[16px] font-medium text-muted-foreground">
            {f.tagline}
          </p>
        </div>
      </div>

      {isPremium ? null : (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[16px] bg-structure p-4 ring-1 ring-primary/50 sm:p-5">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-[15px] font-bold">This is part of Premium</p>
              <p className="text-[13px] font-medium text-muted-foreground">
                Below is an example for a made-up student. Subscribe to Premium to use it with your
                own subjects: {PREMIUM_PRICES.month} a month or {PREMIUM_PRICES.year} a year.
              </p>
            </div>
          </div>
          {cta}
        </div>
      )}

      <section className="relative mt-6" aria-label={`Example of ${f.title}`}>
        <span className="absolute -top-2.5 left-4 z-10 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-primary-foreground">
          Example
        </span>
        <f.Example />
      </section>

      <section className="mt-8" aria-labelledby="what-you-get">
        <h2 id="what-you-get" className="text-xl font-bold">
          What you get
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          {f.points.map((p) => (
            <li
              key={p}
              className="flex items-start gap-2 rounded-[14px] bg-card p-4 text-[14px] font-semibold ring-1 ring-border"
            >
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-5">{cta}</div>
        {isPremium ? null : (
          <p className="mt-2 text-[12px] font-medium text-muted-foreground">
            Premium includes all five features and the weekly summary email. Cancel any time.
          </p>
        )}
      </section>

      <section className="mt-10" aria-labelledby="more-premium">
        <h2
          id="more-premium"
          className="text-[13px] font-extrabold uppercase tracking-wide text-muted-foreground"
        >
          More Premium features
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PREMIUM_PREVIEWS.filter((p) => p.slug !== slug).map((p) => (
            <Link
              key={p.slug}
              to="/premium/$feature"
              params={{ feature: p.slug }}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-card px-4 text-[13px] font-bold ring-1 ring-border hover:ring-primary/60"
            >
              {p.title} <ArrowRight className="size-3.5 text-primary" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
