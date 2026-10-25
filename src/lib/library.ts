import { supabase } from "@/integrations/supabase/client";

export type LibItem = { id: string; topic_id: string; title: string; position: number; uncertain: boolean };
export type LibTopic = {
  id: string;
  subject_id: string;
  title: string;
  position: number;
  source_type: "image" | "pdf" | "manual";
  source_path: string | null;
  archived: boolean;
  category: string | null;
  items: LibItem[];
};
export type LibSubject = {
  id: string;
  name: string;
  exam_board: string | null;
  qualification_level: string | null;
  position: number;
  topics: LibTopic[];
};

/** Draft topic used by import review and manual entry before saving. */
export type DraftTopic = { key: string; title: string; items: { key: string; title: string; uncertain: boolean }[] };

export const newKey = () => Math.random().toString(36).slice(2, 10);

export async function fetchLibrary(): Promise<LibSubject[]> {
  const [s, t, i] = await Promise.all([
    supabase.from("library_subjects").select("id,name,exam_board,qualification_level,position").order("position").order("created_at"),
    supabase.from("library_topics").select("id,subject_id,title,position,source_type,source_path,archived,category").eq("archived", false).order("position"),
    supabase.from("library_items").select("id,topic_id,title,position,uncertain").order("position"),
  ]);
  if (s.error) throw s.error;
  if (t.error) throw t.error;
  if (i.error) throw i.error;
  return (s.data ?? []).map((sub) => ({
    ...sub,
    topics: (t.data ?? [])
      .filter((tp) => tp.subject_id === sub.id)
      .map((tp) => ({ ...tp, items: (i.data ?? []).filter((it) => it.topic_id === tp.id) })),
  }));
}

