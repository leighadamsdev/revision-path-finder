import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { toast } from "sonner";

import { useAuth, ensureProfile } from "@/hooks/useAuth";
import { createPlan, fetchSubjects, resolveSubjectId } from "@/lib/plan";
import { EXAM_BOARDS, SESSION_LENGTHS, WEEK_DAYS } from "@/lib/subjects";
import { GCSE_SUBJECTS, SUBJECT_GROUPS, isTiered, type Tier } from "@/lib/gcse-subjects";

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
const STEP_LABELS = ["Pick subjects", "Exam boards", "Set timeframe", "Choose topics", "Review"];

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

  const [customName, setCustomName] = useState("");

  const [name, setName] = useState("Finals plan");
  const [weeks, setWeeks] = useState(6);
  const [dayConfigs, setDayConfigs] = useState<Record<string, DayConfig>>({
    Monday: { ...DEFAULT_DAY },
    Tuesday: { ...DEFAULT_DAY },
    Wednesday: { ...DEFAULT_DAY },
    Thursday: { ...DEFAULT_DAY },
  });
  const [mode, setMode] = useState<"ai" | "manual" | "library">("ai");
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
      prev.map((p) =>
        p.name === subjectName ? { ...p, tier: p.tier === tier ? null : tier } : p,
      ),
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


  async function generate() {
    if (!user) return;
    setGenerating(true);
    try {
      await ensureProfile(user);
      const subjectIds: string[] = [];
      const tiers: Record<string, string | null> = {};
      for (const pick of picks) {
        const id = await resolveSubjectId(pick.name, pick.board!, user.id, subjects);
        subjectIds.push(id);
        tiers[id] = pick.tier;
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
        contentMode: mode,
        subjectIds,
        tiers,
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

  const canContinue =
    step === 1
      ? picks.length > 0 && missingTiers === 0
      : step === 2
        ? missingBoards === 0
        : step === 3
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

              {search.trim() ? (
                <div className="mt-3 max-h-72 space-y-3 overflow-y-auto pr-1">
                  {filteredGroups.map(({ group, names }) => (
                    <div key={group}>
                      <p className="px-1 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                        {group}
                      </p>
                      <div className="mt-1 space-y-1">
                        {names.map((subjectName) => {
                          const isOn = picks.some((p) => p.name === subjectName);
                          return (
                            <button
                              key={subjectName}
                              onClick={() => toggleName(subjectName)}
                              className="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left hover:bg-background"
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
                              {isTiered(subjectName) ? (
                                <span className="ml-auto text-[11px] font-bold text-muted-foreground">
                                  tiered
                                </span>
                              ) : null}
                            </button>
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
              ) : (
                <p className="mt-3 text-[12px] font-medium text-muted-foreground">
                  Start typing a subject name to find it, then tap to add it to your list.
                </p>
              )}


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

          {step === 4 ? (
            <>
              <p className="text-lg font-extrabold tracking-tight">
                How should topics be filled in?
              </p>
              <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                You can still edit or regenerate any single session later.
              </p>
              <div className="mt-4 space-y-2">
                {(
                  [
                    [
                      "ai",
                      "AI-generated",
                      "A spread-out sequence of topics per subject, based on your exam board. Weak areas come back later on.",
                    ],
                    [
                      "manual",
                      "Manual entry",
                      "Sessions are created empty with just the day and subject — you type each topic yourself.",
                    ],
                    [
                      "library",
                      "Pre-built library",
                      "Topics pulled in order from our curated lists for your subject and board.",
                    ],
                  ] as const
                ).map(([key, title, body]) => (
                  <button
                    key={key}
                    onClick={() => setMode(key)}
                    className={`w-full rounded-[14px] p-4 text-left ring-1 ${
                      mode === key ? "bg-maths/10 ring-maths/40" : "bg-background ring-border"
                    }`}
                  >
                    <p className="text-[15px] font-extrabold tracking-tight">{title}</p>
                    <p className="mt-1 text-[13px] font-medium leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </button>
                ))}
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
                  label="Topics"
                  value={
                    mode === "ai"
                      ? "AI-generated"
                      : mode === "manual"
                        ? "Manual"
                        : "Pre-built library"
                  }
                />
                <Row label="Total sessions" value={`${totalSessions}`} />
              </div>
              {mode === "ai" ? (
                <p className="mt-3 text-[12px] font-medium text-muted-foreground">
                  Generating topics takes a few moments — hang on while we write them.
                </p>
              ) : null}
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
