import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  fetchPlanSubjects,
  fetchPlanTopics,
  fetchPlans,
  fetchSessions,
  type Plan,
} from "@/lib/plan";

const STORAGE_KEY = "revisionpath.activePlan";

export function usePlans() {
  return useQuery({ queryKey: ["plans"], queryFn: fetchPlans });
}

export function useActivePlan() {
  const plansQuery = usePlans();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setActiveId(stored);
  }, []);

  const plans = plansQuery.data ?? [];
  const plan: Plan | null = plans.find((p) => p.id === activeId) ?? plans[0] ?? null;

  function setActive(id: string) {
    window.localStorage.setItem(STORAGE_KEY, id);
    setActiveId(id);
  }

  return { plan, plans, setActive, isLoading: plansQuery.isLoading };
}

export function usePlanSubjects(planId: string | undefined) {
  return useQuery({
    queryKey: ["plan-subjects", planId],
    queryFn: () => fetchPlanSubjects(planId!),
    enabled: Boolean(planId),
  });
}

export function usePlanTopics(planId: string | undefined) {
  return useQuery({
    queryKey: ["plan-topics", planId],
    queryFn: () => fetchPlanTopics(planId!),
    enabled: Boolean(planId),
  });
}

export function usePlanSessions(planId: string | undefined) {
  return useQuery({
    queryKey: ["sessions", planId],
    queryFn: () => fetchSessions(planId!),
    enabled: Boolean(planId),
  });
}
