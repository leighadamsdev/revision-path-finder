import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, RefreshCw } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useActivePlan, useExams, usePlanTopics } from "@/hooks/useActivePlan";
import { useLibrary } from "@/hooks/useLibrary";
import { useTopicRatings } from "@/hooks/useTopicRatings";
import { usePremium } from "@/hooks/usePremium";
import { PremiumTag } from "@/components/PremiumGate";
import { supabase } from "@/integrations/supabase/client";

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
  body: string;
  /** Where the step is done in the app. */
  to: To;
  /** Button label when this is the student's next step. */
  cta: string;
  done: boolean;
  /** Something students keep doing rather than finish once: shown with a repeat icon. */
  ongoing?: boolean;
  /** Part of Premium: free students are sent to the Upgrade page instead. */
  premium?: boolean;
};

/**
 * The steps on the home page (four to set up, then one to keep doing), each linking to where it's done. For a signed-in student
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
  const inSetup = !plan && Boolean(draft.data);

  const steps: Step[] = [
    {
      title: "Pick your subjects",
      body: "Tick every subject you take and choose your tier and exam board.",
      to: "/library",
      cta: "Add my subjects",
      done: signedIn && hasSubjects,
    },
    {
      title: "Choose and rate your topics",
      body: "Use a ready-made exam board list, upload a photo of your revision guide, or type your own. Then rate each topic red, amber or green: red topics get the most revision time.",
      to: hasTopics ? "/rate-topics" : "/topics",
      cta: hasTopics ? "Rate my topics" : "Choose my topics",
      done: signedIn && hasTopics && hasRatings,
    },
    {
      title: "Get your exam dates",
      body: "Your summer exams are added from the official timetable. Add mocks from your school's website, a printed sheet or a downloaded list.",
      to: plan ? "/exams" : "/setup",
      cta: plan ? "Check my exams" : "Add my exam dates",
      done: signedIn && exams.length > 0,
      premium: true,
    },
    {
      title: "Get your plan",
      body: "A week-by-week timetable that puts your red topics first and adds more sessions as exams get closer, including holidays.",
      to: plan ? "/plan" : "/setup",
      cta: plan ? "Open my plan" : inSetup ? "Carry on with my plan" : "Build my plan",
      done: signedIn && Boolean(plan),
      premium: true,
    },
    {
      title: "Keep checking what you know",
      body: "After you revise a topic, test yourself with the Knowledge Checker or practice exam questions. Then update your confidence rating, so your plan keeps focusing on what you find hardest.",
      to: "/knowledge-checker",
      cta: "Test myself",
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="create-plan-heading" className="text-2xl font-extrabold tracking-tight">
          Create your plan
        </h2>
        {!loading && !signedIn ? (
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/auth" className="text-sm font-bold underline-offset-4 hover:underline">
              Already have an account? Sign in
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup", context: "create-plan", returnTo: "/library" }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow-md hover:brightness-105"
            >
              Sign up free
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </div>
      <div className="relative mt-5 w-full">
        <div
          aria-hidden="true"
          className="absolute bottom-6 left-[26px] top-6 hidden w-0.5 bg-primary sm:block"
        />
        <ol className="space-y-6">
          {steps.map((step, i) => {
            const isNext = i === next;
            const linkProps = signedIn
              ? { to: locked(step) ? ("/upgrade" as const) : step.to }
              : ({
                  to: "/auth",
                  search: { mode: "signup", context: "create-plan", returnTo: step.to },
                } as const);
            return (
              <li key={step.title} className="relative flex items-start">
                <div
                  className={`z-10 hidden h-14 w-14 shrink-0 items-center justify-center rounded-[8px] text-lg font-extrabold shadow-lg sm:flex ${
                    step.done ? "bg-conf-high text-white" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {step.done ? (
                    <Check className="size-6" strokeWidth={3} aria-label="Done" />
                  ) : step.ongoing ? (
                    <RefreshCw className="size-6" strokeWidth={3} aria-label="Keep doing" />
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </div>
                <Link
                  {...linkProps}
                  className={`group block w-full rounded-[8px] bg-structure p-5 text-structure-foreground shadow-lg transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary sm:ml-8 sm:p-6 ${
                    isNext ? "ring-2 ring-primary" : ""
                  } ${step.done && !isNext ? "opacity-80" : ""}`}
                >
                  <div className="mb-3 flex items-center gap-2 sm:hidden">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-[8px] text-sm font-extrabold shadow-md ${
                        step.done ? "bg-conf-high text-white" : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {step.done ? (
                        <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                      ) : step.ongoing ? (
                        <RefreshCw className="size-4" strokeWidth={3} aria-hidden="true" />
                      ) : (
                        String(i + 1).padStart(2, "0")
                      )}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-extrabold tracking-tight">{step.title}</h2>
                    {isNext ? (
                      <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-primary-foreground">
                        {step.ongoing ? "Keep going" : "Next"}
                      </span>
                    ) : step.ongoing ? (
                      <span className="text-[12px] font-bold text-primary">As you revise</span>
                    ) : step.done ? (
                      <span className="text-[12px] font-bold text-conf-high">Done</span>
                    ) : null}
                    {locked(step) ? <PremiumTag /> : null}
                  </div>
                  <p className="mt-1 text-base font-medium leading-relaxed opacity-90">
                    {step.body}
                  </p>
                  {isNext ? (
                    <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground">
                      {locked(step) ? "Upgrade to Premium" : step.cta}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </span>
                  ) : (
                    <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-primary opacity-80 transition-opacity group-hover:opacity-100">
                      {step.ongoing ? step.cta : step.done ? "Review or change" : "Go to this step"}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
        {!loading && !signedIn ? (
          <p className="mt-5 text-[13px] font-semibold text-muted-foreground">
            Sign up free for steps 1 and 2. Premium adds your exam timetable, plan and the Knowledge
            Checker.
          </p>
        ) : null}
      </div>
    </section>
  );
}
