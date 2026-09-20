import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { toast } from "sonner";

import { useAuth, ensureProfile } from "@/hooks/useAuth";
import { createPlan, fetchSubjects, resolveSubjectId } from "@/lib/plan";
import { EXAM_BOARDS, SESSION_LENGTHS, WEEK_DAYS } from "@/lib/subjects";
import { GCSE_SUBJECTS, SUBJECT_GROUPS, isTiered, type Tier } from "@/lib/gcse-subjects";
import { detailedTopicText, subjectUnits } from "@/lib/gcse-topics";
import { extractTopicsFromDocument } from "@/lib/revision.functions";

function boardLabel(board: string) {
  return board === "WJEC Eduqas" ? "WJEC / Eduqas" : board;
}

export const Route = createFileRoute("/_authenticated/setup")({
  head: () => ({
    meta: [
      { title: "Set up your plan — RevisionPath" },
      {
        name: "description",
        content:
          "Choose your GCSE subjects and tier, add your exam boards, set how many weeks and days you can study, and choose how topics get filled in.",
      },
      { property: "og:title", content: "Set up your plan — RevisionPath" },
      {
        property: "og:description",
        content: "Pick subjects and tiers, add exam boards, and generate your revision timetable.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SetupPage,
});

type Pick = { name: string; board: string | null; tier: Tier | null };
type DayConfig = { sessions: number; minutes: number };

const DEFAULT_DAY: DayConfig = { sessions: 2, minutes: 45 };
const TOTAL_STEPS = 5;
const STEP_LABELS = ["Pick subjects", "Exam boards", "Choose topics", "Set timeframe", "Review"];

type TopicSource = "dfe" | "manual" | "upload";

function lengthLabel(n: number) {
  return n < 60 ? `${n} min` : n === 60 ? "1 hr" : `${n / 60} hr`;
}

function SetupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const subjectsQuery = useQuery({ queryKey: ["subjects"], queryFn: fetchSubjects });
  const subjects = subjectsQuery.data ?? [];

  const [step, setStep] = useState(1);
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

  const [name, setName] = useState("Finals plan");
  const [weeks, setWeeks] = useState(6);
  const [dayConfigs, setDayConfigs] = useState<Record<string, DayConfig>>({
    Monday: { ...DEFAULT_DAY },
    Tuesday: { ...DEFAULT_DAY },
    Wednesday: { ...DEFAULT_DAY },
    Thursday: { ...DEFAULT_DAY },
  });
  const [generating, setGenerating] = useState(false);

  const studyDays = useMemo(
    () => WEEK_DAYS.filter((d) => dayConfigs[d]).map((d) => d as string),
    [dayConfigs],
  );

  /** Boards each stocked subject name is offered on. */
  const boardsByName = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const s of subjects) {
      const list = map.get(s.name) ?? [];
      if (!list.includes(s.exam_board)) list.push(s.exam_board);
      map.set(s.name, list);
    }
    return map;
  }, [subjects]);

  /** The national GCSE catalogue, grouped. */
  const allNames = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const group of SUBJECT_GROUPS) groups.set(group, []);
    for (const s of GCSE_SUBJECTS) groups.get(s.group)!.push(s.name);
    return groups;
  }, []);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out: { group: string; names: string[] }[] = [];
    for (const [group, names] of allNames) {
      const list = (q ? names.filter((n) => n.toLowerCase().includes(q)) : names).sort((a, b) =>
        a.localeCompare(b),
      );
      if (list.length) out.push({ group, names: list });
    }
    return out;
  }, [allNames, search]);

  function toggleName(subjectName: string) {
    setPicks((prev) => {
      if (prev.some((p) => p.name === subjectName)) {
        return prev.filter((p) => p.name !== subjectName);
      }
      const known = boardsByName.get(subjectName) ?? [];
      return [
        ...prev,
        { name: subjectName, board: known.length === 1 ? known[0]! : null, tier: null },
      ];
    });
  }

  function setBoard(subjectName: string, board: string) {
    setPicks((prev) => prev.map((p) => (p.name === subjectName ? { ...p, board } : p)));
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
    setPicks((prev) => [...prev, { name: trimmed, board: null, tier: null }]);
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

  async function readTopicsFile(subjectName: string, file: File) {
    setParsing(subjectName);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read that file."));
        reader.readAsDataURL(file);
      });
      const { topics } = await extractTopicsFromDocument({
        data: {
          subject: subjectName,
          fileName: file.name,
          mimeType: file.type || "application/pdf",
          dataUrl,
        },
      });
      if (!topics.length) {
        toast.error("We couldn't find topics in that document — try typing them instead.");
        return;
      }
      setUploaded((prev) => ({ ...prev, [subjectName]: topics }));
      setChosen((prev) => ({ ...prev, [subjectName]: topics }));
      toast.success(`Found ${topics.length} topics — untick anything you don't need.`);
    } catch (error) {
      console.error(error);
      toast.error("We couldn't read that document. Try a clearer file or type your topics.");
    } finally {
      setParsing(null);
    }
  }

  async function generate() {
    if (!user) return;
    setGenerating(true);
    try {
      await ensureProfile(user);
      const subjectIds: string[] = [];
      const tiers: Record<string, string | null> = {};
      const chosenTopics: Record<string, string[]> = {};
      const priorityTopics: Record<string, string[]> = {};
      for (const pick of picks) {
        const id = await resolveSubjectId(pick.name, pick.board!, user.id, subjects);
        subjectIds.push(id);
        tiers[id] = pick.tier;
        const topics = topicsFor(pick.name);
        if (topics.length) chosenTopics[id] = topics;
        const priority = prioritiesFor(pick.name);
        if (priority.length) priorityTopics[id] = priority;
      }
      await queryClient.invalidateQueries({ queryKey: ["subjects"] });

      const planId = await createPlan(user.id, {
        name: name.trim() || "My revision plan",
        weeks,
        days: studyDays.map((day) => ({
          day,
          sessions: dayConfigs[day]?.sessions ?? DEFAULT_DAY.sessions,
          minutes: dayConfigs[day]?.minutes ?? DEFAULT_DAY.minutes,
        })),
        // Subjects left blank get their topics written for them.
        contentMode: "ai",
        subjectIds,
        tiers,
        chosenTopics,
        priorityTopics,
      });
      window.localStorage.setItem("revisionpath.activePlan", planId);
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
  const missingBoards = picks.filter((p) => !p.board).length;
  const totalSessions =
    weeks * studyDays.reduce((sum, day) => sum + (dayConfigs[day]?.sessions ?? 0), 0);

  const totalChosen = picks.reduce((sum, p) => sum + topicsFor(p.name).length, 0);
  const totalPriorities = picks.reduce((sum, p) => sum + prioritiesFor(p.name).length, 0);

  const canContinue =
    step === 1
      ? picks.length > 0 && missingTiers === 0
      : step === 2
        ? missingBoards === 0
        : step === 4
          ? studyDays.length > 0 && weeks > 0
          : true;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-muted-foreground">
            Step {step} of {TOTAL_STEPS}
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`h-1 w-5 rounded-full ${n <= step ? "bg-maths" : "bg-border"}`}
              />
            ))}
          </div>
          <span className="ml-auto text-[11px] font-bold text-muted-foreground">
            {STEP_LABELS[step - 1]}
          </span>
        </div>

        <div className="rounded-[18px] bg-card p-4 ring-1 ring-black/5 sm:p-5">
          {step === 1 ? (
            <>
              <p className="text-lg font-extrabold tracking-tight">
                Which subjects are you revising?
              </p>
              <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                Search the full GCSE list and tick everything you're sitting. For tiered subjects,
                tell us whether you're on Foundation or Higher papers.
              </p>

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
                {filteredGroups.map(({ group, names }) => (
                  <div key={group}>
                    <p className="px-1 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                      {group}
                    </p>
                    <div className="mt-1 space-y-1">
                      {names.map((subjectName) => {
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
                                  isOn ? "bg-maths" : "ring-1 ring-border"
                                }`}
                              >
                                {isOn ? (
                                  <Check className="size-3 text-background" strokeWidth={3} />
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
                                        ? "bg-maths text-background"
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
                {filteredGroups.length === 0 ? (
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
                  <div className="mt-2 space-y-1.5">
                    {picks.map((pick) => (
                      <div
                        key={pick.name}
                        className="flex flex-wrap items-center gap-2 rounded-[12px] bg-background px-3 py-2 ring-1 ring-border"
                      >
                        <span className="text-sm font-bold">{pick.name}</span>
                        {isTiered(pick.name) ? (
                          <div className="ml-auto flex gap-1">
                            {(["Foundation", "Higher"] as const).map((tier) => (
                              <button
                                key={tier}
                                onClick={() => setTier(pick.name, tier)}
                                className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${
                                  pick.tier === tier
                                    ? "bg-maths text-background"
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
              <p className="text-lg font-extrabold tracking-tight">Which exam boards?</p>
              <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                Choose the board for each of your subjects.
              </p>

              <div className="mt-4">
                <div className="space-y-1.5">
                  {picks.map((pick) => (
                    <div
                      key={pick.name}
                      className="flex flex-wrap items-center gap-2 rounded-[12px] bg-background px-3 py-2 ring-1 ring-border"
                    >
                      <span className="text-sm font-bold">
                        {pick.name}
                        {pick.tier ? (
                          <span className="ml-1.5 text-[11px] font-bold text-muted-foreground">
                            {pick.tier}
                          </span>
                        ) : null}
                      </span>
                      <select
                        value={pick.board ?? ""}
                        onChange={(e) => setBoard(pick.name, e.target.value)}
                        className="ml-auto rounded-[10px] bg-card px-3 py-2 text-[13px] font-semibold ring-1 ring-border focus:outline-none"
                      >
                        <option value="" disabled>
                          Choose board
                        </option>
                        {EXAM_BOARDS.map((board) => (
                          <option key={board} value={board}>
                            {boardLabel(board)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                {missingBoards ? (
                  <p className="mt-2 text-[12px] font-bold text-muted-foreground">
                    {missingBoards} still need an exam board.
                  </p>
                ) : null}
              </div>
            </>
          ) : null}

          {step === 3 ? (
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
                                    ? "bg-maths text-background"
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

                          {mode === "upload" ? (
                            <div className="mt-3">
                              <input
                                type="file"
                                accept="application/pdf,image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) void readTopicsFile(pick.name, file);
                                  e.target.value = "";
                                }}
                                className="block w-full text-[12px] font-bold text-muted-foreground"
                              />
                              <p className="mt-1 text-[12px] font-medium text-muted-foreground">
                                {parsing === pick.name
                                  ? "Reading your document…"
                                  : options.length
                                    ? "Tick the topics you want to keep."
                                    : "Upload a PDF or photo of your topic list."}
                              </p>
                            </div>
                          ) : null}

                          {mode !== "manual" && options.length ? (
                            <>
                              <button
                                onClick={() => toggleAllTopics(pick.name, options)}
                                className={`mt-3 rounded-full px-3 py-1.5 text-[12px] font-bold ${
                                  ticked.length === options.length
                                    ? "bg-maths text-background"
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

                          {finalTopics.length ? (
                            <div className="mt-4 border-t border-border pt-3">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                                  Priority topics
                                </p>
                                <p className="text-[11px] font-bold text-muted-foreground">
                                  {subjectPriorities.length} of 3
                                </p>
                              </div>
                              <p className="mt-1 text-[12px] font-medium text-muted-foreground">
                                Choose up to three to place in the earliest weeks.
                              </p>
                              <div className="mt-2 space-y-1">
                                {finalTopics.map((topic) => {
                                  const priority = subjectPriorities.includes(topic);
                                  const disabled = !priority && subjectPriorities.length >= 3;
                                  return (
                                    <button
                                      key={topic}
                                      type="button"
                                      onClick={() => togglePriority(pick.name, topic)}
                                      disabled={disabled}
                                      className={`flex w-full items-start gap-2.5 rounded-[10px] px-2 py-1.5 text-left disabled:opacity-45 ${
                                        priority ? "bg-card" : "hover:bg-card"
                                      }`}
                                    >
                                      <span
                                        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-extrabold ${
                                          priority
                                            ? "bg-biz text-background"
                                            : "ring-1 ring-border"
                                        }`}
                                      >
                                        {priority ? subjectPriorities.indexOf(topic) + 1 : ""}
                                      </span>
                                      <span className="line-clamp-2 text-[12px] font-bold leading-relaxed">
                                        {topic}
                                      </span>
                                    </button>
                                  );
                                })}
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

          {step === 4 ? (
            <>
              <p className="text-lg font-extrabold tracking-tight">How much time have you got?</p>
              <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                Be realistic — a plan you can keep up beats a perfect one you abandon. Each day can
                have its own number of sessions and length.
              </p>

              <label className="mt-4 block">
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Plan name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-[12px] bg-background px-3 py-2.5 text-sm font-medium ring-1 ring-border focus:outline-none"
                />
              </label>

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
                            ? "bg-maths text-background"
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
            </>
          ) : null}

          {step === 5 ? (
            <>
              <p className="text-lg font-extrabold tracking-tight">Ready to build your plan</p>
              <div className="mt-4 space-y-2 text-[13px] font-semibold">
                <Row
                  label="Subjects"
                  value={picks
                    .map((p) => `${p.name}${p.tier ? ` (${p.tier})` : ""} · ${p.board}`)
                    .join(", ")}
                />
                <Row label="Weeks" value={`${weeks}`} />
                {studyDays.map((day) => (
                  <Row
                    key={day}
                    label={day}
                    value={`${dayConfigs[day]!.sessions} × ${lengthLabel(dayConfigs[day]!.minutes)}`}
                  />
                ))}
                <Row
                  label="Topics chosen"
                  value={totalChosen ? `${totalChosen} topics` : "None — filled for you"}
                />
                <Row
                  label="Priority topics"
                  value={totalPriorities ? `${totalPriorities} prioritised` : "None"}
                />
                <Row label="Total sessions" value={`${totalSessions}`} />
              </div>
              <p className="mt-3 text-[12px] font-medium text-muted-foreground">
                Any subject you left blank gets its topics written for you — this takes a few
                moments.
              </p>
            </>
          ) : null}

          <div className="mt-5 flex items-center gap-2">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="rounded-full px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-background"
              >
                Back
              </button>
            ) : null}
            {step < TOTAL_STEPS ? (
              <button
                onClick={() => {
                  setStep(step + 1);
                }}
                disabled={!canContinue}
                className="flex-1 rounded-full bg-primary py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={() => void generate()}
                disabled={generating}
                className="flex-1 rounded-full bg-primary py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-60"
              >
                {generating ? "Building your timetable…" : "Generate my timetable"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
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
          on ? "bg-maths" : "ring-1 ring-border"
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
