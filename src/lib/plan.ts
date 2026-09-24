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
  daysToNextExam,
  orderTopics,
  PIN_WINDOW_DAYS,
  pinUrgent,
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
  weekly_minutes_budget: number | null;
  holiday_boost: boolean;
  pre_exam_boost: boolean;
  pre_exam_weeks: number;
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
  completed_at: string | null;
  kind: string;
  pinned: boolean;
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
      "id, name, weeks, days_per_week, study_days, sessions_per_day, session_length_minutes, day_plan, content_mode, created_at, start_date, share_token, intensity_weeks, intensity_sessions_per_day, holiday_periods, weekly_minutes_budget, holiday_boost, pre_exam_boost, pre_exam_weeks",
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
      "id, plan_id, week_number, day_label, session_slot, subject_id, topic_text, confidence_before, confidence, gap_notes, length_minutes, completed_at, kind, pinned",
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

type Slot = {
  week: number;
  day: string;
  slot: number;
  subjectId: string;
  minutes: number;
  pinned: boolean;
};

/** Opt-in capacity controls saved on the plan. */
export type Capacity = {
  weeklyMinutesBudget?: number | null;
  holidayBoost?: boolean;
  preExamBoost?: boolean;
  preExamWeeks?: number;
};

type ScheduleInput = {
  startDate: string;
  weeks: number;
  days: DaySetting[];
  subjects: SubjectWeighting[];
  /** Heavier study in the final weeks before the first exam. */
  intensity?: Intensity | null;
  /** Holiday stretches with their own daily pattern. */
  holidays?: HolidayPeriod[] | null;
  capacity?: Capacity | null;
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
    return Math.max(0, holiday.sessions) + (input.capacity?.holidayBoost ? 1 : 0);
  }

  let count = baseSessions;

  if (input.intensity && input.intensity.weeks > 0 && firstExam) {
    const gap = differenceInCalendarDays(parseISO(firstExam), date);
    if (gap >= 0 && gap <= input.intensity.weeks * 7 && baseSessions > 0) {
      count = Math.max(0, input.intensity.sessions);
    }
  }

  // Pre-exam boost: one extra session a day inside N weeks of any upcoming exam.
  const cap = input.capacity;
  if (cap?.preExamBoost && count > 0) {
    const gap = daysToNextExam(
      input.subjects.flatMap((s) => s.examDates ?? []),
      date,
    );
    if (gap != null && gap <= (cap.preExamWeeks ?? 4) * 7) count += 1;
  }

  return count;
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
    // Optional weekly time budget: trim the busiest days first.
    const budget = input.capacity?.weeklyMinutesBudget;
    if (budget && budget > 0) {
      let total = daySlots.reduce((sum, s) => sum + s.minutes, 0);
      while (total > budget && daySlots.length > 1) {
        const perDay = new Map<string, number>();
        daySlots.forEach((s) => perDay.set(s.day, (perDay.get(s.day) ?? 0) + 1));
        const busiest = [...perDay.entries()].sort((a, b) => b[1] - a[1])[0]![0];
        const idx = daySlots.map((s) => s.day).lastIndexOf(busiest);
        total -= daySlots[idx]!.minutes;
        daySlots.splice(idx, 1);
      }
    }
    if (daySlots.length === 0) continue;
    const weights = subjects.map((subject) => weekWeight(input.startDate, subject, week));
    const assigned = allocateWeek(subjects, daySlots.length, weights, credit);
    const pinFor = daySlots.map((entry) => {
      const date = planDayDate(input.startDate, week, entry.day);
      if (!date) return null;
      let best: string | null = null;
      let bestGap = Infinity;
      for (const subject of subjects) {
        const gap = daysToNextExam(subject.examDates, date);
        if (gap != null && gap <= PIN_WINDOW_DAYS && gap < bestGap) {
          bestGap = gap;
          best = subject.subjectId;
        }
      }
      return best;
    });
    const { ids, pinned } = pinUrgent(assigned, pinFor);
    daySlots.forEach((entry, i) => {
      slots.push({
        week,
        day: entry.day,
        slot: entry.slot,
        subjectId: ids[i] ?? subjects[0]!.subjectId,
        minutes: entry.minutes,
        pinned: pinned[i] ?? false,
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
    topics: (draft.chosenTopics?.[subjectId] ?? []).map((topic) => ({
      topic,
      confidence: draft.topicConfidence?.[subjectId]?.[topic] ?? null,
    })),
  }));
}

/** Every topic saved against a plan, with its rating. */
export async function fetchPlanTopics(planId: string): Promise<PlanTopic[]> {
  const { data, error } = await supabase
    .from("plan_topics")
    .select("id, subject_id, topic, confidence, is_priority, position")
    .eq("plan_id", planId)
    .order("position");
  if (error) throw error;
  return (data ?? []) as unknown as PlanTopic[];
}

/** Replaces a plan's topic list and ratings. */
export async function savePlanTopics(
  planId: string,
  topics: Array<{
    subjectId: string;
    topic: string;
    confidence: number | null;
    isPriority: boolean;
  }>,
) {
  const { error: deleteError } = await supabase
    .from("plan_topics")
    .delete()
    .eq("plan_id", planId);
  if (deleteError) throw deleteError;
  if (!topics.length) return;
  const { error } = await supabase.from("plan_topics").insert(
    topics.map((entry, index) => ({
      plan_id: planId,
      subject_id: entry.subjectId,
      topic: entry.topic,
      confidence: entry.confidence,
      is_priority: entry.isPriority,
      position: index,
    })),
  );
  if (error) throw error;
}

