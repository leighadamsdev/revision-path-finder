import { differenceInCalendarDays, format, parseISO } from "date-fns";

import { supabase } from "@/integrations/supabase/client";
import { generateTopics } from "@/lib/revision.functions";
import { catalogueSubject } from "@/lib/gcse-subjects";
import { subjectUnits } from "@/lib/gcse-topics";
import { examDateColumns, examDateList } from "@/lib/exam-dates";
import { planDayDate } from "@/lib/plan-dates";
import { WEEK_DAYS } from "@/lib/subjects";
import {
  allocateWeek,
  orderTopics,
  weekWeight,
  type SubjectWeighting,
} from "@/lib/scheduling";

export type Subject = {
  id: string;
  name: string;
  exam_board: string;
  color_key: string;
  is_custom: boolean;
};

/** A subject as it sits inside one plan: tier, exam dates and confidence are per plan. */
export type PlanSubject = Subject & {
  tier: string | null;
  exam_date: string | null;
  exam_date_2: string | null;
  exam_date_3: string | null;
  /** All the subject's exam dates, oldest first (up to three). */
  exam_dates: string[];
  confidence: number | null;
};


export type DaySetting = { day: string; sessions: number; minutes: number };

/** A manually entered holiday stretch with its own daily pattern. */
export type HolidayPeriod = {
  name: string;
  start: string;
  end: string;
  /** Days of the week studied during the holiday. */
  days: string[];
  sessions: number;
};

/** Heavier (or lighter) study in the final weeks before the first exam. */
export type Intensity = { weeks: number; sessions: number };

/** One topic inside a plan, with its own confidence rating. */
export type PlanTopic = {
  id: string;
  subject_id: string;
  topic: string;
  confidence: number | null;
  is_priority: boolean;
  position: number;
};

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
  start_date: string;
  share_token: string | null;
  intensity_weeks: number | null;
  intensity_sessions_per_day: number | null;
  holiday_periods: HolidayPeriod[];
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
      "id, name, weeks, days_per_week, study_days, sessions_per_day, session_length_minutes, day_plan, content_mode, created_at, start_date, share_token, intensity_weeks, intensity_sessions_per_day, holiday_periods",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as Plan[]).map((plan) => ({
    ...plan,
    holiday_periods: Array.isArray(plan.holiday_periods) ? plan.holiday_periods : [],
  }));
}

/** Turns sharing on for a plan and returns the new share token. */
export async function enablePlanShare(planId: string): Promise<string> {
  const token = crypto.randomUUID();
  const { error } = await supabase.from("plans").update({ share_token: token }).eq("id", planId);
  if (error) throw error;
  return token;
}

/** Turns sharing off — the old link immediately stops working. */
export async function disablePlanShare(planId: string) {
  const { error } = await supabase.from("plans").update({ share_token: null }).eq("id", planId);
  if (error) throw error;
}

export async function fetchPlanSubjects(planId: string): Promise<PlanSubject[]> {
  const { data, error } = await supabase
    .from("plan_subjects")
    .select(
      "tier, exam_date, exam_date_2, exam_date_3, confidence, subjects(id, name, exam_board, color_key, is_custom)",
    )
    .eq("plan_id", planId);
  if (error) throw error;
  return (data ?? [])
    .map((row) => {
      const link = row as unknown as {
        tier: string | null;
        exam_date: string | null;
        exam_date_2: string | null;
        exam_date_3: string | null;
        confidence: number | null;
        subjects: Subject | null;
      };
      if (!link.subjects) return null;
      return {
        ...link.subjects,
        tier: link.tier,
        exam_date: link.exam_date,
        exam_date_2: link.exam_date_2,
        exam_date_3: link.exam_date_3,
        exam_dates: examDateList(link),
        confidence: link.confidence,
      } satisfies PlanSubject;
    })
    .filter((s): s is PlanSubject => Boolean(s));
}

