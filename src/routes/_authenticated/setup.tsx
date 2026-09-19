import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { Check, Loader2, Search, Upload } from "lucide-react";
import { toast } from "sonner";

import { useAuth, ensureProfile } from "@/hooks/useAuth";
import { createPlan, fetchSubjects, resolveSubjectId } from "@/lib/plan";
import { parseOptionsBooklet } from "@/lib/revision.functions";
import { EXAM_BOARDS, SESSION_LENGTHS, WEEK_DAYS } from "@/lib/subjects";

export const Route = createFileRoute("/_authenticated/setup")({
  head: () => ({
    meta: [
      { title: "Set up your plan — RevisionPath" },
      {
        name: "description",
        content:
          "Add your GCSE subjects and exam boards, set how many weeks and days you can study, and choose how topics get filled in.",
      },
      { property: "og:title", content: "Set up your plan — RevisionPath" },
      {
        property: "og:description",
        content: "Add subjects, set your timeframe, and generate your revision timetable.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SetupPage,
});

type Pick = { name: string; board: string | null };
type DayConfig = { sessions: number; minutes: number };

const DEFAULT_DAY: DayConfig = { sessions: 2, minutes: 45 };

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
  const [tab, setTab] = useState<"manual" | "upload">("manual");
  const [detected, setDetected] = useState<(Pick & { keep: boolean })[] | null>(null);
  const [parsing, setParsing] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

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

  /** Every distinct subject name we stock, with the boards it's offered on. */
  const boardsByName = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const s of subjects) {
      const list = map.get(s.name) ?? [];
      if (!list.includes(s.exam_board)) list.push(s.exam_board);
      map.set(s.name, list);
    }
    return map;
  }, [subjects]);

  const filteredNames = useMemo(() => {
    const q = search.trim().toLowerCase();
    const names = Array.from(boardsByName.keys()).sort((a, b) => a.localeCompare(b));
    return (q ? names.filter((n) => n.toLowerCase().includes(q)) : names).slice(0, 40);
  }, [boardsByName, search]);

  function boardOptions(subjectName: string) {
    const known = boardsByName.get(subjectName) ?? [];
    return Array.from(new Set([...known, ...EXAM_BOARDS]));
  }

  function toggleName(subjectName: string) {
    setPicks((prev) => {
      if (prev.some((p) => p.name === subjectName)) {
        return prev.filter((p) => p.name !== subjectName);
      }
      const known = boardsByName.get(subjectName) ?? [];
      return [...prev, { name: subjectName, board: known.length === 1 ? known[0]! : null }];
    });
  }

  function setBoard(subjectName: string, board: string) {
    setPicks((prev) => prev.map((p) => (p.name === subjectName ? { ...p, board } : p)));
  }

  function addCustomName() {
    const trimmed = customName.trim();
    if (!trimmed) return;
    if (picks.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("That subject is already on your list.");
      return;
    }
    setPicks((prev) => [...prev, { name: trimmed, board: null }]);
    setCustomName("");
  }

  async function handleFile(file: File) {
    setParsing(true);
    setDetected(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Couldn't read that file."));
        reader.readAsDataURL(file);
      });

      const { detected: found } = await parseOptionsBooklet({
        data: { fileName: file.name, mimeType: file.type || "application/pdf", dataUrl },
      });

      if (!found.length) {
        toast.error("We couldn't find any subjects in that file — pick them manually instead.");
        setTab("manual");
        return;
      }

      setDetected(
        found.map((item) => {
          const known = boardsByName.get(item.subject) ?? [];
          const board =
            known.find((b) => b.toLowerCase() === item.exam_board.toLowerCase()) ??
            (EXAM_BOARDS as readonly string[]).find(
              (b) => b.toLowerCase() === item.exam_board.toLowerCase(),
            ) ??
            (known.length === 1 ? known[0]! : null);
          return { name: item.subject, board, keep: true };
        }),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "That file couldn't be read — pick your subjects manually instead.",
      );
      setTab("manual");
    } finally {
      setParsing(false);
    }
  }

  function confirmDetected() {
    if (!detected) return;
    const keep = detected.filter((d) => d.keep);
    setPicks((prev) => {
      const next = [...prev];
      for (const item of keep) {
        if (!next.some((p) => p.name.toLowerCase() === item.name.toLowerCase())) {
          next.push({ name: item.name, board: item.board });
        }
      }
      return next;
    });
    setDetected(null);
    setTab("manual");
    toast.success(`${keep.length} subjects added — confirm each exam board below.`);
  }

  async function generate() {
    if (!user) return;
    setGenerating(true);
    try {
      await ensureProfile(user);
      const subjectIds: string[] = [];
      for (const pick of picks) {
        subjectIds.push(await resolveSubjectId(pick.name, pick.board!, user.id, subjects));
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

  const missingBoards = picks.filter((p) => !p.board).length;
  const totalSessions =
    weeks * studyDays.reduce((sum, day) => sum + (dayConfigs[day]?.sessions ?? 0), 0);

  const canContinue =
    step === 1
      ? picks.length > 0 && missingBoards === 0
      : step === 2
        ? studyDays.length > 0 && weeks > 0
        : true;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-muted-foreground">Step {step} of 4</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className={`h-1 w-5 rounded-full ${n <= step ? "bg-maths" : "bg-border"}`}
              />
            ))}
          </div>
          <span className="ml-auto text-[11px] font-bold text-muted-foreground">
            {step === 1
              ? "Add subjects"
              : step === 2
                ? "Set timeframe"
                : step === 3
                  ? "Choose topics"
                  : "Review"}
          </span>
        </div>

        <div className="rounded-[18px] bg-card p-4 ring-1 ring-black/5 sm:p-5">
          {step === 1 ? (
            <>
              <p className="text-lg font-extrabold tracking-tight">
                Which subjects are you revising?
              </p>
              <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                Pick your subjects first, then set the exam board for each one. Or upload your
                school's options booklet and we'll draft the list.
              </p>

              <div className="mt-4 flex gap-1 rounded-full bg-background p-1 ring-1 ring-border">
                {(
                  [
                    ["manual", "Pick manually"],
                    ["upload", "Upload booklet"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex-1 rounded-full py-2 text-[13px] font-bold ${
                      tab === key
                        ? "bg-card text-foreground ring-1 ring-border"
                        : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === "upload" ? (
                <div className="mt-4">
                  {detected ? (
                    <div>
                      <p className="text-[13px] font-bold">
                        We found these — untick anything wrong, then confirm.
                      </p>
                      <div className="mt-2 max-h-64 space-y-1.5 overflow-y-auto pr-1">
                        {detected.map((item, index) => (
                          <label
                            key={`${item.name}-${index}`}
                            className="flex cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 py-2 hover:bg-background"
                          >
                            <input
                              type="checkbox"
                              checked={item.keep}
                              onChange={(e) =>
                                setDetected((prev) =>
                                  (prev ?? []).map((d, i) =>
                                    i === index ? { ...d, keep: e.target.checked } : d,
                                  ),
                                )
                              }
                              className="size-4 accent-maths"
                            />
                            <span className="text-sm font-bold">{item.name}</span>
                            <span className="ml-auto text-[12px] font-semibold text-muted-foreground">
                              {item.board ?? "board to confirm"}
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={confirmDetected}
                          className="flex-1 rounded-full bg-primary py-3 text-sm font-extrabold text-primary-foreground"
                        >
                          Add these subjects
                        </button>
                        <button
                          onClick={() => setDetected(null)}
                          className="rounded-full px-4 py-3 text-sm font-bold text-muted-foreground"
                        >
                          Start again
                        </button>
                      </div>
                      <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                        Booklets vary a lot, so treat this as a quick draft — you can add anything
                        missed on the manual tab.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInput.current?.click()}
                      disabled={parsing}
                      className="flex w-full items-center gap-3 rounded-[12px] border border-dashed border-border px-3 py-4 text-left"
                    >
                      <div className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-background text-muted-foreground">
                        {parsing ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Upload className="size-4" strokeWidth={2.5} />
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold">
                          {parsing ? "Reading your booklet…" : "Upload options booklet"}
                        </p>
                        <p className="text-[11px] font-medium text-muted-foreground">
                          PDF or a photo of the pages
                        </p>
                      </div>
                    </button>
                  )}
                  <input
                    ref={fileInput}
                    type="file"
                    accept="application/pdf,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleFile(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              ) : (
                <>
                  <div className="mt-4 flex items-center gap-2 rounded-[12px] bg-background px-3 py-2.5 ring-1 ring-border">
                    <Search className="size-4 text-muted-foreground" strokeWidth={2.5} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search subjects…"
                      className="w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>

                  <div className="mt-3 max-h-56 space-y-1.5 overflow-y-auto pr-1">
                    {filteredNames.map((subjectName) => {
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
                        </button>
                      );
                    })}
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
                </>
              )}

              {picks.length ? (
                <div className="mt-5">
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                    Your subjects — choose each exam board
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {picks.map((pick) => (
                      <div
                        key={pick.name}
                        className="flex flex-wrap items-center gap-2 rounded-[12px] bg-background px-3 py-2 ring-1 ring-border"
                      >
                        <span className="text-sm font-bold">{pick.name}</span>
                        <select
                          value={pick.board ?? ""}
                          onChange={(e) => setBoard(pick.name, e.target.value)}
                          className="ml-auto rounded-[10px] bg-card px-3 py-2 text-[13px] font-semibold ring-1 ring-border focus:outline-none"
                        >
                          <option value="" disabled>
                            Choose board
                          </option>
                          {boardOptions(pick.name).map((board) => (
                            <option key={board} value={board}>
                              {board}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() =>
                            setPicks((prev) => prev.filter((p) => p.name !== pick.name))
                          }
                          className="text-[12px] font-bold text-muted-foreground hover:text-foreground"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  {missingBoards ? (
                    <p className="mt-2 text-[12px] font-bold text-muted-foreground">
                      {missingBoards} still need an exam board.
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

          {step === 3 ? (
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

          {step === 4 ? (
            <>
              <p className="text-lg font-extrabold tracking-tight">Ready to build your plan</p>
              <div className="mt-4 space-y-2 text-[13px] font-semibold">
                <Row
                  label="Subjects"
                  value={picks.map((p) => `${p.name} · ${p.board}`).join(", ")}
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
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
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
