import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";

export type Subscription = {
  subscribed: boolean;
  plan: string | null;
  current_period_end: string | null;
};

/** What Premium adds, shown on the Upgrade page and wherever a Premium feature is locked. */
export const PREMIUM_FEATURES = [
  "Your week-by-week revision plan, built around your red topics and exam dates",
  "Exam timetable with your summer exams added for you, plus mocks",
  "Knowledge Checker: test yourself, save checkers and make flashcards from your gaps",
  "Build my AI tutor, including a tutor focused on your red topics",
  "Practice exam questions on your topics, marked by your AI, with saved sets",
  "A weekly summary email for you and your parent or carer",
] as const;

export const PREMIUM_PRICES = { month: "£4.99", year: "£29.99" } as const;

// Ask Stripe for the latest status once per page load, so a cancelled or renewed
// subscription is picked up without waiting for anything else.
let refreshedFor: string | null = null;

/** Refreshes the saved subscription from Stripe and returns the latest status. */
export async function refreshSubscription(): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase.functions.invoke("check-subscription", { body: {} });
    if (error || !data || (data as { error?: string }).error) return null;
    return data as Subscription;
  } catch {
    return null;
  }
}

/**
 * Whether the signed-in student has Premium. Admins always do, so the site owner can use
 * everything. Reads the saved row first (fast), then checks Stripe once per page load.
 */
export function usePremium() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const queryClient = useQueryClient();
  const key = ["subscription", user?.id];

  const query = useQuery({
    queryKey: key,
    enabled: Boolean(user),
    staleTime: 60_000,
    queryFn: async (): Promise<Subscription | null> => {
      const { data, error } = await supabase
        .from("subscribers" as never)
        .select("subscribed, plan, current_period_end")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) return null;
      return (data as Subscription | null) ?? null;
    },
  });

  useEffect(() => {
    if (!user || refreshedFor === user.id) return;
    refreshedFor = user.id;
    void refreshSubscription().then((latest) => {
      if (latest) queryClient.setQueryData(key, latest);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const subscription = query.data ?? null;
  return {
    isPremium: isAdmin || Boolean(subscription?.subscribed),
    isAdmin,
    subscription,
    loading: authLoading || adminLoading || (Boolean(user) && query.isLoading),
    refresh: async () => {
      const latest = await refreshSubscription();
      if (latest) queryClient.setQueryData(key, latest);
      else await queryClient.invalidateQueries({ queryKey: key });
      return latest;
    },
  };
}
