import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export type Activity = {
  /** Local dates (yyyy-MM-dd) on which the student did something. */
  days: Set<string>;
  /** Consecutive days of activity ending today, or yesterday if nothing yet today. */
  streak: number;
  /** Whether there's activity today. */
  today: boolean;
  /** Topics rated green in the last 7 days. */
  greenThisWeek: number;
};

const LOOKBACK_DAYS = 120;
const dayOf = (iso: string | null | undefined) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? format(d, "yyyy-MM-dd") : null;
};

/**
 * What counts as revising on a day: ticking off a session, rating a topic, saving a
 * Knowledge Checker or a practice question set. Used for the streak and the 7-day row.
 */
export function useActivity() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["activity", user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<Activity> => {
      const since = subDays(new Date(), LOOKBACK_DAYS).toISOString();
      const weekAgo = subDays(new Date(), 7).toISOString();
      const [sessions, ratings, checkers, sets] = await Promise.all([
        supabase.from("sessions").select("completed_at").gte("completed_at", since).limit(2000),
        supabase.from("topic_ratings").select("updated_at, confidence").gte("updated_at", since).limit(5000),
        supabase.from("knowledge_checkers").select("updated_at").gte("updated_at", since).limit(1000),
        supabase.from("practice_sets").select("created_at").gte("created_at", since).limit(1000),
      ]);
      const days = new Set<string>();
      const add = (iso: string | null | undefined) => {
        const key = dayOf(iso);
        if (key) days.add(key);
      };
      for (const r of sessions.data ?? []) add(r.completed_at);
      for (const r of ratings.data ?? []) add(r.updated_at);
      for (const r of checkers.data ?? []) add(r.updated_at);
      for (const r of sets.data ?? []) add(r.created_at);

      const now = new Date();
      const todayKey = format(now, "yyyy-MM-dd");
      let cursor = days.has(todayKey) ? now : subDays(now, 1);
      let streak = 0;
      while (days.has(format(cursor, "yyyy-MM-dd"))) {
        streak++;
        cursor = subDays(cursor, 1);
      }
      const greenThisWeek = (ratings.data ?? []).filter(
        (r) => r.confidence >= 5 && Boolean(r.updated_at) && r.updated_at >= weekAgo,
      ).length;
      return { days, streak, today: days.has(todayKey), greenThisWeek };
    },
  });
}
