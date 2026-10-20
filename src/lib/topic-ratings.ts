import { supabase } from "@/integrations/supabase/client";
import { syncFlashcards } from "@/lib/leitner";

/**
 * Red/amber/green (1–5) topic ratings that live outside any plan. Keyed by subject name and
 * the topic text the planner uses, so a rating given here shows up in plan setup and in plans.
 *
 * They're saved to the topic_ratings table. If that table isn't available yet (its migration
 * hasn't been applied), ratings are kept in this browser instead so nothing is lost.
 */
export type TopicRatings = Record<string, Record<string, number>>;

const LOCAL_KEY = "revplan.topicRatings";
let tableMissing = false;

function readLocal(): TopicRatings {
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_KEY) ?? "{}") as TopicRatings;
  } catch {
    return {};
  }
}

function writeLocal(subject: string, topic: string, value: number | null) {
  try {
    const all = readLocal();
    const forSubject = { ...(all[subject] ?? {}) };
    if (value) forSubject[topic] = value;
    else delete forSubject[topic];
    all[subject] = forSubject;
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable */
  }
}

/** True when ratings are only being kept in this browser. */
export function ratingsAreLocalOnly() {
  return tableMissing;
}

function isMissingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "42P01" || error.code === "PGRST205" || /topic_ratings/.test(error.message ?? "")
  );
}

export async function fetchTopicRatings(): Promise<TopicRatings> {
  const local = readLocal();
  const { data, error } = await supabase.from("topic_ratings").select("subject, topic, confidence");
  if (error) {
    if (isMissingTable(error)) {
      tableMissing = true;
      return local;
    }
    throw error;
  }
  tableMissing = false;
  const out: TopicRatings = {};
  for (const row of data ?? []) (out[row.subject] ??= {})[row.topic] = row.confidence;
  // Anything rated in this browser before the table existed is kept too.
  for (const [subject, topics] of Object.entries(local)) {
    for (const [topic, value] of Object.entries(topics)) (out[subject] ??= {})[topic] ??= value;
  }
  return out;
}

/** Saves one rating (null clears it) and copies it onto matching topics in the student's plans. */
export async function saveTopicRating(
  userId: string,
  subject: string,
  topic: string,
  value: number | null,
  options: { updatePlans?: boolean } = {},
) {
  if (tableMissing) writeLocal(subject, topic, value);
  else {
    const { error } = value
      ? await supabase.from("topic_ratings").upsert({
          user_id: userId,
          subject,
          topic,
          confidence: value,
          updated_at: new Date().toISOString(),
        })
      : await supabase
          .from("topic_ratings")
          .delete()
          .eq("user_id", userId)
          .eq("subject", subject)
          .eq("topic", topic);
    if (error) {
      if (!isMissingTable(error)) throw error;
      tableMissing = true;
      writeLocal(subject, topic, value);
    }
  }
  if (options.updatePlans !== false) await updatePlanTopics(subject, topic, value);
}

/** Keeps plan ratings in step: the same topic, in a subject with the same name, gets the same rating. */
async function updatePlanTopics(subject: string, topic: string, value: number | null) {
  const { data } = await supabase
    .from("plan_topics")
    .select("id, plan_id, subjects(name)")
    .eq("topic", topic)
    .eq("excluded", false);
  const rows = (data ?? []).filter((row) => {
    const s = (row as unknown as { subjects: { name: string } | null }).subjects;
    return s?.name.trim().toLowerCase() === subject.trim().toLowerCase();
  });
  if (!rows.length) return;
  await supabase
    .from("plan_topics")
    .update({ confidence: value })
    .in(
      "id",
      rows.map((r) => r.id),
    );
  // Ratings 1–4 make flashcards; keep each affected plan's cards in step.
  for (const planId of new Set(rows.map((r) => r.plan_id)))
    await syncFlashcards(planId).catch(() => undefined);
}
