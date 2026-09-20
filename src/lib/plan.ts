import { supabase } from "@/integrations/supabase/client";
import { generateTopics } from "@/lib/revision.functions";
import { catalogueSubject } from "@/lib/gcse-subjects";
import { subjectUnits } from "@/lib/gcse-topics";

export type Subject = {
  id: string;
  name: string;
  exam_board: string;
  color_key: string;
  is_custom: boolean;
};

export type DaySetting = { day: string; sessions: number; minutes: number };

export type Plan = {
  id: string;
  name: string;
  weeks: number;
  days_per_week: number;
  study_days: string[];
  sessions_per_day: number;
  session_length_minutes: number;
  day_plan: DaySetting[] | null;
  content_mode: "ai" | "manual" | "library";
  created_at: string;
};

export type SessionRow = {
  id: string;
  plan_id: string;
  week_number: number;
  day_label: string;
  session_slot: number;
  subject_id: string | null;
  topic_text: string;
  confidence_before: number | null;
  confidence: number | null;
  gap_notes: string;
  length_minutes: number | null;
};

export async function fetchSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, exam_board, color_key, is_custom")
    .order("name")
    .order("exam_board");
  if (error) throw error;
  return data ?? [];
}

export async function fetchPlans(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from("plans")
    .select(
      "id, name, weeks, days_per_week, study_days, sessions_per_day, session_length_minutes, day_plan, content_mode, created_at",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Plan[];
}

export async function fetchPlanSubjects(planId: string): Promise<Subject[]> {
  const { data, error } = await supabase
    .from("plan_subjects")
    .select("subjects(id, name, exam_board, color_key, is_custom)")
    .eq("plan_id", planId);
  if (error) throw error;
  return (data ?? [])
    .map((row) => (row as { subjects: Subject | null }).subjects)
    .filter((s): s is Subject => Boolean(s));
}

export async function fetchSessions(planId: string): Promise<SessionRow[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select(
      "id, plan_id, week_number, day_label, session_slot, subject_id, topic_text, confidence_before, confidence, gap_notes, length_minutes",
    )
    .eq("plan_id", planId)
    .order("week_number")
    .order("session_slot");
  if (error) throw error;
  return (data ?? []) as SessionRow[];
}

export async function fetchLibraryTopics(subjectId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("topic_library")
    .select("topic, position")
    .eq("subject_id", subjectId)
    .order("position");
  if (error) throw error;
  return (data ?? []).map((row) => row.topic as string);
}

export type PlanDraft = {
  name: string;
  weeks: number;
  /** One entry per study day, each with its own session count and length. */
  days: DaySetting[];
  contentMode: "ai" | "manual" | "library";
  subjectIds: string[];
  /** Foundation / Higher per subject id, where the subject is tiered. */
  tiers?: Record<string, string | null>;
  /** Topics the student ticked from the GCSE checklist, per subject id. */
  chosenTopics?: Record<string, string[]>;
  /** Up to three chosen topics per subject to place in the earliest available sessions. */
  priorityTopics?: Record<string, string[]>;
};

type Slot = { week: number; day: string; slot: number; subjectId: string; minutes: number };

function buildSlots(draft: PlanDraft): Slot[] {
  const slots: Slot[] = [];
  let index = 0;
  for (let week = 1; week <= draft.weeks; week += 1) {
    for (const day of draft.days) {
      for (let slot = 1; slot <= day.sessions; slot += 1) {
        const subjectId = draft.subjectIds[index % draft.subjectIds.length]!;
        slots.push({ week, day: day.day, slot, subjectId, minutes: day.minutes });
        index += 1;
      }
    }
  }
  return slots;
}

/** Creates the plan, its subject links and every session row. */
export async function createPlan(profileId: string, draft: PlanDraft) {
  const maxSessions = Math.max(...draft.days.map((d) => d.sessions), 1);
  const firstLength = draft.days[0]?.minutes ?? 45;

  const { data: plan, error } = await supabase
    .from("plans")
    .insert({
      profile_id: profileId,
      name: draft.name,
      weeks: draft.weeks,
      days_per_week: draft.days.length,
      study_days: draft.days.map((d) => d.day),
      sessions_per_day: maxSessions,
      session_length_minutes: firstLength,
      day_plan: draft.days,
      content_mode: draft.contentMode,
    })
    .select("id")
    .single();
  if (error) throw error;
  const planId = plan.id as string;

  const { error: linkError } = await supabase.from("plan_subjects").insert(
    draft.subjectIds.map((subjectId) => ({
      plan_id: planId,
      subject_id: subjectId,
      tier: draft.tiers?.[subjectId] ?? null,
    })),
  );
  if (linkError) throw linkError;

  const slots = buildSlots(draft);
  const topicsBySubject = await buildTopics(draft, slots);
  const counters: Record<string, number> = {};

  const rows = slots.map((slot) => {
    const used = counters[slot.subjectId] ?? 0;
    counters[slot.subjectId] = used + 1;
    const pool = topicsBySubject[slot.subjectId] ?? [];
    return {
      plan_id: planId,
      week_number: slot.week,
      day_label: slot.day,
      session_slot: slot.slot,
      subject_id: slot.subjectId,
      topic_text: pool.length ? (pool[used % pool.length] ?? "") : "",
      gap_notes: "",
      length_minutes: slot.minutes,
    };
  });

  const { error: sessionError } = await supabase.from("sessions").insert(rows);
  if (sessionError) throw sessionError;

  return planId;
}

async function buildTopics(draft: PlanDraft, slots: Slot[]) {
  const result: Record<string, string[]> = {};

  // Topics ticked from the GCSE checklist always win.
  for (const [subjectId, topics] of Object.entries(draft.chosenTopics ?? {})) {
    if (topics.length) {
      const priorities = (draft.priorityTopics?.[subjectId] ?? []).filter((topic) =>
        topics.includes(topic),
      );
      result[subjectId] = [
        ...priorities,
        ...topics.filter((topic) => !priorities.includes(topic)),
      ];
    }
  }
  if (draft.contentMode === "manual") return result;

  const subjects = await fetchSubjects();
  for (const subjectId of draft.subjectIds) {
    if (result[subjectId]?.length) continue;
    const count = slots.filter((s) => s.subjectId === subjectId).length;
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject || count === 0) continue;

    const documentTopics = subjectUnits(subject.name).flatMap((unit) =>
      unit.elements.map((element) =>
        element.detail ? `${element.label}: ${element.detail}` : element.label,
      ),
    );
    if (documentTopics.length) {
      result[subjectId] = documentTopics;
      continue;
    }

    if (draft.contentMode === "library") {
      result[subjectId] = await fetchLibraryTopics(subjectId);
      continue;
    }

    try {
      const { topics } = await generateTopics({
        data: {
          subject: subject.name,
          examBoard: subject.exam_board,
          count,
          weakTopics: [],
          avoidTopics: [],
        },
      });
      result[subjectId] = topics;
    } catch (error) {
      console.error("AI topic generation failed, falling back to library", error);
      result[subjectId] = await fetchLibraryTopics(subjectId);
    }
  }
  return result;
}

