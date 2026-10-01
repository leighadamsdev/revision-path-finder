import { supabase } from "@/integrations/supabase/client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Check, Search, Upload } from "lucide-react";
import { toast } from "sonner";

import { useAuth, ensureProfile } from "@/hooks/useAuth";
import {
  createPlan,
  fetchSubjects,
  fetchPlanSubjects,
  fetchPlanTopics,
  regeneratePlanSessions,
  resolveSubjectId,
  savePlanSubjects,
  savePlanTopics,
  updatePlanSettings,
  type HolidayPeriod,
  type Intensity,
} from "@/lib/plan";
import { SESSION_LENGTHS, WEEK_DAYS } from "@/lib/subjects";
import { GCSE_SUBJECTS, SUBJECT_GROUPS, isTiered, type Tier } from "@/lib/gcse-subjects";
import { detailedTopicText, subjectUnits } from "@/lib/gcse-topics";
import { extractTopicsFromDocument } from "@/lib/revision.functions";
import { DatePicker } from "@/components/DatePicker";
import { ExamDatesField } from "@/components/ExamDatesField";
import { ExamDateUpload } from "@/components/ExamDateUpload";
import { HolidayPlanner } from "@/components/HolidayPlanner";
import { IntensityField } from "@/components/IntensityField";
import { TopicConfidenceList } from "@/components/TopicConfidenceList";
import { AppShell } from "@/components/AppShell";
import { useActivePlan } from "@/hooks/useActivePlan";
import { useLibrary, useOnboardingGate } from "@/hooks/useLibrary";
import { topicText as libraryTopicText } from "@/lib/library";

import { JourneyProgress, SubjectConfidence, type JourneyStatus } from "@/components/planner/JourneyProgress";
import { daysToNextExam, priorityScore } from "@/lib/scheduling";


