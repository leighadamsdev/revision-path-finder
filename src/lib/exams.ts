import { supabase } from "@/integrations/supabase/client";
import { examDateColumns, MAX_EXAM_DATES } from "@/lib/exam-dates";

export type ExamKind = "mock" | "final" | "untagged";

export type Exam = {
  id: string;
  plan_id: string;
  subject_id: string;
  paper_no: number;
  kind: ExamKind;
  label: string;
  exam_date: string;
  official_exam_id: string | null;
  verified: boolean;
  all_topics: boolean;
  topic_ids: string[];
};

export type OfficialExam = {
  id: string;
  subject_id: string;
  exam_board: string;
  tier: string | null;
  paper: string;
  series: string;
  exam_date: string;
};

export { MAX_EXAM_DATES };

export async function fetchExams(planId: string): Promise<Exam[]> {
  const { data, error } = await supabase
    .from("exams")
    .select(
      "id, plan_id, subject_id, paper_no, kind, label, exam_date, official_exam_id, verified, all_topics, exam_topics(plan_topic_id)",
    )
    .eq("plan_id", planId)
    .order("exam_date");
  if (error) throw error;
  return (data ?? []).map((row) => {
    const { exam_topics, ...rest } = row as typeof row & {
      exam_topics: Array<{ plan_topic_id: string }> | null;
    };
    return {
      ...(rest as Omit<Exam, "topic_ids">),
      kind: rest.kind as ExamKind,
      topic_ids: (exam_topics ?? []).map((t) => t.plan_topic_id),
    };
  });
}

export async function fetchOfficialExams(): Promise<OfficialExam[]> {
  const { data, error } = await supabase
    .from("official_exams")
    .select("id, subject_id, exam_board, tier, paper, series, exam_date")
    .order("exam_date");
  if (error) throw error;
  return (data ?? []) as OfficialExam[];
}

export type ExamInput = {
  id?: string;
  subject_id: string;
  paper_no: number;
  kind: ExamKind;
  label: string;
  exam_date: string;
  official_exam_id: string | null;
  verified: boolean;
  all_topics: boolean;
  topic_ids: string[];
};

/** Writes the old per-subject date columns so print, share and countdown keep working. */
async function syncColumns(planId: string, subjectId: string) {
  const { data } = await supabase
    .from("exams")
    .select("exam_date")
    .eq("plan_id", planId)
    .eq("subject_id", subjectId)
    .order("exam_date");
  const dates = (data ?? []).map((row) => row.exam_date as string);
  await supabase
    .from("plan_subjects")
    .update(examDateColumns(dates.slice(0, MAX_EXAM_DATES)))
    .eq("plan_id", planId)
    .eq("subject_id", subjectId);
}

/** Replaces one subject's exams (up to three papers) and their topic scope. */
export async function saveSubjectExams(planId: string, subjectId: string, exams: ExamInput[]) {
  const { data: current } = await supabase
    .from("exams")
    .select("id")
    .eq("plan_id", planId)
    .eq("subject_id", subjectId);
  const keep = new Set(exams.map((e) => e.id).filter(Boolean));
  const remove = (current ?? []).map((r) => r.id).filter((id) => !keep.has(id));
  if (remove.length) {
    const { error } = await supabase.from("exams").delete().in("id", remove);
    if (error) throw error;
  }

  for (const exam of exams.slice(0, MAX_EXAM_DATES)) {
    if (!exam.exam_date) continue;
    const row = {
      plan_id: planId,
      subject_id: subjectId,
      paper_no: exam.paper_no,
      kind: exam.kind,
      label: exam.label,
      exam_date: exam.exam_date,
      official_exam_id: exam.official_exam_id,
      verified: exam.verified,
      all_topics: exam.all_topics,
    };
    let id = exam.id;
    if (id) {
      const { error } = await supabase.from("exams").update(row).eq("id", id);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("exams").insert(row).select("id").single();
      if (error) throw error;
      id = data.id;
    }
    await supabase.from("exam_topics").delete().eq("exam_id", id);
    if (!exam.all_topics && exam.topic_ids.length) {
      const { error } = await supabase
        .from("exam_topics")
        .insert(exam.topic_ids.map((plan_topic_id) => ({ exam_id: id!, plan_topic_id })));
      if (error) throw error;
    }
  }
  await syncColumns(planId, subjectId);
}

/**
 * When dates are edited the old way (setup / Edit plan), make the exams list match:
 * new dates arrive untagged, removed dates are dropped.
 */
export async function syncExamsFromColumns(planId: string) {
  const [{ data: subjects }, { data: exams }] = await Promise.all([
    supabase
      .from("plan_subjects")
      .select("subject_id, exam_date, exam_date_2, exam_date_3")
      .eq("plan_id", planId),
    supabase.from("exams").select("id, subject_id, exam_date").eq("plan_id", planId),
  ]);
  const existing = exams ?? [];
  const inserts: Array<{ plan_id: string; subject_id: string; paper_no: number; exam_date: string }> = [];
  const keepIds = new Set<string>();
  for (const row of subjects ?? []) {
    const dates = [row.exam_date, row.exam_date_2, row.exam_date_3].filter(Boolean) as string[];
    dates.forEach((date, i) => {
      const match = existing.find((e) => e.subject_id === row.subject_id && e.exam_date === date);
      if (match) keepIds.add(match.id);
      else inserts.push({ plan_id: planId, subject_id: row.subject_id, paper_no: i + 1, exam_date: date });
    });
  }
  const remove = existing.filter((e) => !keepIds.has(e.id)).map((e) => e.id);
  if (remove.length) await supabase.from("exams").delete().in("id", remove);
  if (inserts.length) await supabase.from("exams").insert(inserts);
}

export function examKindLabel(kind: ExamKind) {
  if (kind === "mock") return "Mock";
  if (kind === "final") return "Final";
  return "Untagged";
}
