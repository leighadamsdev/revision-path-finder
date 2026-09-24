import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek } from "date-fns";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Subtopic } from "@/lib/leitner";
import { minutesNeeded, minutesScheduled, subjectRatings } from "@/lib/mastery";
import type { Plan, PlanSubject, PlanTopic, SessionRow } from "@/lib/plan";
import { planDayDate } from "@/lib/plan-dates";
import { WEEK_DAYS } from "@/lib/subjects";

const MAX_PER_WEEK = 2;

/** "You're behind pace for X — add a session?" Never automatic, at most twice a week. */
export function PacePrompts({
  plan,
  subjects,
  topics,
  subtopics,
  sessions,
}: {
  plan: Plan;
  subjects: PlanSubject[];
  topics: PlanTopic[];
  subtopics: Subtopic[];
  sessions: SessionRow[];
}) {
  const queryClient = useQueryClient();
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const prompts = useQuery({
    queryKey: ["pace-prompts", plan.id, weekStart],
    queryFn: async () => {
      const { data } = await supabase
        .from("pace_prompts")
        .select("subject_id, status")
        .eq("plan_id", plan.id)
        .eq("week_start", weekStart);
      return data ?? [];
    },
  });
  if (!prompts.data) return null;

  const answered = new Set(prompts.data.map((p) => p.subject_id));
  const answeredCount = prompts.data.length;
  if (answeredCount >= MAX_PER_WEEK) return null;

  const dateOf = (s: SessionRow) => planDayDate(plan.start_date, s.week_number, s.day_label);
  const behind = subjects
    .filter((s) => !answered.has(s.id))
    .map((subject) => {
      const nextExam = subject.exam_dates.find((d) => d >= format(new Date(), "yyyy-MM-dd")) ?? null;
      if (!nextExam) return null;
      const need = minutesNeeded(subjectRatings(subject.id, topics, subtopics));
      const have = minutesScheduled(subject.id, sessions, dateOf, nextExam, plan.session_length_minutes);
      return need > have ? { subject, need, have } : null;
    })
    .filter(Boolean)
    .slice(0, MAX_PER_WEEK - answeredCount) as Array<{ subject: PlanSubject; need: number; have: number }>;

  if (!behind.length) return null;

  async function respond(subject: PlanSubject, accepted: boolean) {
    try {
      await supabase.from("pace_prompts").upsert(
        { plan_id: plan.id, subject_id: subject.id, week_start: weekStart, status: accepted ? "accepted" : "dismissed" },
        { onConflict: "plan_id,subject_id,week_start" },
      );
      if (accepted) await addSession(plan, subject, sessions);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pace-prompts", plan.id] }),
        queryClient.invalidateQueries({ queryKey: ["sessions", plan.id] }),
      ]);
      if (accepted) toast.success(`Added a ${subject.name} session on your next study day.`);
    } catch {
      toast.error("That didn't save — try again.");
    }
  }

  return (
    <div className="mb-5 space-y-2 print:hidden">
      {behind.map(({ subject }) => (
        <div
          key={subject.id}
          className="flex flex-wrap items-center gap-3 rounded-[14px] bg-card px-4 py-3 ring-1 ring-border"
        >
          <p className="min-w-0 flex-1 text-[13px] font-semibold">
            You're behind pace for <span className="font-extrabold">{subject.name}</span> — add a session?
          </p>
          <button
            type="button"
            onClick={() => void respond(subject, false)}
            className="text-[12px] font-bold text-muted-foreground hover:text-foreground"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={() => void respond(subject, true)}
            className="rounded-full bg-primary px-3.5 py-1.5 text-[12px] font-extrabold text-primary-foreground"
          >
            Add a session
          </button>
        </div>
      ))}
    </div>
  );
}

/** Adds one extra slot on the next study day from tomorrow. */
async function addSession(plan: Plan, subject: PlanSubject, sessions: SessionRow[]) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const key = format(tomorrow, "yyyy-MM-dd");
  for (let week = 1; week <= plan.weeks; week += 1) {
    for (const day of WEEK_DAYS) {
      if (!plan.study_days.includes(day)) continue;
      const date = planDayDate(plan.start_date, week, day);
      if (!date || format(date, "yyyy-MM-dd") < key) continue;
      const slots = sessions.filter((s) => s.week_number === week && s.day_label === day);
      const slot = Math.max(0, ...slots.map((s) => s.session_slot)) + 1;
      const { error } = await supabase.from("sessions").insert({
        plan_id: plan.id,
        week_number: week,
        day_label: day,
        session_slot: slot,
        subject_id: subject.id,
        topic_text: "",
        length_minutes: plan.session_length_minutes,
      });
      if (error) throw error;
      return;
    }
  }
  throw new Error("No study days left in this plan.");
}