/** Regenerates a single session's topic, weighting the student's weak areas. */
export async function regenerateSessionTopic(session: SessionRow, subject: Subject) {
  const { data: existing } = await supabase
    .from("sessions")
    .select("topic_text, confidence")
    .eq("plan_id", session.plan_id)
    .eq("subject_id", subject.id);

  const weak = (existing ?? [])
    .filter((row) => (row.confidence ?? 5) <= 2 && row.topic_text)
    .map((row) => row.topic_text as string);
  const avoid = (existing ?? []).map((row) => row.topic_text as string).filter(Boolean);

  const { topics } = await generateTopics({
    data: {
      subject: subject.name,
      examBoard: subject.exam_board,
      count: 1,
      weakTopics: weak.slice(0, 10),
      avoidTopics: avoid.slice(0, 60),
    },
  });
  const topic = topics[0] ?? "";
  if (!topic) throw new Error("No topic came back — try again.");

  const { error } = await supabase
    .from("sessions")
    .update({ topic_text: topic, updated_at: new Date().toISOString() })
    .eq("id", session.id);
  if (error) throw error;
  return topic;
}

/** Finds the subject row for a name + board pair, creating a custom one if we don't stock it. */
export async function resolveSubjectId(
  name: string,
  board: string,
  userId: string,
  known: Subject[],
): Promise<string> {
  const match = known.find(
    (s) =>
      s.name.toLowerCase() === name.toLowerCase() &&
      s.exam_board.toLowerCase() === board.toLowerCase(),
  );
  if (match) return match.id;

  const sibling = known.find((s) => s.name.toLowerCase() === name.toLowerCase());
  const { data, error } = await supabase
    .from("subjects")
    .insert({
      name,
      exam_board: board,
      is_custom: true,
      created_by: userId,
      color_key: sibling?.color_key ?? catalogueSubject(name)?.colorKey ?? "media",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}
