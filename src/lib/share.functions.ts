import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type SharedSubject = { id: string; name: string; color_key: string };

export type SharedSession = {
  id: string;
  week_number: number;
  day_label: string;
  session_slot: number;
  subject_id: string | null;
  topic_text: string;
  confidence: number | null;
  gap_notes: string;
  length_minutes: number | null;
};

export type SharedPlan = {
  id: string;
  name: string;
  weeks: number;
  start_date: string;
  study_days: string[];
  session_length_minutes: number;
};

export type SharedPlanPayload = {
  plan: SharedPlan;
  subjects: SharedSubject[];
  sessions: SharedSession[];
};

/**
 * Public, token-gated read of a shared plan. The token is an unguessable UUID that
 * only the plan owner can hand out; anyone without it can't reach the plan at all.
 */
export const getSharedPlan = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ token: z.string().uuid() }).parse(data))
  .handler(async ({ data }): Promise<SharedPlanPayload | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select(
        "id, name, weeks, start_date, study_days, session_length_minutes",
      )
      .eq("share_token", data.token)
      .maybeSingle();
    if (planError || !plan) return null;

    const [subjectsResult, sessionsResult] = await Promise.all([
      supabaseAdmin
        .from("plan_subjects")
        .select("subjects(id, name, color_key)")
        .eq("plan_id", plan.id),
      supabaseAdmin
        .from("sessions")
        .select(
          "id, week_number, day_label, session_slot, subject_id, topic_text, confidence, gap_notes, length_minutes",
        )
        .eq("plan_id", plan.id)
        .order("week_number")
        .order("session_slot"),
    ]);

    const subjects = ((subjectsResult.data ?? []) as { subjects: SharedSubject | null }[])
      .map((row) => row.subjects)
      .filter((s): s is SharedSubject => Boolean(s));

    return {
      plan: plan as unknown as SharedPlan,
      subjects,
      sessions: (sessionsResult.data ?? []) as unknown as SharedSession[],
    };
  });
