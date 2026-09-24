import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  fetchPlanSubjects,
  fetchPlanTopics,
  fetchPlans,
  fetchSessions,
  type Plan,
} from "@/lib/plan";
import { fetchFlashcards, fetchSubtopics } from "@/lib/leitner";
import { fetchExams, fetchOfficialExams } from "@/lib/exams";

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

export function useFlashcards(planId: string | undefined) {
  return useQuery({
    queryKey: ["flashcards", planId],
    queryFn: () => fetchFlashcards(planId!),
    enabled: Boolean(planId),
  });
}

export function useSubtopics(planId: string | undefined) {
  return useQuery({
    queryKey: ["subtopics", planId],
    queryFn: () => fetchSubtopics(planId!),
    enabled: Boolean(planId),
  });
}

export function useExams(planId: string | undefined) {
  return useQuery({
    queryKey: ["exams", planId],
    queryFn: () => fetchExams(planId!),
    enabled: Boolean(planId),
  });
}

export function useOfficialExams() {
  return useQuery({ queryKey: ["official-exams"], queryFn: fetchOfficialExams });
}