export const Route = createFileRoute("/_authenticated/setup")({
  head: () => ({
    meta: [
      { title: "Set up your plan — rev.plan" },
      {
        name: "description",
        content:
          "Choose your GCSE subjects and tier, select topics, and set when and how often you can study.",
      },
      { property: "og:title", content: "Set up your plan — rev.plan" },
      {
        property: "og:description",
        content: "Pick subjects and tiers, choose topics, and generate your dated revision timetable.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (raw: Record<string, unknown>): { step?: number; from?: string; mode?: "edit" | "copy" } => ({
    ...(typeof raw["step"] === "number" ? { step: raw["step"] } : {}),
    ...(typeof raw["from"] === "string" ? { from: raw["from"] } : {}),
    ...(raw["mode"] === "edit" || raw["mode"] === "copy" ? { mode: raw["mode"] } : {}),
  }),
  component: SetupPage,
});

type PlanKind = "quick" | "topic" | "personalised";
type RankedTopic = { key: string; subject: string; topic: string; rating: number | null; score: number; reason: string };
const DRAFT_KEY = "revplan.setupDraft.";

type Pick = { name: string; tier: Tier | null };
type DayConfig = { sessions: number; minutes: number };

const DEFAULT_DAY: DayConfig = { sessions: 3, minutes: 30 };
const TOTAL_STEPS = 4;
const STEP_LABELS = ["Pick subjects", "Choose topics", "Set timeframe", "Review"];

type TopicSource = "dfe" | "manual" | "upload" | "library";

function lengthLabel(n: number) {
  return n < 60 ? `${n} min` : n === 60 ? "1 hr" : `${n / 60} hr`;
}

function SetupPage() {
  useOnboardingGate();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { plans } = useActivePlan();
  const subjectsQuery = useQuery({ queryKey: ["subjects"], queryFn: fetchSubjects });
  const subjects = subjectsQuery.data ?? [];
  const library = useLibrary();
  /** Library topics for a subject name (matched by name), as "Title: items" lines. */
  function libraryOptions(subjectName: string): string[] {
    const s = library.subjects.find((x) => x.name.trim().toLowerCase() === subjectName.trim().toLowerCase());
    return (s?.topics ?? []).map(libraryTopicText);
  }

  const routeSearch = Route.useSearch();
  /** Screens: 1 subjects, 3 time (journey step 1), 2 topics, 5 knowledge check, 6 priorities. */
  const [step, setStepRaw] = useState(routeSearch.step === 2 ? 2 : 1);
  function setStep(n: number) {
    setStepRaw(n);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0 });
      window.setTimeout(() => document.getElementById("step-card")?.focus(), 50);
    }
  }
  const [checkState, setCheckState] = useState<"todo" | "skipped" | "done">("todo");
  const [topicsVisited, setTopicsVisited] = useState(false);
  const [order, setOrder] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [restored, setRestored] = useState(false);
  /** Quick plan: skip topics and confidence ratings. */
  const [picks, setPicks] = useState<Pick[]>([]);
  const [search, setSearch] = useState("");
  /** Ticked topics, keyed by subject name. */
  const [chosen, setChosen] = useState<Record<string, string[]>>({});
  /** Up to three selected topics per subject to schedule first. */
  const [priorities, setPriorities] = useState<Record<string, string[]>>({});
  const [openSubject, setOpenSubject] = useState<string | null>(null);
  /** How each subject's topics come in: DfE list, typed by hand, or from a document. */
  const [source, setSource] = useState<Record<string, TopicSource>>({});
  const [manualText, setManualText] = useState<Record<string, string>>({});
  const [uploaded, setUploaded] = useState<Record<string, string[]>>({});
  const [parsing, setParsing] = useState<string | null>(null);

  const [customName, setCustomName] = useState("");
  /** Up to three optional exam dates per subject name. */
  const [examDates, setExamDates] = useState<Record<string, string[]>>({});

  /** Optional 1–5 confidence per subject name — only used when no topics are chosen. */
  const [confidences, setConfidences] = useState<Record<string, number | null>>({});
  /** Optional 1–5 confidence per topic, keyed by subject name then topic. */
  const [topicRatings, setTopicRatings] = useState<Record<string, Record<string, number | null>>>(
    {},
  );
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [holidays, setHolidays] = useState<HolidayPeriod[]>([]);


  const [name, setName] = useState("");
  const trimmedName = name.trim();
  const fromId = routeSearch.from;
  const editing = Boolean(fromId) && routeSearch.mode === "edit";
  const copying = Boolean(fromId) && routeSearch.mode === "copy";
  const sourcePlan = plans.find((p) => p.id === fromId) ?? null;
  const nameTaken = plans.some((p) => p.name.trim().toLowerCase() === trimmedName.toLowerCase() && !(editing && p.id === fromId));
  const nameError = !trimmedName ? "Give this plan a name so you can tell your plans apart." : nameTaken ? "You already have a plan with this name — choose a different one." : null;
  const [startDate, setStartDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [weeks, setWeeks] = useState(6);
  const [dayConfigs, setDayConfigs] = useState<Record<string, DayConfig>>({
    Monday: { ...DEFAULT_DAY },
    Tuesday: { ...DEFAULT_DAY },
    Wednesday: { ...DEFAULT_DAY },
    Thursday: { ...DEFAULT_DAY },
  });
  const [generating, setGenerating] = useState(false);

  // Autosave the in-progress journey so refreshes and later visits resume.
  // Editing or copying an existing plan: load it into the journey from Step 1.
  useEffect(() => {
    if (!user || restored || !fromId) return;
    const p = plans.find((x) => x.id === fromId);
    if (!p) return;
    setRestored(true);
    void (async () => {
      try {
        const [subs, tops] = await Promise.all([fetchPlanSubjects(p.id), fetchPlanTopics(p.id)]);
        setPicks(subs.map((s) => ({ name: s.name, tier: (s.tier as Tier | null) ?? null })));
        setExamDates(Object.fromEntries(subs.map((s) => [s.name, s.exam_dates])));
        setConfidences(Object.fromEntries(subs.map((s) => [s.name, s.confidence])));
        const nameOf = (id: string) => subs.find((s) => s.id === id)?.name ?? "";
        const byName: Record<string, string[]> = {};
        const ratings: Record<string, Record<string, number | null>> = {};
        const prios: Record<string, string[]> = {};
        for (const t of tops) {
          const n = nameOf(t.subject_id);
          if (!n) continue;
          (byName[n] ??= []).push(t.topic);
          (ratings[n] ??= {})[t.topic] = t.confidence;
          if (t.is_priority) (prios[n] ??= []).push(t.topic);
        }
        setChosen(byName);
        setSource(Object.fromEntries(Object.keys(byName).map((n) => [n, "upload" as TopicSource])));
        setTopicRatings(ratings);
        setPriorities(prios);
        if (Object.keys(byName).length) setTopicsVisited(true);
        setOrder(tops.map((t) => `${nameOf(t.subject_id)}|||${t.topic}`));
        setName(routeSearch.mode === "copy" ? `Copy of ${p.name}` : p.name);
        setStartDate(p.start_date);
        setWeeks(p.weeks);
        const dp = p.day_plan?.length ? p.day_plan : p.study_days.map((day) => ({ day, sessions: p.sessions_per_day, minutes: p.session_length_minutes }));
        setDayConfigs(Object.fromEntries(dp.map((d) => [d.day, { sessions: d.sessions, minutes: d.minutes }])));
        setHolidays(p.holiday_periods ?? []);
        setIntensity(p.intensity_weeks && p.intensity_sessions_per_day ? { weeks: p.intensity_weeks, sessions: p.intensity_sessions_per_day } : null);
        setStepRaw(1);
      } catch {
        toast.error("We couldn't load that plan — try again.");
      }
    })();
  }, [user, restored, fromId, plans, routeSearch.mode]);

  useEffect(() => {
    if (!user || restored || fromId) return;
    setRestored(true);
    void (async () => {
    try {
      const { data: row } = await supabase.from("setup_drafts").select("data").eq("user_id", user.id).maybeSingle();
      const raw = window.localStorage.getItem(DRAFT_KEY + user.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d: any = row?.data && Object.keys(row.data as object).length ? row.data : raw ? JSON.parse(raw) : null;
      if (!d) return;
      if (d.picks?.length) setPicks(d.picks);
      if (d.chosen) setChosen(d.chosen);
      if (d.source) setSource(d.source);
      if (d.manualText) setManualText(d.manualText);
      if (d.uploaded) setUploaded(d.uploaded);
      if (d.examDates) setExamDates(d.examDates);
      if (d.confidences) setConfidences(d.confidences);
      if (d.topicRatings) setTopicRatings(d.topicRatings);
      if (d.priorities) setPriorities(d.priorities);
      if (d.dayConfigs) setDayConfigs(d.dayConfigs);
      if (d.weeks) setWeeks(d.weeks);
      if (d.name) setName(d.name);
      if (d.holidays) setHolidays(d.holidays);
      if (d.intensity !== undefined) setIntensity(d.intensity);
      if (d.checkState) setCheckState(d.checkState);
      if (d.topicsVisited) setTopicsVisited(true);
      if (d.order) setOrder(d.order);
      if (d.excluded) setExcluded(d.excluded);
      if (routeSearch.step !== 2 && d.step && d.step !== 4) setStepRaw(d.step);
      toast.message("We've restored your unfinished plan setup.");
    } catch {
      /* ignore a broken draft */
    }
    })();
  }, [user, restored, routeSearch.step]);

  useEffect(() => {
    if (!user || !restored || fromId) return;
    const d = { picks, chosen, source, manualText, uploaded, examDates, confidences, topicRatings, priorities, dayConfigs, weeks, name, holidays, intensity, checkState, topicsVisited, order, excluded, step };
    window.localStorage.setItem(DRAFT_KEY + user.id, JSON.stringify(d));
    // Also save to the student's account (debounced) so it resumes on any device.
    const t = setTimeout(() => {
      void supabase.from("setup_drafts").upsert({ user_id: user.id, data: d as never, updated_at: new Date().toISOString() });
    }, 1200);
    return () => clearTimeout(t);
  }, [user, restored, picks, chosen, source, manualText, uploaded, examDates, confidences, topicRatings, priorities, dayConfigs, weeks, name, holidays, intensity, checkState, topicsVisited, order, excluded, step]);

  const studyDays = useMemo(
    () => WEEK_DAYS.filter((d) => dayConfigs[d]).map((d) => d as string),
    [dayConfigs],
  );

  /** The student's own subjects first, then the rest of the GCSE catalogue. */
  const myNames = useMemo(() => {
    const seen = new Set<string>();
    const names: string[] = [];
    for (const s of library.subjects) {
      const subjectName = s.name.trim();
      if (!subjectName) continue;
      const key = subjectName.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      names.push(subjectName);
    }
    return names.sort((a, b) => a.localeCompare(b));
  }, [library.subjects]);

  /** Subjects chosen before (in the library) start ticked — students can untick them. */
  const [prefilled, setPrefilled] = useState(false);
  useEffect(() => {
    if (prefilled || library.subjects.length === 0) return;
    setPrefilled(true);
    setPicks((prev) => {
      if (prev.length) return prev;
      const seen = new Set<string>();
      return library.subjects.flatMap((s) => {
        const n = s.name.trim();
        if (!n || seen.has(n.toLowerCase())) return [];
        seen.add(n.toLowerCase());
        const lvl = s.qualification_level ?? "";
        const tier: Tier | null = /higher/i.test(lvl) ? "Higher" : /foundation/i.test(lvl) ? "Foundation" : null;
        return [{ name: n, tier }];
      });
    });
  }, [library.subjects, prefilled]);

  /** Grouped like the subject drop-downs: your subjects, then the GCSE catalogue by category. */
  const listedGroups = useMemo(() => {
    const seen = new Set(myNames.map((n) => n.toLowerCase()));
    const groups: { label: string; names: string[] }[] = [];
    if (myNames.length) groups.push({ label: "Your subjects", names: myNames });
    for (const g of SUBJECT_GROUPS) {
      const names = GCSE_SUBJECTS.filter((s) => s.group === g && !seen.has(s.name.toLowerCase())).map((s) => s.name);
      if (names.length) groups.push({ label: g, names });
    }
    return groups;
  }, [myNames]);

  const visibleGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return listedGroups;
    return listedGroups
      .map((g) => ({ ...g, names: g.names.filter((n) => n.toLowerCase().includes(q)) }))
      .filter((g) => g.names.length > 0);
  }, [listedGroups, search]);

  function toggleName(subjectName: string) {
    setPicks((prev) => {
      if (prev.some((p) => p.name === subjectName)) {
        return prev.filter((p) => p.name !== subjectName);
      }
      return [...prev, { name: subjectName, tier: null }];
    });
  }

  function setTier(subjectName: string, tier: Tier) {
    setPicks((prev) =>
      prev.map((p) => (p.name === subjectName ? { ...p, tier: p.tier === tier ? null : tier } : p)),
    );
  }

  function addCustomName() {
    const trimmed = customName.trim();
    if (!trimmed) return;
    if (picks.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("That subject is already on your list.");
      return;
    }
    setPicks((prev) => [...prev, { name: trimmed, tier: null }]);
    setCustomName("");
  }

  function toggleTopic(subjectName: string, label: string) {
    setChosen((prev) => {
      const list = prev[subjectName] ?? [];
      return {
        ...prev,
        [subjectName]: list.includes(label) ? list.filter((l) => l !== label) : [...list, label],
      };
    });
  }

  function toggleAllTopics(subjectName: string, labels: string[]) {
    setChosen((prev) => {
      const list = prev[subjectName] ?? [];
      const allOn = labels.length > 0 && labels.every((l) => list.includes(l));
      return { ...prev, [subjectName]: allOn ? [] : labels };
    });
  }

  /** The final topic list for a subject, whatever source the student chose. */
  function topicsFor(subjectName: string): string[] {
    const mode = source[subjectName] ?? "dfe";
    if (mode === "manual") return manualLines(manualText[subjectName]);
    const topics = chosen[subjectName] ?? [];
    return mode === "dfe" ? topics.map((topic) => detailedTopicText(subjectName, topic)) : topics;
  }

  function prioritiesFor(subjectName: string): string[] {
    const topics = topicsFor(subjectName);
    return (priorities[subjectName] ?? []).filter((topic) => topics.includes(topic)).slice(0, 3);
  }

  function togglePriority(subjectName: string, topic: string) {
    setPriorities((prev) => {
      const current = (prev[subjectName] ?? []).filter((item) =>
        topicsFor(subjectName).includes(item),
      );
      if (current.includes(topic)) {
        return { ...prev, [subjectName]: current.filter((item) => item !== topic) };
      }
      if (current.length >= 3) {
        toast.error("Choose up to 3 priority topics for each subject.");
        return prev;
      }
      return { ...prev, [subjectName]: [...current, topic] };
    });
  }

  async function readTopicsFiles(subjectName: string, files: File[]) {
    setParsing(subjectName);
    const found: string[] = [];
    try {
      for (const file of files) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("Could not read that file."));
          reader.readAsDataURL(file);
        });
        const { topics } = await extractTopicsFromDocument({
          data: { subject: subjectName, fileName: file.name, mimeType: file.type || "application/pdf", dataUrl },
        });
        found.push(...topics);
      }
      if (!found.length) {
        toast.error("We couldn't find topics in those pages — try typing them instead.");
        return;
      }
      const merge = (prev: string[] | undefined) => [...new Set([...(prev ?? []), ...found])];
      setUploaded((prev) => ({ ...prev, [subjectName]: merge(prev[subjectName]) }));
      setChosen((prev) => ({ ...prev, [subjectName]: merge(prev[subjectName]) }));
      toast.success(`Found ${found.length} topics — untick anything you don't need.`);
    } catch (error) {
      console.error(error);
      toast.error("We couldn't read that document. Try a clearer file or type your topics.");
    } finally {
      setParsing(null);
    }
  }

  async function generate(kind: PlanKind) {
    if (!user) return;
    if (nameError) {
      setStep(1);
      toast.error(nameError);
      return;
    }
    setGenerating(true);
    try {
      await ensureProfile(user);
      const subjectIds: string[] = [];
      const tiers: Record<string, string | null> = {};
      const examDateMap: Record<string, string[]> = {};
      const confidenceMap: Record<string, number | null> = {};
      const chosenTopics: Record<string, string[]> = {};
      const priorityTopics: Record<string, string[]> = {};
      const topicConfidence: Record<string, Record<string, number | null>> = {};
      for (const pick of picks) {
        const id = await resolveSubjectId(pick.name, user.id, subjects);
        subjectIds.push(id);
        tiers[id] = pick.tier;
        examDateMap[id] = [...new Set((examDates[pick.name] ?? []).filter(Boolean))].sort();
        // Quick plans are subject-level; personalised plans drop excluded topics.
        const all = kind === "quick" ? [] : topicsFor(pick.name);
        // Personalised plans keep the student's reviewed order (saved as topic position).
        const rank = (t: string) => {
          const i = order.indexOf(`${pick.name}|||${t}`);
          return i < 0 ? Number.MAX_SAFE_INTEGER : i;
        };
        const topics = kind === "personalised"
          ? all.filter((t) => !excluded.includes(`${pick.name}|||${t}`)).sort((a, b) => rank(a) - rank(b))
          : all;
        confidenceMap[id] = confidences[pick.name] ?? null;
        if (topics.length) {
          chosenTopics[id] = topics;
          const ratings = topicRatings[pick.name] ?? {};
          topicConfidence[id] = Object.fromEntries(
            topics.map((topic) => [topic, ratings[topic] ?? null]),
          );
        }
        const priority = kind === "personalised"
          ? order.filter((k) => k.startsWith(`${pick.name}|||`) && !excluded.includes(k)).map((k) => k.split("|||")[1]!).filter((t) => topics.includes(t)).slice(0, 3)
          : kind === "topic" ? prioritiesFor(pick.name) : [];
        if (priority.length) priorityTopics[id] = priority;
      }
      await queryClient.invalidateQueries({ queryKey: ["subjects"] });

      if (editing && fromId) {
        // Update the existing plan in place so completed sessions and notes are kept.
        const daySettings = studyDays.map((day) => ({
          day,
          sessions: dayConfigs[day]?.sessions ?? DEFAULT_DAY.sessions,
          minutes: dayConfigs[day]?.minutes ?? DEFAULT_DAY.minutes,
        }));
        const cleanHolidays = holidays.filter((h) => h.start && h.end);
        await savePlanSubjects(fromId, subjectIds.map((id) => ({ subjectId: id, tier: tiers[id] ?? null, examDates: examDateMap[id] ?? [], confidence: confidenceMap[id] ?? null })));
        const topicRows = subjectIds.flatMap((id) => (chosenTopics[id] ?? []).map((topic) => ({ subjectId: id, topic, confidence: topicConfidence[id]?.[topic] ?? null, isPriority: (priorityTopics[id] ?? []).includes(topic) })));
        await savePlanTopics(fromId, topicRows);
        await updatePlanSettings(fromId, { name: trimmedName, startDate, weeks, days: daySettings, intensity, holidays: cleanHolidays });
        await supabase.from("plans").update({ plan_type: kind }).eq("id", fromId);
        await regeneratePlanSessions(fromId, {
          startDate, weeks, days: daySettings, intensity, holidays: cleanHolidays,
          subjects: picks.map((pick, i) => {
            const id = subjectIds[i]!;
            return {
              subjectId: id, name: pick.name, examDates: examDateMap[id] ?? [], confidence: confidenceMap[id] ?? null,
              topics: topicRows.filter((t) => t.subjectId === id).map((t) => ({ topic: t.topic, confidence: t.confidence, isPriority: t.isPriority })),
            };
          }),
        });
        window.localStorage.setItem("revisionpath.activePlan", fromId);
        await queryClient.invalidateQueries();
        toast.success("Plan updated — your timetable has been rebuilt.");
        navigate({ to: "/plan" });
        return;
      }

      const planId = await createPlan(user.id, {
        name: trimmedName,
        startDate,
        weeks,
        days: studyDays.map((day) => ({
          day,
          sessions: dayConfigs[day]?.sessions ?? DEFAULT_DAY.sessions,
          minutes: dayConfigs[day]?.minutes ?? DEFAULT_DAY.minutes,
        })),
        // Subjects left blank get their topics written for them.
        contentMode: kind === "quick" ? "manual" : "ai",
        planType: kind,
        subjectIds,
        tiers,
        examDates: examDateMap,
        confidence: confidenceMap,
        chosenTopics,
        priorityTopics,
        topicConfidence,
        intensity,
        holidays: holidays.filter((holiday) => holiday.start && holiday.end),
      });

      window.localStorage.setItem("revisionpath.activePlan", planId);
      if (!copying) {
        window.localStorage.removeItem(DRAFT_KEY + user.id);
        await supabase.from("setup_drafts").delete().eq("user_id", user.id);
      }
      await queryClient.invalidateQueries();
      navigate({ to: "/plan" });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong building your plan.",
      );
    } finally {
      setGenerating(false);
    }
  }

  const missingTiers = picks.filter((p) => isTiered(p.name) && !p.tier).length;
  const totalSessions =
    weeks * studyDays.reduce((sum, day) => sum + (dayConfigs[day]?.sessions ?? 0), 0);

  const totalChosen = picks.reduce((sum, p) => sum + topicsFor(p.name).length, 0);

  const canContinue =
    step === 1
      ? !nameError && picks.length > 0 && missingTiers === 0 && picks.every((p) => confidences[p.name] != null)
      : step === 3
          ? studyDays.length > 0 && weeks > 0 && Boolean(startDate) && !holidays.some((holiday) => holiday.start && holiday.end && holiday.end < holiday.start)
          : true;
  const missingTierNames = picks.filter((pick) => isTiered(pick.name) && !pick.tier).map((pick) => pick.name);
  const holidayError = holidays.some((holiday) => holiday.start && holiday.end && holiday.end < holiday.start);
  const missingConfidence = picks.filter((p) => confidences[p.name] == null).map((p) => p.name);

  const ranked: RankedTopic[] = useMemo(() => {
    const today = new Date();
    const out: RankedTopic[] = [];
    for (const p of picks) {
      const days = daysToNextExam(examDates[p.name] ?? [], today);
      for (const topic of topicsFor(p.name)) {
        const rating = topicRatings[p.name]?.[topic] ?? null;
        const score = priorityScore(rating, days);
        const conf = rating == null ? "not rated" : rating <= 2 ? "low confidence" : rating <= 4 ? "partly understood" : "confident";
        out.push({
          key: `${p.name}|||${topic}`,
          subject: p.name,
          topic,
          rating,
          score,
          reason: `${conf[0]!.toUpperCase()}${conf.slice(1)}${days != null ? ` · exam in ${days} day${days === 1 ? "" : "s"}` : ""}`,
        });
      }
    }
    return out.sort((a, b) => b.score - a.score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picks, examDates, topicRatings, chosen, source, manualText]);

  function openPriorities() {
    setCheckState("done");
    const keys = ranked.map((r) => r.key);
    setOrder((prev) => [...prev.filter((k) => keys.includes(k)), ...keys.filter((k) => !prev.includes(k))].length && prev.length ? [...prev.filter((k) => keys.includes(k)), ...keys.filter((k) => !prev.includes(k))] : keys);
    setStep(6);
  }
  function move(key: string, dir: -1 | 1) {
    setOrder((prev) => {
      const i = prev.indexOf(key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
  }
  const rankedByKey = new Map(ranked.map((r) => [r.key, r]));
  const orderedRanked = order.map((k) => rankedByKey.get(k)).filter((r): r is RankedTopic => Boolean(r));
  const anyTopics = ranked.length > 0;

  const journey: Record<number, JourneyStatus> = {
    1: step === 1 || step === 3 || step === 7 ? "current" : "done",
    2: step === 2 ? "current" : topicsVisited ? "done" : "optional",
    3: step === 5 ? "current" : checkState === "done" ? "done" : checkState === "skipped" ? "skipped" : "optional",
    4: step === 6 ? "current" : checkState === "done" ? "done" : "locked",
    5: "todo",
  };
  function selectJourney(n: number) {
    if (n === 1) setStep(1);
    else if (n === 2) setStep(2);
    else if (n === 3) setStep(5);
    else if (n === 4 && checkState === "done") openPriorities();
  }
  function saveAndExit() {
    toast.success("Saved — come back any time to carry on.");
    navigate({ to: plans.length ? "/plan" : "/" });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        {editing || copying ? (
          <p className="mb-3 rounded-[12px] bg-secondary px-3 py-2 text-[13px] font-bold">
            {editing
              ? `Editing “${sourcePlan?.name ?? "your plan"}” from the start — your completed sessions and notes are kept when you rebuild.`
              : `Copying “${sourcePlan?.name ?? "a plan"}” — change anything you like, then build it as a new plan.`}
          </p>
        ) : null}
        <JourneyProgress statuses={journey} onSelect={selectJourney} />
        <p className="mb-3 text-[12px] font-extrabold text-muted-foreground" aria-live="polite">
          {step === 1 || step === 3 || step === 7
            ? `Plan setup: 1 of 5 · ${step === 1 ? "Part 1 of 3 — subjects, exam dates and confidence" : step === 3 ? "Part 2 of 3 — your revision time" : "Part 3 of 3 — review your details"}`
            : step === 2
              ? "Plan setup: 2 of 5 · Step 2 is optional"
              : step === 5
                ? "Plan setup: 3 of 5 · Optional — skip any time"
                : "Plan setup: 4 of 5 · Review your priorities"}
          {checkState === "skipped" && step !== 5 ? " · Knowledge check skipped — you can complete it later." : ""}
          {checkState !== "done" && step === 5 ? " · Priorities unlock after you finish the knowledge check." : ""}
        </p>

        <div id="step-card" tabIndex={-1} className="rounded-[18px] bg-card p-4 ring-1 ring-black/5 outline-none sm:p-5">
          {step === 1 ? (
            <>
              <p className="text-lg font-extrabold tracking-tight">
                Which subjects are you revising?
              </p>
              <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                Your own subjects are listed first, then every other GCSE subject. Tick everything
                you're sitting, and choose Foundation or Higher where it applies. You can change
                these at any time.
              </p>

              <label className="mt-4 block">
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  First, name your plan
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Summer GCSE revision"
                  className="mt-1 w-full rounded-[12px] bg-background px-3 py-2.5 text-sm font-medium ring-1 ring-border focus:outline-none"
                />
                {nameError && trimmedName ? <span className="mt-1 block text-[12px] font-bold text-destructive">{nameError}</span> : null}
              </label>

              <div className="mt-4 flex items-center gap-2 rounded-[12px] bg-background px-3 py-2.5 ring-1 ring-border">
                <Search className="size-4 text-muted-foreground" strokeWidth={2.5} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search subjects…"
                  className="w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none"
                />
              </div>

              <div className="mt-3 max-h-[26rem] space-y-3 overflow-y-auto pr-1">
                {visibleGroups.map((group) => (
                  <div key={group.label}>
                    <p className="px-2.5 pb-1 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                      {group.label}
                    </p>
                    <div className="space-y-1">
                      {group.names.map((subjectName) => {
                        const pick = picks.find((p) => p.name === subjectName);
                        const isOn = Boolean(pick);
                        return (
                          <div key={subjectName} className="rounded-[10px] hover:bg-background">
                            <button
                              onClick={() => toggleName(subjectName)}
                              className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left"
                            >
                              <span
                                className={`grid size-5 shrink-0 place-items-center rounded-[6px] ${
                                  isOn ? "bg-structure" : "ring-1 ring-border"
                                }`}
                              >
                                {isOn ? (
                                  <Check className="size-3 text-structure-foreground" strokeWidth={3} />
                                ) : null}
                              </span>
                              <span className="text-sm font-bold">{subjectName}</span>
                            </button>
                            {isOn && isTiered(subjectName) ? (
                              <div className="flex flex-wrap items-center gap-1 px-2.5 pb-2 pl-10">
                                <span className="mr-1 text-[11px] font-bold text-muted-foreground">
                                  Tier
                                </span>
                                {(["Foundation", "Higher"] as const).map((tier) => (
                                  <button
                                    key={tier}
                                    onClick={() => setTier(subjectName, tier)}
                                    className={`rounded-full px-3 py-1 text-[12px] font-bold ${
                                      pick?.tier === tier
                                        ? "bg-structure text-structure-foreground"
                                        : "bg-card text-muted-foreground ring-1 ring-border"
                                    }`}
                                  >
                                    {tier}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {visibleGroups.length === 0 ? (
                  <p className="text-[12px] font-bold text-muted-foreground">
                    Nothing matched — add it as a custom subject below.
                  </p>
                ) : null}
              </div>

              <div className="mt-4 rounded-[12px] bg-background p-3 ring-1 ring-border">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                  Not listed?
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Subject name"
                    className="min-w-0 flex-1 rounded-[10px] bg-card px-3 py-2 text-[13px] font-medium ring-1 ring-border focus:outline-none"
                  />
                  <button
                    onClick={addCustomName}
                    className="rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-primary-foreground"
                  >
                    Add
                  </button>
                </div>
              </div>

              {picks.length ? (
                <div className="mt-5">
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                    Your subjects
                  </p>
                  <p className="mt-1 text-[12px] font-medium text-muted-foreground">
                    Add exam dates — optional, and sooner exams get more sessions. You'll rate how
                    confident you feel on the next step.
                  </p>

                  <div className="mt-2">
                    <ExamDateUpload
                      subjects={picks.map((p) => p.name)}
                      onApply={(dates) =>
                        setExamDates((prev) => {
                          const next = { ...prev };
                          for (const [subject, list] of Object.entries(dates)) {
                            const merged = [
                              ...new Set([...(next[subject] ?? []).filter(Boolean), ...list]),
                            ].sort();
                            next[subject] = merged.slice(0, 3);
                          }
                          return next;
                        })
                      }
                    />
                  </div>
                  <div className="mt-2 space-y-2">
                    {picks.map((pick) => (
                      <div
                        key={pick.name}
                        className="rounded-[12px] bg-background px-3 py-2.5 ring-1 ring-border"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold">{pick.name}</span>
                          {isTiered(pick.name) ? (
                            <div className="ml-auto flex gap-1">
                              {(["Foundation", "Higher"] as const).map((tier) => (
                                <button
                                  key={tier}
                                  onClick={() => setTier(pick.name, tier)}
                                  className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${
                                    pick.tier === tier
                                      ? "bg-structure text-structure-foreground"
                                      : "bg-card text-muted-foreground ring-1 ring-border"
                                  }`}
                                >
                                  {tier}
                                </button>
                              ))}
                            </div>
                          ) : null}
                          <button
                            onClick={() =>
                              setPicks((prev) => prev.filter((p) => p.name !== pick.name))
                            }
                            className={`text-[12px] font-bold text-muted-foreground hover:text-foreground ${
                              isTiered(pick.name) ? "" : "ml-auto"
                            }`}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-2.5">
                          <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                            How confident do you feel in {pick.name}? (required)
                          </span>
                          <div className="mt-1">
                            <SubjectConfidence
                              subject={pick.name}
                              value={confidences[pick.name]}
                              onChange={(v) => setConfidences((prev) => ({ ...prev, [pick.name]: v }))}
                            />
                          </div>
                          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                            Low-confidence subjects get more sessions; high-confidence ones are kept fresh.
                          </p>
                        </div>
                        <div className="mt-2.5">
                          <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                            Exam dates (optional, up to 3)
                          </span>
                          <div className="mt-1">
                            <ExamDatesField
                              dates={examDates[pick.name] ?? []}
                              onChange={(dates) =>
                                setExamDates((prev) => ({ ...prev, [pick.name]: dates }))
                              }
                              label="Not sure yet"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {missingTiers ? (
                    <p className="mt-2 text-[12px] font-bold text-muted-foreground">
                      {missingTiers} still need a tier — pick Foundation or Higher.
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-[12px] font-bold text-muted-foreground">
                  No subjects picked yet.
                </p>
              )}
            </>
          ) : null}

          {step === 2 ? (
            <>
              <p className="text-lg font-extrabold tracking-tight">
                Which topics do you want to cover?
              </p>
              <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                For each subject, pick where the topics come from: the official DfE content list,
                your own typing, or a document you upload. Leave a subject blank and we'll fill it
                in for you.
              </p>

              <div className="mt-4 space-y-2">
                {picks.map((pick) => {
                  const mode = source[pick.name] ?? "dfe";
                  const units = subjectUnits(pick.name);
                  const ticked = chosen[pick.name] ?? [];
                  const open = openSubject === pick.name;
                  const options =
                    mode === "upload"
                      ? (uploaded[pick.name] ?? [])
                      : mode === "library"
                        ? libraryOptions(pick.name)
                        : units.flatMap((u) => u.elements.map((e) => e.label));
                  const picked =
                    mode === "manual" ? manualLines(manualText[pick.name]).length : ticked.length;
                   const finalTopics = topicsFor(pick.name);
                   const subjectPriorities = prioritiesFor(pick.name);
                  return (
                    <div
                      key={pick.name}
                      className="rounded-[14px] bg-background ring-1 ring-border"
                    >
                      <button
                        onClick={() => setOpenSubject(open ? null : pick.name)}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
                      >
                        <span className="text-sm font-extrabold">{pick.name}</span>
                        <span className="ml-auto text-[12px] font-bold text-muted-foreground">
                          {picked ? `${picked} topic${picked === 1 ? "" : "s"}` : "Not set"}
                        </span>
                      </button>

                      {open ? (
                        <div className="border-t border-border px-3 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {(
                              [
                                ["library", "My Topic Library"],
                                ["dfe", "DfE content list"],
                                ["manual", "Type my own"],
                                ["upload", "Upload a document"],
                              ] as const
                            ).map(([key, label]) => (
                              <button
                                key={key}
                                onClick={() => setSource((prev) => ({ ...prev, [pick.name]: key }))}
                                className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${
                                  mode === key
                                    ? "bg-structure text-structure-foreground"
                                    : "bg-card text-muted-foreground ring-1 ring-border"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>

                          {mode === "manual" ? (
                            <textarea
                              value={manualText[pick.name] ?? ""}
                              onChange={(e) =>
                                setManualText((prev) => ({ ...prev, [pick.name]: e.target.value }))
                              }
                              rows={6}
                              placeholder={
                                "One topic per line, e.g.\nQuadratic graphs\nCircle theorems"
                              }
                              className="mt-3 w-full rounded-[12px] bg-card p-3 text-[13px] font-medium ring-1 ring-border focus:outline-none"
                            />
                          ) : null}

                          {mode === "library" && options.length === 0 ? (
                            <p className="mt-3 text-[12px] font-bold text-muted-foreground">
                              Your Topic Library has no Topics for a subject called “{pick.name}” yet. Add them in My Topic Library, or pick another source.
                            </p>
                          ) : null}

                          {mode === "upload" ? (
                            <div className="mt-3">
                              <label className="flex cursor-pointer flex-col items-center gap-1 rounded-[14px] border-2 border-dashed border-primary/40 bg-card px-4 py-5 text-center hover:bg-secondary">
                                <Upload className="size-6 text-primary" />
                                <span className="text-sm font-extrabold">Upload your topic list</span>
                                <span className="text-[12px] font-medium text-muted-foreground">
                                  A screenshot or photo of your revision guide's contents page, or a topic list from school. PDF, JPG or PNG — you can choose several pages at once.
                                </span>
                                <input
                                  type="file"
                                  multiple
                                  accept="application/pdf,image/*"
                                  onChange={(e) => {
                                    const files = Array.from(e.target.files ?? []);
                                    if (files.length) void readTopicsFiles(pick.name, files);
                                    e.target.value = "";
                                  }}
                                  className="sr-only"
                                />
                              </label>
                              <p className="mt-1 text-[12px] font-medium text-muted-foreground">
                                {parsing === pick.name
                                  ? "Reading your pages…"
                                  : options.length
                                    ? "Tick the topics you want to keep. Upload more pages to add to the list."
                                    : "Topics are grouped under their section titles."}
                              </p>
                            </div>
                          ) : null}

                          {mode !== "manual" && options.length ? (
                            <>
                              <button
                                onClick={() => toggleAllTopics(pick.name, options)}
                                className={`mt-3 rounded-full px-3 py-1.5 text-[12px] font-bold ${
                                  ticked.length === options.length
                                    ? "bg-structure text-structure-foreground"
                                    : "bg-card text-muted-foreground ring-1 ring-border"
                                }`}
                              >
                                {ticked.length === options.length ? "Clear all" : "Select all"}
                              </button>

                              {mode === "dfe" ? (
                                <div className="mt-3 space-y-3">
                                  {units.map((unit) => (
                                    <div key={unit.unit}>
                                      <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                                        {unit.unit}
                                      </p>
                                      <div className="mt-1 space-y-1">
                                        {unit.elements.map((element) => (
                                          <TopicRow
                                            key={element.label}
                                            label={element.label}
                                            detail={element.detail}
                                            on={ticked.includes(element.label)}
                                            onClick={() => toggleTopic(pick.name, element.label)}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="mt-3 space-y-1">
                                  {options.map((topic) => (
                                    <TopicRow
                                      key={topic}
                                      label={topic}
                                      detail=""
                                      on={ticked.includes(topic)}
                                      onClick={() => toggleTopic(pick.name, topic)}
                                    />
                                  ))}
                                </div>
                              )}
                            </>
                          ) : null}

                          {mode === "dfe" && options.length === 0 ? (
                            <p className="mt-3 text-[12px] font-bold text-muted-foreground">
                              No DfE list for this subject yet — type your own or upload a document.
                            </p>
                          ) : null}

                          {finalTopics.length && (step as number) === 5 ? (
                            <div className="mt-4 border-t border-border pt-3">
                              <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                                Rate each topic
                              </p>
                              <p className="mt-1 text-[12px] font-medium text-muted-foreground">
                                Red means you need it most, green means you're confident. Red topics
                                come first and get the most sessions — this builds your priority order.
                              </p>
                              <div className="mt-2">
                                <TopicConfidenceList
                                  topics={finalTopics}
                                  ratings={topicRatings[pick.name] ?? {}}
                                  onChange={(topic, value) =>
                                    setTopicRatings((prev) => ({
                                      ...prev,
                                      [pick.name]: { ...(prev[pick.name] ?? {}), [topic]: value },
                                    }))
                                  }
                                />
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 text-[12px] font-bold text-muted-foreground">
                {totalChosen
                  ? `${totalChosen} topic${totalChosen === 1 ? "" : "s"} chosen.`
                  : "Nothing chosen yet — that's fine, topics will be filled in for you."}
              </p>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <p className="text-lg font-extrabold tracking-tight">How much time have you got?</p>
              <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                Be realistic — a plan you can keep up beats a perfect one you abandon. Each day can
                have its own number of sessions and length.
              </p>


              <div className="mt-4">
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Plan start date
                </span>
                <div className="mt-1">
                  <DatePicker value={startDate} onChange={setStartDate} label="Choose a start date" />
                </div>
                <p className="mt-1.5 text-[12px] font-medium text-muted-foreground">
                  Every study session will be dated from here automatically.
                </p>
              </div>

              <label className="mt-4 block">
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Weeks until exams: {weeks}
                </span>
                <input
                  type="range"
                  min={1}
                  max={26}
                  value={weeks}
                  onChange={(e) => setWeeks(Number(e.target.value))}
                  className="mt-2 w-full accent-maths"
                />
              </label>

              <div className="mt-4">
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Study days
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {WEEK_DAYS.map((day) => {
                    const on = Boolean(dayConfigs[day]);
                    return (
                      <button
                        key={day}
                        onClick={() =>
                          setDayConfigs((prev) => {
                            const next = { ...prev };
                            if (next[day]) delete next[day];
                            else next[day] = { ...DEFAULT_DAY };
                            return next;
                          })
                        }
                        className={`rounded-full px-3 py-2 text-[13px] font-bold ${
                          on
                            ? "bg-structure text-structure-foreground"
                            : "bg-background text-muted-foreground ring-1 ring-border"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                {studyDays.map((day) => {
                  const config = dayConfigs[day]!;
                  return (
                    <div
                      key={day}
                      className="flex flex-wrap items-center gap-2 rounded-[12px] bg-background px-3 py-2 ring-1 ring-border"
                    >
                      <span className="text-sm font-bold">{day}</span>
                      <select
                        value={config.sessions}
                        onChange={(e) =>
                          setDayConfigs((prev) => ({
                            ...prev,
                            [day]: { ...config, sessions: Number(e.target.value) },
                          }))
                        }
                        className="ml-auto rounded-[10px] bg-card px-3 py-2 text-[13px] font-semibold ring-1 ring-border focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>
                            {n} session{n === 1 ? "" : "s"}
                          </option>
                        ))}
                      </select>
                      <select
                        value={config.minutes}
                        onChange={(e) =>
                          setDayConfigs((prev) => ({
                            ...prev,
                            [day]: { ...config, minutes: Number(e.target.value) },
                          }))
                        }
                        className="rounded-[10px] bg-card px-3 py-2 text-[13px] font-semibold ring-1 ring-border focus:outline-none"
                      >
                        {SESSION_LENGTHS.map((n) => (
                          <option key={n} value={n}>
                            {lengthLabel(n)} each
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
                {studyDays.length === 0 ? (
                  <p className="text-[12px] font-bold text-muted-foreground">
                    Pick at least one study day.
                  </p>
                ) : null}
              </div>

              <div className="mt-4 space-y-2">
                <IntensityField value={intensity} onChange={setIntensity} />
                <HolidayPlanner holidays={holidays} onChange={setHolidays} />
              </div>
            </>
          ) : null}

          {step === 5 ? (
            <>
              <p className="text-lg font-extrabold tracking-tight">Check what you know</p>
              <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                Rate each topic in any order — your answers save as you go. Red: I do not know this yet.
                Amber: I partly understand this. Green: I feel confident with this.
              </p>
              {!anyTopics ? (
                <p className="mt-4 rounded-[12px] bg-secondary px-3 py-3 text-[13px] font-bold">
                  Add some topics first, or skip this step and create your timetable now.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {picks.map((p) => {
                    const topics = topicsFor(p.name);
                    if (!topics.length) return null;
                    const done = topics.filter((t) => topicRatings[p.name]?.[t] != null).length;
                    return (
                      <div key={p.name}>
                        <p className="text-sm font-extrabold">
                          {p.name}{" "}
                          <span className="text-[12px] font-bold text-muted-foreground">· {done}/{topics.length} rated</span>
                        </p>
                        <div className="mt-2">
                          <TopicConfidenceList
                            topics={topics}
                            ratings={topicRatings[p.name] ?? {}}
                            onChange={(topic, value) =>
                              setTopicRatings((prev) => ({ ...prev, [p.name]: { ...(prev[p.name] ?? {}), [topic]: value } }))
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="mt-3 text-[12px] font-medium text-muted-foreground">
                Want to go deeper? The full <a href="/knowledge-checker" className="font-bold underline">Knowledge Checker</a> is still available any time.
              </p>
            </>
          ) : null}

          {step === 6 ? (
            <>
              <p className="text-lg font-extrabold tracking-tight">Review your priorities</p>
              <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                Ranked by confidence and how soon each exam is. Move topics up or down, or leave one out for now.
              </p>
              <ol className="mt-4 space-y-1.5">
                {orderedRanked.map((r, i) => {
                  const out = excluded.includes(r.key);
                  const live = orderedRanked.filter((x) => !excluded.includes(x.key));
                  const pos = live.indexOf(r);
                  const band = out ? "Left out" : pos < Math.ceil(live.length / 3) ? "High priority" : pos < Math.ceil((live.length * 2) / 3) ? "Medium priority" : "Maintain confidence";
                  return (
                    <li key={r.key} className={`flex items-center gap-2 rounded-[10px] bg-background px-3 py-2 ring-1 ring-border ${out ? "opacity-50" : ""}`}>
                      <span className="w-6 text-[12px] font-extrabold text-muted-foreground">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-extrabold">{r.topic}</p>
                        <p className="text-[11px] font-bold text-muted-foreground">
                          {r.subject} · {band} · {r.reason}
                        </p>
                      </div>
                      <button type="button" onClick={() => move(r.key, -1)} aria-label={`Move ${r.topic} up`} className="rounded-full px-2 py-1 text-sm font-bold ring-1 ring-border">↑</button>
                      <button type="button" onClick={() => move(r.key, 1)} aria-label={`Move ${r.topic} down`} className="rounded-full px-2 py-1 text-sm font-bold ring-1 ring-border">↓</button>
                      <button
                        type="button"
                        onClick={() => setExcluded((prev) => (out ? prev.filter((k) => k !== r.key) : [...prev, r.key]))}
                        className="rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-border"
                      >
                        {out ? "Include" : "Leave out"}
                      </button>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-3 flex flex-wrap gap-3 text-[12px] font-bold">
                <button type="button" className="underline" onClick={() => setStep(5)}>Change confidence ratings</button>
                <button type="button" className="underline" onClick={() => setStep(2)}>Edit topics</button>
                <button type="button" className="underline" onClick={() => setStep(3)}>Edit availability</button>
              </div>
            </>
          ) : null}

          {step === 7 ? (
            <>
              <p className="text-lg font-extrabold tracking-tight">You're ready to create your timetable.</p>
              <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                Check your details below. Nothing is created until you choose an option.
              </p>
              <div className="mt-4 space-y-1.5 text-[13px]">
                {picks.map((p) => (
                  <Row
                    key={p.name}
                    label={`${p.name}${p.tier ? ` (${p.tier})` : ""}`}
                    value={`${confidences[p.name] == null ? "Confidence not set" : (confidences[p.name] ?? 0) <= 2 ? "Low confidence" : (confidences[p.name] ?? 0) <= 4 ? "Medium confidence" : "High confidence"} · ${(examDates[p.name] ?? []).filter(Boolean).length ? `${(examDates[p.name] ?? []).filter(Boolean).length} exam date(s)` : "No exam date yet"}`}
                  />
                ))}
                <Row label="Study days" value={studyDays.length ? studyDays.join(", ") : "None"} />
                <Row label="Weeks" value={String(weeks)} />
                <Row label="Total sessions" value={String(totalSessions)} />
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-[12px] font-bold">
                <button type="button" className="underline" onClick={() => setStep(1)}>Change subjects or confidence</button>
                <button type="button" className="underline" onClick={() => setStep(3)}>Change revision time</button>
              </div>
              <p className="mt-4 text-[13px] font-extrabold">What would you like to do next?</p>
              <p className="text-[12px] font-medium text-muted-foreground">
                A Quick Plan is ready in seconds — you can personalise it later. Or add topics now for a more tailored timetable.
              </p>
            </>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {step !== 1 ? (
              <button
                onClick={() => setStep(step === 3 ? 1 : step === 7 ? 3 : step === 2 ? 7 : step === 5 ? 2 : 5)}
                className="rounded-full px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-background"
              >
                Back
              </button>
            ) : null}
            {step === 1 ? (
              <button onClick={() => setStep(3)} disabled={!canContinue} className="flex-1 rounded-full py-3 text-sm font-extrabold disabled:opacity-50 bg-primary text-primary-foreground">
                Continue to availability
              </button>
            ) : null}
            {step === 3 ? (
              <button onClick={() => setStep(7)} disabled={!canContinue} className="flex-1 rounded-full py-3 text-sm font-extrabold disabled:opacity-50 bg-primary text-primary-foreground">
                Review my details
              </button>
            ) : null}
            {step === 7 ? (
              <>
                <button onClick={() => void generate("quick")} disabled={generating || picks.length === 0 || studyDays.length === 0} className="flex-1 rounded-full py-3 text-sm font-extrabold disabled:opacity-50 bg-primary text-primary-foreground">
                  {generating ? "Building your timetable…" : "Create my Quick Plan"}
                </button>
                <button
                  onClick={() => { setTopicsVisited(true); setOpenSubject(picks[0]?.name ?? null); setStep(2); }}
                  disabled={picks.length === 0}
                  className="flex-1 rounded-full py-3 text-sm font-extrabold disabled:opacity-50 bg-foreground text-background"
                >
                  Make my plan more personalised
                </button>
              </>
            ) : null}
            {step === 2 ? (
              <>
                <button onClick={() => setStep(5)} disabled={!anyTopics} className="flex-1 rounded-full py-3 text-sm font-extrabold disabled:opacity-50 bg-primary text-primary-foreground">
                  Check what I know
                </button>
                <button onClick={() => void generate(anyTopics ? "topic" : "quick")} disabled={generating} className="flex-1 rounded-full py-3 text-sm font-extrabold disabled:opacity-50 bg-foreground text-background">
                  {generating ? "Building…" : "Create my timetable now"}
                </button>
              </>
            ) : null}
            {step === 5 ? (
              <>
                <button onClick={openPriorities} disabled={!anyTopics} className="flex-1 rounded-full py-3 text-sm font-extrabold disabled:opacity-50 bg-primary text-primary-foreground">
                  Finish knowledge check
                </button>
                <button onClick={() => { setCheckState("skipped"); void generate(anyTopics ? "topic" : "quick"); }} disabled={generating} className="flex-1 rounded-full py-3 text-sm font-extrabold disabled:opacity-50 bg-card text-foreground ring-1 ring-border">
                  Skip for now
                </button>
              </>
            ) : null}
            {step === 6 ? (
              <button onClick={() => void generate("personalised")} disabled={generating} className="flex-1 rounded-full py-3 text-sm font-extrabold disabled:opacity-50 bg-primary text-primary-foreground">
                {generating ? "Building your timetable…" : "Create my personalised timetable"}
              </button>
            ) : null}
            <button onClick={saveAndExit} className="w-full rounded-full py-2 text-[12px] font-bold text-muted-foreground underline">
              Save and exit
            </button>
          </div>
          {!canContinue ? (
            <div className="mt-2 rounded-[10px] bg-destructive/10 p-3 text-[12px] font-bold text-destructive" role="alert">
              <p>Before you continue:</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {(step === 1
                  ? [
                      nameError,
                      picks.length === 0 ? "Choose at least one subject." : null,
                      missingTierNames.length ? `Choose a tier for ${missingTierNames.join(", ")}.` : null,
                      missingConfidence.length ? `Choose how confident you feel in ${missingConfidence.join(", ")}.` : null,
                    ]
                  : [
                      !startDate ? "Choose a plan start date." : null,
                      studyDays.length === 0 ? "Choose at least one study day." : null,
                      holidayError ? "Fix the holiday dates." : null,
                    ]
                )
                  .filter(Boolean)
                  .map((msg) => <li key={msg}>{msg}</li>)}
              </ul>
            </div>
          ) : null}
          {holidayError ? <p className="mt-2 text-[12px] font-bold text-destructive">Fix the holiday dates before generating your timetable.</p> : null}
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] bg-background px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-extrabold">{value}</span>
    </div>
  );
}

function manualLines(text: string | undefined) {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function TopicRow({
  label,
  detail,
  on,
  onClick,
}: {
  label: string;
  detail: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-2.5 rounded-[10px] px-2 py-1.5 text-left hover:bg-card"
    >
      <span
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-[6px] ${
          on ? "bg-structure" : "ring-1 ring-border"
        }`}
      >
        {on ? <Check className="size-3 text-background" strokeWidth={3} /> : null}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-bold">{label}</span>
        {detail ? (
          <span className="block text-[12px] font-medium leading-relaxed text-muted-foreground">
            {detail}
          </span>
        ) : null}
      </span>
    </button>
  );
}
