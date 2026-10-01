import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useActivePlan, usePlanSessions } from "@/hooks/useActivePlan";
import { supabase } from "@/integrations/supabase/client";

type Action = { eyebrow: string; title: string; body: string; cta: string; to: "/setup" | "/plan"; step?: number };

/** State-aware "what to do next" card shown on the home page and timetable. */
export function NextBestAction({ hideTimetableLink = false }: { hideTimetableLink?: boolean }) {
  const { user, loading } = useAuth();
  const { plan, isLoading } = useActivePlan();
  const sessions = usePlanSessions(plan?.id).data ?? [];
  const draft = useQuery({
    queryKey: ["setup-draft", user?.id],
    enabled: Boolean(user) && !plan,
    queryFn: async () => {
      const { data } = await supabase.from("setup_drafts").select("data").eq("user_id", user!.id).maybeSingle();
      return (data?.data ?? null) as { step?: number; picks?: unknown[] } | null;
    },
  });

  if (loading || (user && isLoading)) return null;

  let a: Action;
  if (!user || !plan) {
    const d = draft.data;
    const step1Done = d && Array.isArray(d.picks) && d.picks.length > 0 && (d.step ?? 1) !== 1;
    a = step1Done
      ? { eyebrow: "Plan setup: 1 of 5 done", title: "Create your Quick Plan", body: "You're ready to create your timetable. You can personalise it later.", cta: "Carry on", to: "/setup" }
      : d
        ? { eyebrow: "Plan setup in progress", title: "Carry on with your plan", body: "We saved your answers. Pick up exactly where you left off.", cta: "Continue setup", to: "/setup" }
        : { eyebrow: "Next best action", title: "Start your plan", body: "Add your subjects, exam dates and free time — that's all you need for a first timetable.", cta: "Start your plan", to: "/setup" };
  } else if (plan.plan_type === "quick") {
    a = { eyebrow: "Next: add your topics", title: "Add topics to personalise your timetable", body: "Step 2 is optional, but topics let us plan exactly what to revise in each session.", cta: "Add topics", to: "/setup", step: 2 };
  } else if (plan.plan_type === "topic") {
    a = { eyebrow: "Optional: improve your plan", title: "Complete your knowledge check", body: "Rate each topic so we can put your weakest ones first. Priorities unlock after you finish it.", cta: "Check what I know", to: "/setup", step: 2 };
  } else {
    const today = sessions.find((s) => !s.completed_at && !s.missed_at);
    if (hideTimetableLink && !today) return null;
    a = { eyebrow: "Next best action", title: "Start today's revision session", body: today ? `Up next: ${today.topic_text || "your next session"}.` : "Open your timetable to see what's next.", cta: "Go to my timetable", to: "/plan" };
    if (hideTimetableLink) a = { ...a, cta: "Scroll to today", to: "/plan" };
  }

  return (
    <section aria-label="Next best action" className="mb-5 rounded-[18px] bg-structure p-4 text-background print:hidden sm:p-5">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-primary">{a.eyebrow}</p>
      <p className="mt-1 text-lg font-extrabold tracking-tight">{a.title}</p>
      <p className="mt-1 text-[13px] font-medium opacity-85">{a.body}</p>
      {a.to === "/plan" && hideTimetableLink ? null : (
        <Link
          to={a.to}
          {...(a.step ? { search: { step: a.step } } : {})}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground"
        >
          {a.cta} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </section>
  );
}