/** Saves exam dates and/or a confidence rating for one subject in one plan. */
export async function updatePlanSubjectMeta(
  planId: string,
  subjectId: string,
  patch: { examDates?: string[]; confidence?: number | null },
) {
  const { error } = await supabase
    .from("plan_subjects")
    .update({
      ...(patch.examDates ? examDateColumns(patch.examDates) : {}),
      ...(patch.confidence !== undefined ? { confidence: patch.confidence } : {}),
    })
    .eq("plan_id", planId)
    .eq("subject_id", subjectId);
  if (error) throw error;
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
  startDate: string;
  weeks: number;
  /** One entry per study day, each with its own session count and length. */
  days: DaySetting[];
  contentMode: "ai" | "manual" | "library";
  subjectIds: string[];
  /** Foundation / Higher per subject id, where the subject is tiered. */
  tiers?: Record<string, string | null>;
  /** Up to three optional exam dates (yyyy-MM-dd) per subject id. */
  examDates?: Record<string, string[]>;

  /** Optional 1–5 confidence per subject id, used when no topics were chosen. */
  confidence?: Record<string, number | null>;
  /** Topics the student ticked from the GCSE checklist, per subject id. */
  chosenTopics?: Record<string, string[]>;
  /** Up to three chosen topics per subject to place in the earliest available sessions. */
  priorityTopics?: Record<string, string[]>;
  /** Optional 1–5 confidence per topic, keyed by subject id then topic. */
  topicConfidence?: Record<string, Record<string, number | null>>;
  /** Heavier study in the final weeks before the first exam. */
  intensity?: Intensity | null;
  /** Manually entered holiday stretches. */
  holidays?: HolidayPeriod[];
};

type Slot = { week: number; day: string; slot: number; subjectId: string; minutes: number };

type ScheduleInput = {
  startDate: string;
  weeks: number;
  days: DaySetting[];
  subjects: SubjectWeighting[];
  /** Heavier study in the final weeks before the first exam. */
  intensity?: Intensity | null;
  /** Holiday stretches with their own daily pattern. */
  holidays?: HolidayPeriod[] | null;
};

/** The earliest exam date across every subject in the plan, if any. */
function firstExamDate(subjects: SubjectWeighting[]): string | null {
  const dates = subjects.flatMap((subject) => subject.examDates ?? []).filter(Boolean).sort();
  return dates[0] ?? null;
}

/**
 * How many sessions one calendar day gets: a holiday pattern wins, then the
 * pre-exam intensity window, then the student's ordinary term-time pattern.
 */
function sessionsForDay(
  date: Date,
  day: string,
  baseSessions: number,
  input: ScheduleInput,
  firstExam: string | null,
) {
  const iso = format(date, "yyyy-MM-dd");

  const holiday = (input.holidays ?? []).find(
    (period) => period.start && period.end && iso >= period.start && iso <= period.end,
  );
  if (holiday) {
    if (holiday.days.length && !holiday.days.includes(day)) return 0;
    return Math.max(0, holiday.sessions);
  }

  if (input.intensity && input.intensity.weeks > 0 && firstExam) {
    const gap = differenceInCalendarDays(parseISO(firstExam), date);
    if (gap >= 0 && gap <= input.intensity.weeks * 7 && baseSessions > 0) {
      return Math.max(0, input.intensity.sessions);
    }
  }

  return baseSessions;
}

/**
 * Lays out every session slot in the plan and decides which subject each one belongs to,
 * favouring low-confidence subjects and subjects with an exam coming up.
 */
