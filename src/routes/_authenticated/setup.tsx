import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { Check, Loader2, Search, Upload } from "lucide-react";
import { toast } from "sonner";

import { useAuth, ensureProfile } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { createPlan, fetchSubjects, type Subject } from "@/lib/plan";
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

type Detected = { subject: string; exam_board: string; subjectId: string | null; keep: boolean };

function SetupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const subjectsQuery = useQuery({ queryKey: ["subjects"], queryFn: fetchSubjects });
  const subjects = subjectsQuery.data ?? [];

  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"manual" | "upload">("manual");
  const [detected, setDetected] = useState<Detected[] | null>(null);
  const [parsing, setParsing] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const [customName, setCustomName] = useState("");
  const [customBoard, setCustomBoard] = useState<string>(EXAM_BOARDS[0]);

  const [name, setName] = useState("Finals plan");
  const [weeks, setWeeks] = useState(6);
  const [studyDays, setStudyDays] = useState<string[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
  ]);
  const [sessionsPerDay, setSessionsPerDay] = useState(2);
  const [length, setLength] = useState<number>(45);
  const [mode, setMode] = useState<"ai" | "manual" | "library">("ai");
  const [generating, setGenerating] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? subjects.filter((s) => `${s.name} ${s.exam_board}`.toLowerCase().includes(q))
      : subjects;
    return list.slice(0, 40);
  }, [subjects, search]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function addCustom() {
    if (!user || !customName.trim()) return;
    const { data, error } = await supabase
      .from("subjects")
      .insert({
        name: customName.trim(),
        exam_board: customBoard,
        is_custom: true,
        created_by: user.id,
        color_key: "media",
      })
      .select("id, name, exam_board, color_key, is_custom")
      .single();
    if (error) {
      toast.error("Couldn't add that subject.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["subjects"] });
    setSelected((prev) => [...prev, (data as Subject).id]);
    setCustomName("");
    toast.success("Subject added.");
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
          const match =
            subjects.find(
              (s) =>
                s.name.toLowerCase() === item.subject.toLowerCase() &&
                s.exam_board.toLowerCase() === item.exam_board.toLowerCase(),
            ) ??
            subjects.find((s) => s.name.toLowerCase() === item.subject.toLowerCase()) ??
            null;
          return {
            subject: item.subject,
            exam_board: item.exam_board || match?.exam_board || "",
            subjectId: match?.id ?? null,
            keep: Boolean(match),
          };
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
    const ids = detected.filter((d) => d.keep && d.subjectId).map((d) => d.subjectId!);
    setSelected((prev) => Array.from(new Set([...prev, ...ids])));
    setDetected(null);
    setTab("manual");
    toast.success(`${ids.length} subjects added — check the list below.`);
  }

  async function generate() {
    if (!user) return;
    setGenerating(true);
    try {
      await ensureProfile(user);
      const planId = await createPlan(user.id, {
        name: name.trim() || "My revision plan",
        weeks,
        studyDays,
        sessionsPerDay,
        sessionLengthMinutes: length,
        contentMode: mode,
        subjectIds: selected,
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

  const canContinue =
    step === 1 ? selected.length > 0 : step === 2 ? studyDays.length > 0 && weeks > 0 : true;

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
                Search and tick each subject with its exam board, or upload your school's options
                booklet and we'll draft the list.
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
                      tab === key ? "bg-card text-foreground ring-1 ring-border" : "text-muted-foreground"
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
                            key={`${item.subject}-${index}`}
                            className="flex cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 py-2 hover:bg-background"
                          >
                            <input
                              type="checkbox"
                              checked={item.keep}
                              disabled={!item.subjectId}
                              onChange={(e) =>
                                setDetected((prev) =>
                                  (prev ?? []).map((d, i) =>
                                    i === index ? { ...d, keep: e.target.checked } : d,
                                  ),
                                )
                              }
                              className="size-4 accent-maths"
                            />
                            <span className="text-sm font-bold">{item.subject}</span>
                            <span className="ml-auto text-[12px] font-semibold text-muted-foreground">
                              {item.subjectId
                                ? item.exam_board || "board not stated"
                                : "not in our list"}
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
                      placeholder="Search subjects and boards…"
                      className="w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>

                  <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto pr-1">
                    {filtered.map((subject) => {
                      const isOn = selected.includes(subject.id);
                      return (
                        <button
                          key={subject.id}
                          onClick={() => toggle(subject.id)}
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
                          <span className="text-sm font-bold">{subject.name}</span>
                          <span className="ml-auto text-[12px] font-semibold text-muted-foreground">
                            {subject.exam_board}
                          </span>
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
                      <select
                        value={customBoard}
                        onChange={(e) => setCustomBoard(e.target.value)}
                        className="rounded-[10px] bg-card px-3 py-2 text-[13px] font-semibold ring-1 ring-border focus:outline-none"
                      >
                        {EXAM_BOARDS.map((board) => (
                          <option key={board} value={board}>
                            {board}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => void addCustom()}
                        className="rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-primary-foreground"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </>
              )}

              <p className="mt-3 text-[12px] font-bold text-muted-foreground">
                {selected.length} subject{selected.length === 1 ? "" : "s"} selected
              </p>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <p className="text-lg font-extrabold tracking-tight">How much time have you got?</p>
              <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                Be realistic — a plan you can keep up beats a perfect one you abandon.
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
                    const on = studyDays.includes(day);
                    return (
                      <button
                        key={day}
                        onClick={() =>
                          setStudyDays((prev) =>
                            prev.includes(day)
                              ? prev.filter((d) => d !== day)
                              : [...prev, day].sort(
                                  (a, b) => WEEK_DAYS.indexOf(a as never) - WEEK_DAYS.indexOf(b as never),
                                ),
                          )
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

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    Sessions per study day
                  </span>
                  <select
                    value={sessionsPerDay}
                    onChange={(e) => setSessionsPerDay(Number(e.target.value))}
                    className="mt-1 w-full rounded-[12px] bg-background px-3 py-2.5 text-sm font-semibold ring-1 ring-border focus:outline-none"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    Session length
                  </span>
                  <select
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="mt-1 w-full rounded-[12px] bg-background px-3 py-2.5 text-sm font-semibold ring-1 ring-border focus:outline-none"
                  >
                    {SESSION_LENGTHS.map((n) => (
                      <option key={n} value={n}>
                        {n < 60 ? `${n} min` : n === 60 ? "1 hr" : "1 hr 30"}
                      </option>
                    ))}
                  </select>
                </label>
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
                <Row label="Subjects" value={`${selected.length} selected`} />
                <Row label="Weeks" value={`${weeks}`} />
                <Row label="Study days" value={studyDays.map((d) => d.slice(0, 3)).join(", ")} />
                <Row
                  label="Sessions"
                  value={`${sessionsPerDay} per day · ${length < 60 ? `${length} min` : `${length / 60} hr`}`}
                />
                <Row
                  label="Topics"
                  value={
                    mode === "ai" ? "AI-generated" : mode === "manual" ? "Manual" : "Pre-built library"
                  }
                />
                <Row
                  label="Total sessions"
                  value={`${weeks * studyDays.length * sessionsPerDay}`}
                />
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
    <div className="flex items-center justify-between rounded-[10px] bg-background px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-extrabold">{value}</span>
    </div>
  );
}
