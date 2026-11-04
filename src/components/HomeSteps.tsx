import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Gauge,
  RefreshCw,
  Route,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useActivePlan, useExams, usePlanTopics } from "@/hooks/useActivePlan";
import { useLibrary } from "@/hooks/useLibrary";
import { useTopicRatings } from "@/hooks/useTopicRatings";
import { usePremium } from "@/hooks/usePremium";
import { PremiumTag } from "@/components/PremiumGate";
import { supabase } from "@/integrations/supabase/client";
import { navHref } from "@/lib/premium-previews";

type To =
  | "/library"
  | "/exams"
  | "/topics"
  | "/rate-topics"
  | "/knowledge-checker"
  | "/setup"
  | "/plan"
  | "/upgrade";

type Step = {
  title: string;
  /** One short line: the steps are icon tiles, so keep it under ten words. */
  body: string;
  icon: LucideIcon;
  /** Where the step is done in the app. */
  to: To;
  done: boolean;
  /** Something students keep doing rather than finish once. */
  ongoing?: boolean;
  /** Part of Premium: free students are sent to the Upgrade page instead. */
  premium?: boolean;
};

/**
 * The steps on the home page as compact icon tiles (four to set up, then one to keep doing). For a signed-in student
 * finished steps are ticked and the next one is highlighted with its own button, so there's
 * no separate "what to do next" box. Signed-out visitors are sent to sign up first.
 */
export function HomeSteps() {
  const { user, loading } = useAuth();
  const { plan } = useActivePlan();
  const library = useLibrary();
  const exams = useExams(plan?.id).data ?? [];
  const topics = usePlanTopics(plan?.id).data ?? [];
  const savedRatings = useTopicRatings().ratings;
  const { isPremium } = usePremium();
  const draft = useQuery({
    queryKey: ["setup-draft", user?.id],
    enabled: Boolean(user) && !plan,
    queryFn: async () => {
      const { data } = await supabase
        .from("setup_drafts")
        .select("data")
        .eq("user_id", user!.id)
        .maybeSingle();
      return (data?.data ?? null) as { picks?: unknown[] } | null;
    },
  });

  const signedIn = Boolean(user);
  const hasSubjects =
    library.subjects.length > 0 || Boolean(plan) || (draft.data?.picks?.length ?? 0) > 0;
  const hasTopics = library.subjects.some((s) => s.topics.length > 0) || topics.length > 0;
  const hasRatings =
    topics.some((t) => t.confidence != null) ||
    Object.values(savedRatings).some((subject) => Object.keys(subject).length > 0);

  const steps: Step[] = [
    {
      title: "Pick subjects",
      body: "Your subjects, exam boards and tiers.",
      icon: BookOpen,
      to: "/library",
      done: signedIn && hasSubjects,
    },
    {
      title: "Rate topics",
      body: "Red, amber or green. Red gets most time.",
      icon: Gauge,
      to: hasTopics ? "/rate-topics" : "/topics",
      done: signedIn && hasTopics && hasRatings,
    },
    {
      title: "Add exams",
      body: "Summer exams added for you, plus mocks.",
      icon: CalendarDays,
      to: plan ? "/exams" : "/setup",
      done: signedIn && exams.length > 0,
      premium: true,
    },
    {
      title: "Get your plan",
      body: "Week by week, red topics first.",
      icon: Route,
      to: plan ? "/plan" : "/setup",
      done: signedIn && Boolean(plan),
      premium: true,
    },
    {
      title: "Keep checking",
      body: "Test yourself, then update your colours.",
      icon: RefreshCw,
      to: "/knowledge-checker",
      done: false,
      ongoing: true,
      premium: true,
    },
  ];

  // Signed in: the first set-up step not done yet, then the ongoing "keep checking" step.
  // Signed out: no step is highlighted; the "Create your plan" heading has the sign-up button.
  const next = !signedIn ? -1 : steps.findIndex((s) => !s.done);
  const locked = (step: Step) => Boolean(step.premium) && !isPremium;

  return (
    <section className="mt-8 w-full" aria-labelledby="create-plan-heading">
      <h2 id="create-plan-heading" className="text-2xl font-extrabold tracking-tight">
        5 simple steps
      </h2>
      <ol className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {steps.map((step, i) => {
          const isNext = i === next;
          const Icon = step.icon;
          const linkProps = signedIn
            ? { to: locked(step) ? navHref(step.to, true, true) : step.to }
            : ({
                to: "/auth",
                search: { mode: "signup", context: "create-plan", returnTo: step.to },
              } as const);
          return (
            <li key={step.title} className={step.ongoing ? "col-span-2 sm:col-span-1" : ""}>
              <Link
                {...linkProps}
                className={`group relative flex h-full flex-col gap-3 rounded-[16px] bg-card p-4 ring-1 transition-all hover:-translate-y-0.5 hover:ring-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isNext ? "ring-2 ring-primary" : "ring-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`grid size-11 place-items-center rounded-[12px] ${
                      step.done
                        ? "bg-conf-high text-background"
                        : "bg-primary/12 text-primary ring-1 ring-primary/30"
                    }`}
                  >
                    {step.done ? (
                      <Check className="size-5" strokeWidth={3} aria-label="Done" />
                    ) : (
                      <Icon className="size-5" strokeWidth={2.25} aria-hidden="true" />
                    )}
                  </span>
                  <span className="font-[family-name:var(--font-display)] text-[13px] font-bold text-muted-foreground">
                    {step.ongoing ? "Repeat" : String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <p className="flex flex-wrap items-center gap-1.5 text-[16px] font-bold leading-tight">
                    {step.title}
                  </p>
                  <p className="mt-1 text-[13px] font-medium leading-snug text-muted-foreground">
                    {step.body}
                  </p>
                </div>
                {i === 1 ? (
                  <span className="flex gap-1" aria-hidden="true">
                    <span className="h-1.5 flex-1 rounded-full bg-conf-low" />
                    <span className="h-1.5 flex-1 rounded-full bg-conf-mid" />
                    <span className="h-1.5 flex-1 rounded-full bg-conf-high" />
                  </span>
                ) : null}
                <div className="mt-auto flex items-center justify-between gap-2">
                  {step.premium && !isPremium ? <PremiumTag /> : <span />}
                  {isNext ? (
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-extrabold uppercase text-primary-foreground">
                      Next
                    </span>
                  ) : (
                    <ArrowRight
                      className="size-4 text-primary opacity-60 transition-opacity group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
      {!loading && !signedIn ? (
        <p className="mt-3 text-[12px] font-semibold text-muted-foreground">
          Steps 1 and 2 are free. Premium adds 3, 4 and 5.
        </p>
      ) : null}
    </section>
  );
}