export function buildSchedule(input: ScheduleInput): Slot[] {
  const subjects = input.subjects.filter((s) => s.subjectId);
  if (subjects.length === 0) return [];

  const slots: Slot[] = [];
  const credit: Record<string, number> = {};
  const firstExam = firstExamDate(subjects);
  const byDay = new Map(input.days.map((entry) => [entry.day, entry]));
  const fallbackMinutes = input.days[0]?.minutes ?? 45;

  for (let week = 1; week <= input.weeks; week += 1) {
    const daySlots: Array<{ day: string; slot: number; minutes: number }> = [];
    for (const day of WEEK_DAYS) {
      const config = byDay.get(day);
      const date = planDayDate(input.startDate, week, day);
      const count = date
        ? sessionsForDay(date, day, config?.sessions ?? 0, input, firstExam)
        : (config?.sessions ?? 0);
      for (let slot = 1; slot <= count; slot += 1) {
        daySlots.push({ day, slot, minutes: config?.minutes ?? fallbackMinutes });
      }
    }
    if (daySlots.length === 0) continue;
    const weights = subjects.map((subject) => weekWeight(input.startDate, subject, week));
    const assigned = allocateWeek(subjects, daySlots.length, weights, credit);
    daySlots.forEach((entry, i) => {
      slots.push({
        week,
        day: entry.day,
        slot: entry.slot,
        subjectId: assigned[i] ?? subjects[0]!.subjectId,
        minutes: entry.minutes,
      });
    });
  }
  return slots;
}

function draftWeightings(draft: PlanDraft): SubjectWeighting[] {
  return draft.subjectIds.map((subjectId) => ({
    subjectId,
    examDates: draft.examDates?.[subjectId] ?? [],
    confidence: draft.confidence?.[subjectId] ?? null,
  }));
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
      start_date: draft.startDate,
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
      ...examDateColumns(draft.examDates?.[subjectId] ?? []),
      confidence: draft.confidence?.[subjectId] ?? null,
    })),
  );

  if (linkError) throw linkError;

  const slots = buildSchedule({
    startDate: draft.startDate,
    weeks: draft.weeks,
    days: draft.days,
    subjects: draftWeightings(draft),
  });
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