export async function addSubject(input: { name: string; exam_board?: string | null; qualification_level?: string | null }) {
  const { data, error } = await supabase
    .from("library_subjects")
    .insert({ name: input.name.trim(), exam_board: input.exam_board || null, qualification_level: input.qualification_level || null })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateSubject(id: string, patch: { name?: string; exam_board?: string | null; qualification_level?: string | null }) {
  const { error } = await supabase.from("library_subjects").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteSubject(id: string) {
  const { error } = await supabase.from("library_subjects").delete().eq("id", id);
  if (error) throw error;
}

/** Saves new topics (and their items) under a subject, appended after existing ones. */
export async function saveTopics(
  subjectId: string,
  topics: DraftTopic[],
  source: { type: "image" | "pdf" | "manual"; path: string | null },
  startPosition: number,
  category?: string | null,
) {
  for (const [index, topic] of topics.entries()) {
    const { data, error } = await supabase
      .from("library_topics")
      .insert({
        subject_id: subjectId,
        title: topic.title.trim(),
        position: startPosition + index,
        source_type: source.type,
        source_path: source.path,
        category: category ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    const items = topic.items.filter((it) => it.title.trim());
    if (items.length) {
      const { error: itemError } = await supabase.from("library_items").insert(
        items.map((it, position) => ({ topic_id: data.id, title: it.title.trim(), position, uncertain: it.uncertain })),
      );
      if (itemError) throw itemError;
    }
  }
}

/** Replaces a stored topic's title and items with an edited draft. */
export async function replaceTopic(topicId: string, draft: DraftTopic, existing: LibItem[]) {
  const { error } = await supabase.from("library_topics").update({ title: draft.title.trim() }).eq("id", topicId);
  if (error) throw error;
  const keep = new Set(draft.items.map((i) => i.key));
  const removed = existing.filter((e) => !keep.has(e.id)).map((e) => e.id);
  if (removed.length) await supabase.from("library_items").delete().in("id", removed);
  for (const [position, item] of draft.items.entries()) {
    if (!item.title.trim()) continue;
    if (existing.some((e) => e.id === item.key)) {
      await supabase.from("library_items").update({ title: item.title.trim(), position, uncertain: item.uncertain }).eq("id", item.key);
    } else {
      await supabase.from("library_items").insert({ topic_id: topicId, title: item.title.trim(), position, uncertain: item.uncertain });
    }
  }
  // Keep linked plan topics in step (history in sessions keeps its own stored text).
  await supabase.from("plan_topics").update({ topic: draft.title.trim() }).eq("library_topic_id", topicId);
}

export async function deleteTopic(topicId: string) {
  const { error } = await supabase.from("library_topics").delete().eq("id", topicId);
  if (error) throw error;
}

/** Files a topic away in the "Kept for later" folder (or brings it back). */
export async function setTopicArchived(topicId: string, archived: boolean) {
  const { error } = await supabase.from("library_topics").update({ archived }).eq("id", topicId);
  if (error) throw error;
}

/** Topics filed away for later, with their items, newest first. */
export async function fetchArchivedTopics(): Promise<LibTopic[]> {
  const [t, i] = await Promise.all([
    supabase.from("library_topics").select("id,subject_id,title,position,source_type,source_path,archived,category").eq("archived", true).order("position"),
    supabase.from("library_items").select("id,topic_id,title,position,uncertain").order("position"),
  ]);
  if (t.error) throw t.error;
  if (i.error) throw i.error;
  return (t.data ?? []).map((tp) => ({ ...tp, items: (i.data ?? []).filter((it) => it.topic_id === tp.id) }));
}

export async function moveTopic(topics: LibTopic[], from: number, to: number) {
  const next = [...topics];
  const [moved] = next.splice(from, 1);
  if (!moved) return;
  next.splice(to, 0, moved);
  await Promise.all(next.map((t, position) => supabase.from("library_topics").update({ position }).eq("id", t.id)));
}

/** Future, not-yet-completed sessions that mention this topic title. */
export async function futureSessionsUsing(title: string) {
  const { data } = await supabase
    .from("sessions")
    .select("id")
    .is("completed_at", null)
    .ilike("topic_text", `%${title.replace(/[%_]/g, "")}%`);
  return data ?? [];
}

/** Takes the topic out of future planned sessions only; library keeps it. */
export async function removeFromFutureSessions(title: string) {
  const ids = (await futureSessionsUsing(title)).map((s) => s.id);
  if (ids.length) await supabase.from("sessions").update({ topic_text: "" }).in("id", ids);
  return ids.length;
}

export async function markOnboardingComplete(userId: string) {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, onboarding_completed_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
}

/** True when this account should be sent to onboarding (no plan and not finished). */
export async function needsOnboarding(userId: string) {
  const [{ data: profile }, { data: plans }] = await Promise.all([
    supabase.from("profiles").select("onboarding_completed_at").eq("id", userId).maybeSingle(),
    supabase.from("plans").select("id").limit(1),
  ]);
  if (plans && plans.length > 0) return false;
  return !profile?.onboarding_completed_at;
}

export function topicText(topic: LibTopic) {
  return topic.items.length ? `${topic.title}: ${topic.items.map((i) => i.title).join(", ")}` : topic.title;
}

/** Separates a topic from its sub-topic in plan and rating keys ("Number › Standard form"). */
export const TOPIC_SUB_SEP = " › ";

/**
 * The rateable, plannable lines for a library topic: one per content item
 * ("Number › Standard form"), or just the title when it has no items.
 */
export function topicLines(topic: LibTopic): string[] {
  return topic.items.length
    ? topic.items.map((i) => `${topic.title}${TOPIC_SUB_SEP}${i.title}`)
    : [topic.title];
}

/**
 * Before topics were split into sub-topics, a whole library topic was rated under its
 * `topicText` key. Fills each sub-topic line that has no rating of its own from that
 * older whole-topic rating, so earlier ratings aren't lost.
 */
export function withWholeTopicRatings<T extends number | null>(
  ratings: Record<string, T>,
  topics: LibTopic[],
): Record<string, T> {
  const out = { ...ratings };
  for (const t of topics) {
    const whole = ratings[topicText(t)];
    if (whole == null || !t.items.length) continue;
    for (const line of topicLines(t)) if (out[line] == null) out[line] = whole;
  }
  return out;
}
