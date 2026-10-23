import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ConfidencePicker } from "@/components/ConfidencePicker";
import { DatePicker } from "@/components/DatePicker";
import { ExamDatesField } from "@/components/ExamDatesField";
import { ExamDateUpload } from "@/components/ExamDateUpload";
import { HolidayPlanner } from "@/components/HolidayPlanner";
import { IntensityField } from "@/components/IntensityField";
import { CapacityControls } from "@/components/CapacityControls";
import { TopicConfidenceList } from "@/components/TopicConfidenceList";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActivePlan, usePlanSubjects, usePlanTopics } from "@/hooks/useActivePlan";
import {
  deletePlan,
  fetchSubjects,
  regeneratePlanSessions,
  savePlanSubjects,
  savePlanTopics,
  updatePlanSettings,
  updatePlanCapacity,
  type Capacity,
  type DaySetting,
  type HolidayPeriod,
  type Intensity,
} from "@/lib/plan";
import { SESSION_LENGTHS, WEEK_DAYS, subjectStyle } from "@/lib/subjects";

export const Route = createFileRoute("/_authenticated/edit-plan")({
  head: () => ({
    meta: [
      { title: "Edit revision plan — RevPlan" },
      {
        name: "description",
        content:
          "Update your subjects, exam dates, confidence ratings, weeks and study days — then rebuild your timetable.",
      },
      { property: "og:title", content: "Edit revision plan — RevPlan" },
      {
        property: "og:description",
        content: "Change your plan settings and exam dates without losing your notes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EditPlanPage,
});

type Row = {
  subjectId: string;
  name: string;
  colorKey: string;
  tier: string | null;
  examDates: string[];
  confidence: number | null;
};

type TopicRow = {
  subjectId: string;
  topic: string;
  confidence: number | null;
  isPriority: boolean;
};


function lengthLabel(n: number) {
  return n < 60 ? `${n} min` : n === 60 ? "1 hr" : `${n / 60} hr`;
}

function EditPlanPage() {
  const { plan, plans, isLoading } = useActivePlan();
  const planSubjects = usePlanSubjects(plan?.id);
  const planTopics = usePlanTopics(plan?.id);
  const allSubjects = useQuery({ queryKey: ["subjects"], queryFn: fetchSubjects });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [weeks, setWeeks] = useState(6);
  const [days, setDays] = useState<Record<string, { sessions: number; minutes: number }>>({});
  const [rows, setRows] = useState<Row[]>([]);
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [holidays, setHolidays] = useState<HolidayPeriod[]>([]);
  const [capacity, setCapacity] = useState<Capacity>({});
  const [addId, setAddId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  useEffect(() => {
    if (!plan) return;
    setName(plan.name);
    setStartDate(plan.start_date || format(new Date(plan.created_at), "yyyy-MM-dd"));
    setWeeks(plan.weeks);
    const source: DaySetting[] =
      plan.day_plan && plan.day_plan.length
        ? plan.day_plan
        : plan.study_days.map((day) => ({
            day,
            sessions: plan.sessions_per_day,
            minutes: plan.session_length_minutes,
          }));
    setDays(
      Object.fromEntries(
        source.map((entry) => [entry.day, { sessions: entry.sessions, minutes: entry.minutes }]),
      ),
    );
    setIntensity(
      plan.intensity_weeks && plan.intensity_sessions_per_day
        ? { weeks: plan.intensity_weeks, sessions: plan.intensity_sessions_per_day }
        : null,
    );
    setHolidays(plan.holiday_periods ?? []);
    setCapacity({
      weeklyMinutesBudget: plan.weekly_minutes_budget,
      holidayBoost: plan.holiday_boost,
      preExamBoost: plan.pre_exam_boost,
      preExamWeeks: plan.pre_exam_weeks ?? 4,
    });
  }, [plan]);

  useEffect(() => {
    if (!planTopics.data) return;
    setTopics(
      planTopics.data.map((row) => ({
        subjectId: row.subject_id,
        topic: row.topic,
        confidence: row.confidence,
        isPriority: row.is_priority,
      })),
    );
  }, [planTopics.data]);

  useEffect(() => {
    if (!planSubjects.data) return;
    setRows(
      planSubjects.data.map((subject) => ({
        subjectId: subject.id,
        name: subject.name,
        colorKey: subject.color_key,
        tier: subject.tier,
        examDates: subject.exam_dates,
        confidence: subject.confidence,
      })),
    );
  }, [planSubjects.data]);

  const studyDays = useMemo(() => WEEK_DAYS.filter((day) => days[day]).map(String), [days]);
  const holidaysValid = holidays.every((holiday) => !holiday.start || !holiday.end || holiday.end >= holiday.start);

  const addable = (allSubjects.data ?? []).filter(
    (subject) => !rows.some((row) => row.subjectId === subject.id),
  );

  function patchRow(subjectId: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((row) => (row.subjectId === subjectId ? { ...row, ...patch } : row)));
  }

  async function save() {
    if (!plan || !startDate || rows.length === 0 || studyDays.length === 0 || !holidaysValid) return;
    setSaving(true);
    try {
      const daySettings: DaySetting[] = studyDays.map((day) => ({
        day,
        sessions: days[day]?.sessions ?? 2,
        minutes: days[day]?.minutes ?? 45,
      }));

      const cleanRows = rows.map((row) => ({
        ...row,
        examDates: [...new Set(row.examDates.filter(Boolean))].sort(),
      }));

      const cleanHolidays = holidays.filter((holiday) => holiday.start && holiday.end);
      const keptTopics = topics.filter((topic) =>
        cleanRows.some((row) => row.subjectId === topic.subjectId),
      );

      await savePlanSubjects(plan.id, cleanRows);
      await savePlanTopics(plan.id, keptTopics);
      await updatePlanSettings(plan.id, {
        name,
        startDate,
        weeks,
        days: daySettings,
        intensity,
        holidays: cleanHolidays,
      });
      await updatePlanCapacity(plan.id, capacity);
      await regeneratePlanSessions(plan.id, {
        startDate,
        weeks,
        days: daySettings,
        intensity,
        holidays: cleanHolidays,
        subjects: cleanRows.map((row) => ({
          subjectId: row.subjectId,
          name: row.name,
          examDates: row.examDates,
          confidence: row.confidence,
          topics: keptTopics
            .filter((topic) => topic.subjectId === row.subjectId)
            .map((topic) => ({
              topic: topic.topic,
              confidence: topic.confidence,
              isPriority: topic.isPriority,
            })),
        })),
      });


      await queryClient.invalidateQueries();
      toast.success("Plan updated — your timetable has been rebuilt.");
      navigate({ to: "/plan" });
    } catch (error) {
      console.error(error);
      toast.error("Your changes couldn't be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!plan) return;
    setDeleting(true);
    try {
      const wasLast = plans.length <= 1;
      await deletePlan(plan.id);
      window.localStorage.removeItem("revisionpath.activePlan");
      await queryClient.invalidateQueries();
      toast.success("Plan deleted.");
      navigate({ to: wasLast ? "/setup" : "/plan" });
    } catch (error) {
      console.error(error);
      toast.error("That plan couldn't be deleted — try again.");
    } finally {
      setDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-3" aria-label="Checking for your plan"><p className="text-sm font-semibold text-muted-foreground">Checking for your plan…</p><div className="h-28 animate-pulse rounded-[8px] bg-card" /></div>
      </AppShell>
    );
  }

  if (!plan) {
    return (
      <AppShell>
        <div className="rounded-[8px] bg-card p-6 ring-1 ring-border">
          <h1 className="text-lg font-extrabold">Create your first plan</h1>
          <p className="mt-2 text-[13px] font-medium text-muted-foreground">There isn't a plan to edit yet. Start setup to choose your subjects and study time.</p>
          <Button asChild className="mt-5"><Link to="/setup">Create your first plan</Link></Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-extrabold tracking-tight">Edit plan</h1>
        <p className="mt-1 text-[13px] font-medium text-muted-foreground">
          Change anything here and your timetable is rebuilt around it. Your gaps-to-revisit notes
          stay where they are.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/setup" search={{ from: plan.id, mode: "edit" }}>Edit from the start (step 1)</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/setup" search={{ from: plan.id, mode: "copy" }}>Copy this plan and edit</Link>
          </Button>
        </div>

        <div className="mt-5 rounded-[16px] bg-card p-5 ring-1 ring-black/5">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Plan name
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-[12px] bg-background px-3 py-2.5 text-sm font-medium ring-1 ring-border focus:outline-none"
            />
          </label>

          <div className="mt-4">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Plan start date
            </span>
            <div className="mt-1">
              <DatePicker value={startDate} onChange={setStartDate} />
            </div>
          </div>

          <label className="mt-4 block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Weeks in this plan: {weeks}
            </span>
            <input
              type="range"
              min={1}
              max={52}
              value={weeks}
              onChange={(event) => setWeeks(Number(event.target.value))}
              className="mt-2 w-full accent-maths"
            />
          </label>

          <div className="mt-4">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Study days
            </span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {WEEK_DAYS.map((day) => {
                const on = Boolean(days[day]);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setDays((prev) => {
                        const next = { ...prev };
                        if (next[day]) delete next[day];
                        else next[day] = { sessions: 2, minutes: 45 };
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
              const config = days[day]!;
              return (
                <div
                  key={day}
                  className="flex flex-wrap items-center gap-2 rounded-[12px] bg-background px-3 py-2 ring-1 ring-border"
                >
                  <span className="text-sm font-bold">{day}</span>
                  <select
                    value={config.sessions}
                    onChange={(event) =>
                      setDays((prev) => ({
                        ...prev,
                        [day]: { ...config, sessions: Number(event.target.value) },
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
                    onChange={(event) =>
                      setDays((prev) => ({
                        ...prev,
                        [day]: { ...config, minutes: Number(event.target.value) },
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
            <CapacityControls value={capacity} onChange={setCapacity} />
          </div>
        </div>

        <div className="mt-4 rounded-[16px] bg-card p-5 ring-1 ring-black/5">
          <p className="text-sm font-extrabold tracking-tight">Subjects, exam dates and confidence</p>
          <p className="mt-1 text-[13px] font-medium text-muted-foreground">
            Exam dates are optional — add them whenever your school confirms them. Topics you feel
            shakiest about, and exams coming up soonest, get more sessions.
          </p>

          <div className="mt-3">
            <ExamDateUpload
              subjects={rows.map((row) => row.name)}
              onApply={(dates) =>
                setRows((prev) =>
                  prev.map((row) => {
                    const found = dates[row.name];
                    if (!found) return row;
                    return {
                      ...row,
                      examDates: [...new Set([...row.examDates.filter(Boolean), ...found])]
                        .sort()
                        .slice(0, 3),
                    };
                  }),
                )
              }
            />
          </div>

          <div className="mt-4 space-y-2.5">
            {rows.map((row) => {
              const style = subjectStyle(row.colorKey);
              const subjectTopics = topics.filter((topic) => topic.subjectId === row.subjectId);
              return (
                <div key={row.subjectId} className="rounded-[14px] bg-background p-3 ring-1 ring-border">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${style.tag}`}
                    >
                      <span className={`size-1.5 rounded-full ${style.dot}`} />
                      {row.name}
                      {row.tier ? ` · ${row.tier}` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setRows((prev) => prev.filter((item) => item.subjectId !== row.subjectId))
                      }
                      className="ml-auto text-[12px] font-bold text-muted-foreground hover:text-foreground"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      Exam dates used for planning
                    </span>
                    <p className="mt-0.5 text-[12px] font-medium text-muted-foreground">
                      Your first, middle and last papers set the pace of your plan. See every paper
                      and add mocks on your{" "}
                      <Link to="/exams" className="font-bold underline">
                        exam timetable
                      </Link>
                      .
                    </p>
                    <div className="mt-1">
                      <ExamDatesField
                        dates={row.examDates}
                        onChange={(dates) => patchRow(row.subjectId, { examDates: dates })}
                      />
                    </div>
                  </div>

                  {subjectTopics.length ? (
                    <div className="mt-3">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        Confidence on each topic
                      </span>
                      <div className="mt-2">
                        <TopicConfidenceList
                          topics={subjectTopics.map((topic) => topic.topic)}
                          ratings={Object.fromEntries(
                            subjectTopics.map((topic) => [topic.topic, topic.confidence]),
                          )}
                          onChange={(topic, value) =>
                            setTopics((prev) =>
                              prev.map((item) =>
                                item.subjectId === row.subjectId && item.topic === topic
                                  ? { ...item, confidence: value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        Confidence in {row.name} {row.confidence ? `${row.confidence}/5` : ""}
                      </span>
                      <div className="mt-2">
                        <ConfidencePicker
                          value={row.confidence}
                          onChange={(value) => patchRow(row.subjectId, { confidence: value })}
                          label={`${row.name} confidence`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {rows.length === 0 ? (
              <p className="text-[12px] font-bold text-muted-foreground">
                Add at least one subject.
              </p>
            ) : null}
          </div>

          {addable.length ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <select
                value={addId}
                onChange={(event) => setAddId(event.target.value)}
                className="min-w-0 flex-1 rounded-[10px] bg-background px-3 py-2 text-[13px] font-semibold ring-1 ring-border focus:outline-none"
              >
                <option value="">Add another subject…</option>
                {addable.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                disabled={!addId}
                onClick={() => {
                  const subject = addable.find((item) => item.id === addId);
                  if (!subject) return;
                  setRows((prev) => [
                    ...prev,
                    {
                      subjectId: subject.id,
                      name: subject.name,
                      colorKey: subject.color_key,
                      tier: null,
                      examDates: [],
                      confidence: null,
                    },
                  ]);
                  setAddId("");
                }}
              >
                Add
              </Button>
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="flex-1">
            <Link to="/plan">Cancel</Link>
          </Button>
          <Button
            className="flex-1"
            disabled={!startDate || saving || rows.length === 0 || studyDays.length === 0 || !holidaysValid}
            onClick={() => void save()}
          >
            {saving ? "Rebuilding your timetable…" : "Save and rebuild"}
          </Button>
        </div>

        <div className="mt-6 rounded-[16px] bg-card p-5 ring-1 ring-black/5">
          <p className="text-sm font-extrabold tracking-tight">Delete this plan</p>
          <p className="mt-1 text-[13px] font-medium text-muted-foreground">
            Removes the plan and every session in it. This can't be undone.
          </p>
          <Button variant="destructive" className="mt-3" onClick={() => { setDeleteText(""); setDeleteOpen(true); }}>
            <Trash2 aria-hidden="true" />
            Delete plan
          </Button>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete "{plan.name}"?</DialogTitle>
            <DialogDescription>
              This will permanently delete this plan and all its sessions — are you sure?
            </DialogDescription>
          </DialogHeader>
          <label className="block text-sm font-bold">Type <span className="font-extrabold">{plan.name}</span> to confirm
            <input value={deleteText} onChange={(event) => setDeleteText(event.target.value)} className="mt-2 w-full rounded-[8px] bg-background px-3 py-2.5 font-medium ring-1 ring-border focus:outline-none" />
          </label>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Keep this plan
            </Button>
            <Button variant="destructive" onClick={() => void remove()} disabled={deleting || deleteText !== plan.name}>
              {deleting ? "Deleting…" : "Yes, delete it"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
