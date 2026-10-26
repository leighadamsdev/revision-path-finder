import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Bot,
  Check,
  FileText,
  Lock,
  Mail,
  PenLine,
  RefreshCw,
  Sparkles,
  Wrench,
} from "lucide-react";

import { PremiumTag } from "@/components/PremiumGate";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivePlan, useExams, usePlanSessions, usePlanSubjects } from "@/hooks/useActivePlan";
import { useAuth } from "@/hooks/useAuth";
import { useLibrary } from "@/hooks/useLibrary";
import { usePremium } from "@/hooks/usePremium";
import { useTopicRatings } from "@/hooks/useTopicRatings";
import { supabase } from "@/integrations/supabase/client";
import { topicLines, withWholeTopicRatings } from "@/lib/library";
import { planDayDate } from "@/lib/plan-dates";

type To =
  | "/library"
  | "/topics"
  | "/rate-topics"
  | "/exams"
  | "/setup"
  | "/plan"
  | "/knowledge-checker"
  | "/practice-questions"
  | "/ai-tutor"
  | "/upgrade"
  | "/papers"
  | "/sites"
  | "/revision-tools"
  | "/account";

type Status = "done" | "todo" | "locked" | "ongoing";

type ProgressRow = {
  title: string;
  status: Status;
  detail: string;
  to: To;
  action: string;
};

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Signed-in home: what the student has done, what's next, and what else they could do. */
export function HomeDashboard() {
  const { user } = useAuth();
  const library = useLibrary();
  const { ratings, isLoading: ratingsLoading } = useTopicRatings();
  const { isPremium, loading: premiumLoading } = usePremium();
  const { plan, isLoading: planLoading } = useActivePlan();
  const planSubjects = usePlanSubjects(plan?.id).data ?? [];
  const sessions = usePlanSessions(plan?.id).data ?? [];
  const exams = useExams(plan?.id).data ?? [];
  const checkers = useQuery({
    queryKey: ["home-checkers", user?.id],
    enabled: Boolean(user) && isPremium,
    queryFn: async () => {
      const { data, count } = await supabase
        .from("knowledge_checkers")
        .select("subject, topic, updated_at", { count: "exact" })
        .order("updated_at", { ascending: false })
        .limit(1);
      return { count: Math.max(count ?? 0, data?.length ?? 0), latest: data?.[0] ?? null };
    },
  });

  const loading = library.isLoading || ratingsLoading || premiumLoading || planLoading;
  const today = new Date();
  const todayIso = format(today, "yyyy-MM-dd");
  const name = user?.email
    ? user.email
        .split("@")[0]!
        .split(/[._+-]/)[0]!
        .replace(/^./, (c) => c.toUpperCase())
    : "";

  // Topics and ratings, counted per sub-topic like Rate my topics.
  const subjects = library.subjects;
  let topicCount = 0;
  const bands = { red: 0, amber: 0, green: 0, unrated: 0 };
  for (const s of subjects) {
    const mine = withWholeTopicRatings(ratings[s.name] ?? {}, s.topics);
    for (const line of s.topics.flatMap(topicLines)) {
      topicCount++;
      const v = mine[line];
      if (v == null) bands.unrated++;
      else if (v <= 2) bands.red++;
      else if (v <= 4) bands.amber++;
      else bands.green++;
    }
  }
  const rated = topicCount - bands.unrated;
  const subjectsWithoutTopics = subjects.filter((s) => !s.topics.length).map((s) => s.name);

  // This week's sessions (Monday to Sunday) and the next one to do.
  const dow = (today.getDay() + 6) % 7;
  const weekStart = format(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() - dow),
    "yyyy-MM-dd",
  );
  const weekEnd = format(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() - dow + 6),
    "yyyy-MM-dd",
  );
  const dated = plan
    ? sessions
        .map((s) => ({ s, date: planDayDate(plan.start_date, s.week_number, s.day_label) }))
        .filter((x): x is { s: (typeof sessions)[number]; date: Date } => Boolean(x.date))
        .map((x) => ({ ...x, iso: format(x.date, "yyyy-MM-dd") }))
    : [];
  const thisWeek = dated.filter((x) => x.iso >= weekStart && x.iso <= weekEnd);
  const doneThisWeek = thisWeek.filter((x) => x.s.completed_at).length;
  const next = dated
    .filter((x) => x.iso >= todayIso && !x.s.completed_at && !x.s.missed_at)
    .sort((a, b) => a.iso.localeCompare(b.iso) || a.s.session_slot - b.s.session_slot)[0];
  const subjectName = (id: string | null) =>
    planSubjects.find((p) => p.id === id)?.name ?? "Revision";

  const nextExam = exams
    .filter((e) => e.exam_date && e.exam_date >= todayIso)
    .sort((a, b) => a.exam_date.localeCompare(b.exam_date))[0];
  const daysToExam = nextExam
    ? differenceInCalendarDays(parseISO(nextExam.exam_date), today)
    : null;
  const mocks = exams.filter((e) => e.kind === "mock" && e.exam_date >= todayIso).length;

  const rows: ProgressRow[] = [
    {
      title: "Your subjects",
      status: subjects.length ? "done" : "todo",
      detail: subjects.length
        ? `${plural(subjects.length, "subject")}: ${subjects.map((s) => s.name).join(", ")}`
        : "Add the subjects you're taking, with exam boards and tiers.",
      to: "/library",
      action: subjects.length ? "Add or change" : "Add my subjects",
    },
    {
      title: "Your topics and ratings",
      status: !topicCount ? "todo" : bands.unrated ? "todo" : "done",
      detail: !topicCount
        ? subjects.length
          ? "Choose the topics for each subject, then rate them red, amber or green."
          : "Once you've added subjects, choose and rate their topics."
        : `${plural(topicCount, "topic")}, ${rated} rated${bands.unrated ? `, ${bands.unrated} still to rate` : ""}.${
            subjectsWithoutTopics.length
              ? ` No topics yet for ${subjectsWithoutTopics.join(", ")}.`
              : ""
          }`,
      to: !topicCount || subjectsWithoutTopics.length ? "/topics" : "/rate-topics",
      action: !topicCount ? "Choose my topics" : bands.unrated ? "Rate the rest" : "Review ratings",
    },
    isPremium
      ? {
          title: "Your exam dates",
          status: exams.length ? "done" : "todo",
          detail: nextExam
            ? `Next: ${subjectName(nextExam.subject_id)}${nextExam.kind === "mock" ? " mock" : ""}${nextExam.label ? `, ${nextExam.label}` : ""} on ${format(parseISO(nextExam.exam_date), "EEE d MMM")} (${plural(daysToExam ?? 0, "day")} away)${mocks ? `. ${plural(mocks, "mock")} coming up` : ""}.`
            : exams.length
              ? "All your exams are behind you."
              : "Your summer exams are added for you when you build a plan. Add mocks too.",
          to: plan ? "/exams" : "/setup",
          action: plan ? "See my exams" : "Add my exam dates",
        }
      : {
          title: "Your exam dates",
          status: "locked",
          detail: "Premium adds your summer exams from the official timetable, plus your mocks.",
          to: "/upgrade",
          action: "See Premium",
        },
    isPremium
      ? {
          title: "Your revision plan",
          status: plan ? "done" : "todo",
          detail: plan
            ? thisWeek.length
              ? `This week: ${doneThisWeek} of ${plural(thisWeek.length, "session")} done.${next ? ` Next: ${subjectName(next.s.subject_id)}, ${next.iso === todayIso ? "today" : format(next.date, "EEEE d MMM")}.` : ""}`
              : next
                ? `No sessions this week. Next: ${subjectName(next.s.subject_id)} on ${format(next.date, "EEE d MMM")}.`
                : "Your plan has no sessions coming up. Edit it to add more weeks."
            : "Build a week-by-week timetable that puts your red topics first.",
          to: plan ? "/plan" : "/setup",
          action: plan ? "Open my plan" : "Build my plan",
        }
      : {
          title: "Your revision plan",
          status: "locked",
          detail: "Premium turns your topics and ratings into a week-by-week timetable.",
          to: "/upgrade",
          action: "See Premium",
        },
    isPremium
      ? {
          title: "Keep checking what you know",
          status: "ongoing",
          detail: checkers.data?.latest
            ? `${plural(checkers.data.count, "knowledge checker")} saved. Last: ${[checkers.data.latest.subject, checkers.data.latest.topic].filter(Boolean).join(", ")}${checkers.data.latest.updated_at ? `, ${format(parseISO(checkers.data.latest.updated_at), "d MMM")}` : ""}.`
            : "After you revise a topic, test yourself and update its rating.",
          to: "/knowledge-checker",
          action: "Test myself",
        }
      : {
          title: "Keep checking what you know",
          status: "ongoing",
          detail:
            "Update your ratings in Rate my topics as you revise. Premium adds the Knowledge Checker and practice questions.",
          to: "/rate-topics",
          action: "Update ratings",
        },
  ];

  // The single most useful thing to do now.
  const suggestion: { title: string; body: string; to: To; action: string } = !subjects.length
    ? {
        title: "Add your subjects",
        body: "Start by ticking the subjects you're taking. It takes a minute.",
        to: "/library",
        action: "Add my subjects",
      }
    : !topicCount
      ? {
          title: "Choose your topics",
          body: "Pick topics from your exam board's list, a photo of your revision guide, or type your own.",
          to: "/topics",
          action: "Choose my topics",
        }
      : bands.unrated && !rated
        ? {
            title: "Rate your topics",
            body: `Mark each of your ${topicCount} topics red, amber or green so you know where to start.`,
            to: "/rate-topics",
            action: "Rate my topics",
          }
        : !isPremium
          ? {
              title: "Turn your ratings into a plan",
              body: "Premium builds a week-by-week timetable around your red topics and exam dates.",
              to: "/upgrade",
              action: "See Premium",
            }
          : !plan
            ? {
                title: "Build your revision plan",
                body: "Your subjects and ratings are ready. Add your study time and we'll do the rest.",
                to: "/setup",
                action: "Build my plan",
              }
            : next && next.iso === todayIso
              ? {
                  title: `Today: ${subjectName(next.s.subject_id)}`,
                  body: next.s.topic_text
                    ? next.s.topic_text
                    : "Open your plan to start today's session.",
                  to: "/plan",
                  action: "Start today's session",
                }
              : bands.unrated
                ? {
                    title:
                      bands.unrated === 1
                        ? "Rate your last topic"
                        : `Rate your last ${bands.unrated} topics`,
                    body: "Unrated topics can't be prioritised in your plan.",
                    to: "/rate-topics",
                    action: "Rate the rest",
                  }
                : bands.red
                  ? {
                      title: `Work on your ${plural(bands.red, "red topic")}`,
                      body: "Test yourself with practice exam questions, then update your ratings.",
                      to: "/practice-questions",
                      action: "Practice questions",
                    }
                  : {
                      title: "Keep testing yourself",
                      body: "Use the Knowledge Checker after each session and update your ratings.",
                      to: "/knowledge-checker",
                      action: "Test myself",
                    };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight">
        Welcome back{name ? `, ${name}` : ""}
      </h1>
      <p className="mt-1 text-[14px] font-medium text-muted-foreground">
        Here's where you're up to and what to do next.
      </p>

      {loading ? (
        <div className="mt-5 space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <Link
            to={suggestion.to}
            className="group mt-5 block rounded-[16px] bg-structure p-5 text-structure-foreground shadow-lg ring-2 ring-primary transition-transform hover:-translate-y-0.5 sm:p-6"
          >
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-primary">
              Next step
            </p>
            <p className="mt-1 text-xl font-extrabold tracking-tight">{suggestion.title}</p>
            <p className="mt-1 text-[14px] font-medium opacity-90">{suggestion.body}</p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground">
              {suggestion.action}
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </Link>

          {topicCount ? (
            <Link
              to="/rate-topics"
              className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[14px] bg-card px-4 py-3 ring-1 ring-black/5 hover:ring-border"
            >
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-muted-foreground">
                Your topics
              </span>
              <Count dot="bg-conf-low" n={bands.red} label="red" />
              <Count dot="bg-conf-mid" n={bands.amber} label="amber" />
              <Count dot="bg-conf-high" n={bands.green} label="green" />
              {bands.unrated ? (
                <Count dot="ring-1 ring-muted-foreground/50" n={bands.unrated} label="not rated" />
              ) : null}
              <span className="ml-auto inline-flex items-center gap-1 text-[12px] font-bold text-primary">
                View by colour <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ) : null}

          <section className="mt-6" aria-labelledby="progress-heading">
            <h2 id="progress-heading" className="text-lg font-extrabold tracking-tight">
              Your progress
            </h2>
            <ol className="mt-3 space-y-2">
              {rows.map((r) => (
                <li key={r.title}>
                  <Link
                    to={r.to}
                    className="group flex items-start gap-3 rounded-[14px] bg-card p-4 ring-1 ring-black/5 hover:ring-border"
                  >
                    <StatusIcon status={r.status} />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-[15px] font-extrabold">
                        {r.title}
                        {r.status === "locked" ? <PremiumTag /> : null}
                        {r.status === "ongoing" ? (
                          <span className="text-[11px] font-bold text-primary">As you revise</span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-[13px] font-medium text-muted-foreground">
                        {r.detail}
                      </p>
                    </div>
                    <span className="hidden shrink-0 items-center gap-1 self-center text-[12px] font-bold text-primary sm:inline-flex">
                      {r.action} <ArrowRight className="size-3.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-8" aria-labelledby="also-heading">
            <h2 id="also-heading" className="text-lg font-extrabold tracking-tight">
              You could also
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Shortcut
                to="/practice-questions"
                icon={<PenLine className="size-4" />}
                title="Practice exam questions"
                body={
                  bands.red
                    ? `Questions on your ${plural(bands.red, "red topic")}, marked by your AI.`
                    : "Exam-style questions on your topics, marked by your AI."
                }
                premium={!isPremium}
              />
              <Shortcut
                to="/ai-tutor"
                icon={<Bot className="size-4" />}
                title="Build my AI tutor"
                body="A tutor that focuses on what you find hardest."
                premium={!isPremium}
              />
              <Shortcut
                to="/papers"
                icon={<FileText className="size-4" />}
                title="Past papers"
                body="Question papers and mark schemes for your subjects."
              />
              <Shortcut
                to="/sites"
                icon={<Sparkles className="size-4" />}
                title="Revision links"
                body="Free sites and videos for every subject."
              />
              <Shortcut
                to="/revision-tools"
                icon={<Wrench className="size-4" />}
                title="Revision tools"
                body="Focus timer, background sounds and a distraction blocker."
              />
              <Shortcut
                to="/account"
                icon={<Mail className="size-4" />}
                title="Weekly summary email"
                body="A Sunday round-up for you, and your parent or carer if you like."
                premium={!isPremium}
              />
              {!isPremium ? (
                <Shortcut
                  to="/upgrade"
                  icon={<Sparkles className="size-4" />}
                  title="Upgrade to Premium"
                  body="Your plan, exam timetable, Knowledge Checker, AI tutor and more."
                />
              ) : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Count({ dot, n, label }: { dot: string; n: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-bold">
      <span className={`size-2.5 rounded-full ${dot}`} />
      <span className="tabular-nums">{n}</span> {label}
    </span>
  );
}

function StatusIcon({ status }: { status: Status }) {
  const base = "grid size-8 shrink-0 place-items-center rounded-[8px]";
  if (status === "done")
    return (
      <span className={`${base} bg-conf-high text-white`} aria-label="Done">
        <Check className="size-4" strokeWidth={3} />
      </span>
    );
  if (status === "locked")
    return (
      <span className={`${base} bg-secondary text-muted-foreground`} aria-label="Premium">
        <Lock className="size-4" />
      </span>
    );
  if (status === "ongoing")
    return (
      <span className={`${base} bg-primary/15 text-primary`} aria-label="Keep doing">
        <RefreshCw className="size-4" strokeWidth={2.5} />
      </span>
    );
  return (
    <span className={`${base} bg-primary text-primary-foreground`} aria-label="To do">
      <ArrowRight className="size-4" strokeWidth={3} />
    </span>
  );
}

function Shortcut({
  to,
  icon,
  title,
  body,
  premium,
}: {
  to: To;
  icon: ReactNode;
  title: string;
  body: string;
  premium?: boolean;
}) {
  return (
    <Link
      to={premium ? "/upgrade" : to}
      className="flex items-start gap-3 rounded-[14px] bg-card p-4 ring-1 ring-black/5 hover:ring-border"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-background text-foreground ring-1 ring-border">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2 text-[14px] font-extrabold">
          {title}
          {premium ? <PremiumTag /> : null}
        </span>
        <span className="mt-0.5 block text-[12px] font-medium text-muted-foreground">{body}</span>
      </span>
    </Link>
  );
}
