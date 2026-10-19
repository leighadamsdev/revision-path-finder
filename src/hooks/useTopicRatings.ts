import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { fetchTopicRatings, saveTopicRating, type TopicRatings } from "@/lib/topic-ratings";

/** The student's own topic ratings (outside any plan), with an optimistic save. */
export function useTopicRatings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const key = ["topic-ratings", user?.id];
  const query = useQuery({ queryKey: key, enabled: Boolean(user), queryFn: fetchTopicRatings });

  async function rate(
    subject: string,
    topic: string,
    value: number | null,
    options?: { updatePlans?: boolean },
  ) {
    if (!user) return;
    queryClient.setQueryData<TopicRatings>(key, (prev) => {
      const next = { ...(prev ?? {}) };
      const forSubject = { ...(next[subject] ?? {}) };
      if (value) forSubject[topic] = value;
      else delete forSubject[topic];
      next[subject] = forSubject;
      return next;
    });
    try {
      await saveTopicRating(user.id, subject, topic, value, options);
    } catch {
      toast.error("That rating didn't save. Check your connection and try again.");
      void queryClient.invalidateQueries({ queryKey: key });
      return;
    }
    if (options?.updatePlans !== false)
      void queryClient.invalidateQueries({ queryKey: ["plan-topics"] });
  }

  return { ...query, ratings: query.data ?? {}, rate };
}
