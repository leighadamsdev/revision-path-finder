import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { fetchLibrary, needsOnboarding } from "@/lib/library";
import { useAuth } from "@/hooks/useAuth";

export function useLibrary() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["library", user?.id], enabled: Boolean(user), queryFn: fetchLibrary });
  return {
    ...query,
    subjects: query.data ?? [],
    refresh: () => void queryClient.invalidateQueries({ queryKey: ["library"] }),
  };
}

/** Sends accounts that haven't finished onboarding (and have no plan) to /onboarding. */
export function useOnboardingGate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) return;
    void needsOnboarding(user.id).then((needs) => {
      if (needs) void navigate({ to: "/onboarding" });
    });
  }, [user, navigate]);
}