/** Regenerates a single session's topic. */
export async function regenerateSessionTopic(session: SessionRow, subject: Subject) {
  const { data: existing } = await supabase
    .from("sessions")
    .select("topic_text")
    .eq("plan_id", session.plan_id)
    .eq("subject_id", subject.id);

  const avoid = (existing ?? []).map((row) => row.topic_text as string).filter(Boolean);

  const { topics } = await generateTopics({
    data: {
      subject: subject.name,
      count: 1,
      weakTopics: [],
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
  userId: string,
  known: Subject[],
): Promise<string> {
  const match = known.find((s) => s.name.toLowerCase() === name.toLowerCase());
  if (match) return match.id;

  const { data, error } = await supabase
    .from("subjects")
    .insert({
      name,
      exam_board: "Not specified",
      is_custom: true,
      created_by: userId,
      color_key: catalogueSubject(name)?.colorKey ?? "media",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updatePlanDetails(planId: string, name: string, startDate: string) {
  const { error } = await supabase
    .from("plans")
    .update({ name: name.trim() || "My revision plan", start_date: startDate })
    .eq("id", planId);
  if (error) throw error;
}

/** Saves plan-wide settings (name, start date, weeks, study days and session lengths). */
export async function updatePlanSettings(
  planId: string,
  settings: { name: string; startDate: string; weeks: number; days: DaySetting[] },
) {
  const { error } = await supabase
    .from("plans")
    .update({
      name: settings.name.trim() || "My revision plan",
      start_date: settings.startDate,
      weeks: settings.weeks,
      days_per_week: settings.days.length,
      study_days: settings.days.map((d) => d.day),
      sessions_per_day: Math.max(...settings.days.map((d) => d.sessions), 1),
      session_length_minutes: settings.days[0]?.minutes ?? 45,
      day_plan: settings.days,
    })
    .eq("id", planId);
  if (error) throw error;
}

/**
 * Rebuilds the session grid after a settings change, reusing the topics already in the plan
 * and keeping any "gaps to revisit" notes that sit in the same week / day / slot.
 */
export async function regeneratePlanSessions(
  planId: string,
  settings: {
    startDate: string;
    weeks: number;
    days: DaySetting[];
    subjects: Array<SubjectWeighting & { name: string }>;
  },
) {
  const existing = await fetchSessions(planId);

  const notes = new Map<string, string>();
  const topicsBySubject: Record<string, string[]> = {};
  for (const session of existing) {
    if (session.gap_notes) {
      notes.set(`${session.week_number}|${session.day_label}|${session.session_slot}`, session.gap_notes);
    }
    if (session.subject_id && session.topic_text) {
      const pool = (topicsBySubject[session.subject_id] ??= []);
      if (!pool.includes(session.topic_text)) pool.push(session.topic_text);
    }
  }

  // Subjects newly added to the plan need a topic pool of their own.
  for (const subject of settings.subjects) {
    if (topicsBySubject[subject.subjectId]?.length) continue;
    const units = subjectUnits(subject.name).flatMap((unit) =>
      unit.elements.map((element) =>
        element.detail ? `${element.label}: ${element.detail}` : element.label,
      ),
    );
    topicsBySubject[subject.subjectId] = units.length
      ? units
      : await fetchLibraryTopics(subject.subjectId);
  }

  const slots = buildSchedule({
    startDate: settings.startDate,
    weeks: settings.weeks,
    days: settings.days,
    subjects: settings.subjects,
  });

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
      gap_notes: notes.get(`${slot.week}|${slot.day}|${slot.slot}`) ?? "",
      length_minutes: slot.minutes,
    };
  });

  const { error: deleteError } = await supabase.from("sessions").delete().eq("plan_id", planId);
  if (deleteError) throw deleteError;
  if (rows.length) {
    const { error: insertError } = await supabase.from("sessions").insert(rows);
    if (insertError) throw insertError;
  }
}

/** Adds or removes subjects on an existing plan, keeping tier / dates / confidence values. */
export async function savePlanSubjects(
  planId: string,
  subjects: Array<{
    subjectId: string;
    tier: string | null;
    examDates: string[];
    confidence: number | null;
  }>,
) {

  const { data: current, error } = await supabase
    .from("plan_subjects")
    .select("id, subject_id")
    .eq("plan_id", planId);
  if (error) throw error;

  const keep = new Set(subjects.map((s) => s.subjectId));
  const stale = (current ?? []).filter((row) => !keep.has(row.subject_id as string));
  if (stale.length) {
    const { error: deleteError } = await supabase
      .from("plan_subjects")
      .delete()
      .in("id", stale.map((row) => row.id as string));
    if (deleteError) throw deleteError;
  }

  const existingIds = new Set((current ?? []).map((row) => row.subject_id as string));
  const inserts = subjects.filter((s) => !existingIds.has(s.subjectId));
  if (inserts.length) {
    const { error: insertError } = await supabase.from("plan_subjects").insert(
      inserts.map((s) => ({
        plan_id: planId,
        subject_id: s.subjectId,
        tier: s.tier,
        ...examDateColumns(s.examDates),
        confidence: s.confidence,
      })),
    );
    if (insertError) throw insertError;
  }

  for (const subject of subjects.filter((s) => existingIds.has(s.subjectId))) {
    const { error: updateError } = await supabase
      .from("plan_subjects")
      .update({
        tier: subject.tier,
        ...examDateColumns(subject.examDates),
        confidence: subject.confidence,
      })
      .eq("plan_id", planId)
      .eq("subject_id", subject.subjectId);

    if (updateError) throw updateError;
  }
}

/** Permanently deletes a plan along with its sessions and subject links. */
export async function deletePlan(planId: string) {
  const { error: sessionError } = await supabase.from("sessions").delete().eq("plan_id", planId);
  if (sessionError) throw sessionError;
  const { error: linkError } = await supabase.from("plan_subjects").delete().eq("plan_id", planId);
  if (linkError) throw linkError;
  const { error } = await supabase.from("plans").delete().eq("id", planId);
  if (error) throw error;
}