/** The topic rows a draft wants saved, flattened. */
function draftTopicRows(draft: PlanDraft) {
  const rows: Array<{
    subjectId: string;
    topic: string;
    confidence: number | null;
    isPriority: boolean;
  }> = [];
  for (const subjectId of draft.subjectIds) {
    const topics = draft.chosenTopics?.[subjectId] ?? [];
    const priorities = draft.priorityTopics?.[subjectId] ?? [];
    for (const topic of topics) {
      rows.push({
        subjectId,
        topic,
        confidence: draft.topicConfidence?.[subjectId]?.[topic] ?? null,
        isPriority: priorities.includes(topic),
      });
    }
  }
  return rows;
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
      intensity_weeks: draft.intensity?.weeks ?? null,
      intensity_sessions_per_day: draft.intensity?.sessions ?? null,
      holiday_periods: draft.holidays ?? [],
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

  await savePlanTopics(planId, draftTopicRows(draft));

  const slots = buildSchedule({
    startDate: draft.startDate,
    weeks: draft.weeks,
    days: draft.days,
    subjects: draftWeightings(draft),
    intensity: draft.intensity ?? null,
    holidays: draft.holidays ?? [],
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
      pinned: slot.pinned,
    };
  });

  const { error: sessionError } = await supabase.from("sessions").insert(rows);
  if (sessionError) throw sessionError;

  return planId;
}

async function buildTopics(draft: PlanDraft, slots: Slot[]) {
  const result: Record<string, string[]> = {};

  // Topics ticked from the GCSE checklist always win: priorities first, shakiest next.
  for (const [subjectId, topics] of Object.entries(draft.chosenTopics ?? {})) {
    if (topics.length) {
      const priorities = draft.priorityTopics?.[subjectId] ?? [];
      result[subjectId] = orderTopics(
        topics.map((topic) => ({
          topic,
          confidence: draft.topicConfidence?.[subjectId]?.[topic] ?? null,
          isPriority: priorities.includes(topic),
        })),
      );
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
  settings: {
    name: string;
    startDate: string;
    weeks: number;
    days: DaySetting[];
    intensity?: Intensity | null;
    holidays?: HolidayPeriod[];
  },
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
      intensity_weeks: settings.intensity?.weeks ?? null,
      intensity_sessions_per_day: settings.intensity?.sessions ?? null,
      holiday_periods: settings.holidays ?? [],
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
    intensity?: Intensity | null;
    holidays?: HolidayPeriod[];
  },
) {
  const existing = await fetchSessions(planId);
  const savedTopics = await fetchPlanTopics(planId);
  const { data: capRow } = await supabase
    .from("plans")
    .select("weekly_minutes_budget, holiday_boost, pre_exam_boost, pre_exam_weeks")
    .eq("id", planId)
    .maybeSingle();
  const completed = new Map<string, string>();
  for (const session of existing) {
    if (session.completed_at) {
      completed.set(`${session.week_number}|${session.day_label}|${session.session_slot}`, session.completed_at);
    }
  }

  const notes = new Map<string, string>();
  const topicsBySubject: Record<string, string[]> = {};

  // Topics the student chose (with their ratings) set the order for each subject.
  for (const subject of settings.subjects) {
    const own = savedTopics.filter((row) => row.subject_id === subject.subjectId);
    if (own.length) {
      topicsBySubject[subject.subjectId] = orderTopics(
        own.map((row) => ({
          topic: row.topic,
          confidence: row.confidence,
          isPriority: row.is_priority,
        })),
      );
    }
  }

  for (const session of existing) {
    if (session.gap_notes) {
      notes.set(`${session.week_number}|${session.day_label}|${session.session_slot}`, session.gap_notes);
    }
    const chosen = savedTopics.some((row) => row.subject_id === session.subject_id);
    if (session.subject_id && session.topic_text && !chosen) {
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
    intensity: settings.intensity ?? null,
    holidays: settings.holidays ?? [],
    capacity: capRow
      ? {
          weeklyMinutesBudget: capRow.weekly_minutes_budget,
          holidayBoost: capRow.holiday_boost,
          preExamBoost: capRow.pre_exam_boost,
          preExamWeeks: capRow.pre_exam_weeks,
        }
      : null,
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
      pinned: slot.pinned,
      completed_at: completed.get(`${slot.week}|${slot.day}|${slot.slot}`) ?? null,
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
  const { error: topicError } = await supabase.from("plan_topics").delete().eq("plan_id", planId);
  if (topicError) throw topicError;
  const { error: sessionError } = await supabase.from("sessions").delete().eq("plan_id", planId);
  if (sessionError) throw sessionError;
  const { error: linkError } = await supabase.from("plan_subjects").delete().eq("plan_id", planId);
  if (linkError) throw linkError;
  const { error } = await supabase.from("plans").delete().eq("id", planId);
  if (error) throw error;
}

/** Saves the opt-in capacity controls (weekly budget and the two boosts). */
export async function updatePlanCapacity(planId: string, capacity: Capacity) {
  const { error } = await supabase
    .from("plans")
    .update({
      weekly_minutes_budget: capacity.weeklyMinutesBudget ?? null,
      holiday_boost: Boolean(capacity.holidayBoost),
      pre_exam_boost: Boolean(capacity.preExamBoost),
      pre_exam_weeks: capacity.preExamWeeks ?? 4,
    })
    .eq("id", planId);
  if (error) throw error;
}
