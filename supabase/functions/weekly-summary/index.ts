// Weekly RevPlan summary email.
//
// POST (no body)                  → the Sunday run: emails every opted-in student (and their parent)
//                                   once a week, only at 6pm UK time on Sundays. Safe to call more often.
// POST { mode: "preview" } + JWT  → returns the signed-in student's summary as HTML, sends nothing.
// POST { mode: "test" } + JWT     → emails the signed-in student their summary now (once per 10 min).
// GET ?unsubscribe=…              → one-click unsubscribe link from the email footer.
//
// Secrets (Lovable Cloud → Secrets): RESEND_API_KEY, DIGEST_FROM (e.g. "RevPlan <noreply@revplan.co.uk>").
// Optional: APP_URL (defaults to the published site).
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const DIGEST_FROM = Deno.env.get("DIGEST_FROM") ?? "";
const APP_URL = (Deno.env.get("APP_URL") ?? "https://revision-path-finder.lovable.app").replace(/\/$/, "");
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/weekly-summary`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

// ---------- Dates (UK time) ----------

const DAY_INDEX: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

/** Today's date, weekday and hour in the UK, whatever the server's clock is. */
function londonNow(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      year: "numeric", month: "2-digit", day: "2-digit", weekday: "long", hour: "2-digit", hour12: false,
    }).formatToParts(now).map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: parts.weekday as string,
    hour: Number(parts.hour) % 24,
  };
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (dateIso: string, n: number) => {
  const d = new Date(`${dateIso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
};
const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
const niceDate = (dateIso: string) =>
  new Date(`${dateIso}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", timeZone: "UTC",
  });

/** Same rule as the app's planDayDate: week 1 starts on the plan's start date. */
function sessionDate(startDate: string, week: number, day: string): string | null {
  const target = DAY_INDEX[day];
  if (target == null || !startDate) return null;
  const startDay = new Date(`${startDate}T12:00:00Z`).getUTCDay();
  return addDays(startDate, ((target - startDay + 7) % 7) + (week - 1) * 7);
}

// ---------- Unsubscribe links ----------

async function sign(text: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(SERVICE_KEY), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[+/=]/g, (c) => ({ "+": "-", "/": "_", "=": "" })[c]!);
}
async function unsubscribeUrl(userId: string, who: "student" | "parent") {
  const token = `${userId}.${who}`;
  return `${FUNCTION_URL}?unsubscribe=${encodeURIComponent(token)}&sig=${await sign(token)}`;
}

// ---------- Gathering a student's week ----------

type Summary = {
  name: string;
  weekStart: string;
  weekEnd: string;
  planName: string | null;
  planned: number;
  done: number;
  missed: number;
  minutes: number;
  bySubject: { name: string; planned: number; done: number }[];
  checkers: { subject: string; topic: string }[];
  rated: { red: number; amber: number; green: number };
  topicsAdded: number;
  mocksAdded: { subject: string; date: string; label: string }[];
  nextExams: { subject: string; label: string; date: string; days: number }[];
  nextWeekPlanned: number;
  nextUp: { subject: string; topic: string; date: string } | null;
};

const band = (v: number) => (v <= 2 ? "red" : v <= 4 ? "amber" : "green");

async function buildSummary(db: SupabaseClient, userId: string, name: string, today: string): Promise<Summary> {
  // Monday to Sunday of the current UK week.
  const dow = new Date(`${today}T12:00:00Z`).getUTCDay();
  const weekStart = addDays(today, -((dow + 6) % 7));
  const weekEnd = addDays(weekStart, 6);
  const since = `${weekStart}T00:00:00Z`;

  const [{ data: plans }, { data: checkers }, { data: ratings }, { data: topics }] = await Promise.all([
    db.from("plans").select("id, name, start_date").eq("profile_id", userId).order("created_at", { ascending: false }),
    db.from("knowledge_checkers").select("subject, topic, created_at").eq("user_id", userId).gte("created_at", since),
    db.from("topic_ratings").select("confidence, updated_at").eq("user_id", userId).gte("updated_at", since),
    db.from("library_topics").select("id, created_at").eq("user_id", userId).gte("created_at", since),
  ]);

  const plan = plans?.[0] ?? null;
  const rated = { red: 0, amber: 0, green: 0 };
  for (const r of ratings ?? []) rated[band(r.confidence)]++;

  const summary: Summary = {
    name, weekStart, weekEnd, planName: plan?.name ?? null,
    planned: 0, done: 0, missed: 0, minutes: 0, bySubject: [],
    checkers: (checkers ?? []).map((c) => ({ subject: c.subject ?? "", topic: c.topic ?? "" })),
    rated, topicsAdded: topics?.length ?? 0, mocksAdded: [], nextExams: [], nextWeekPlanned: 0, nextUp: null,
  };
  if (!plan) return summary;

  const [{ data: sessions }, { data: planSubjects }, { data: exams }] = await Promise.all([
    db.from("sessions")
      .select("week_number, day_label, session_slot, subject_id, topic_text, length_minutes, completed_at, missed_at")
      .eq("plan_id", plan.id),
    db.from("plan_subjects").select("subject_id, subjects(name)").eq("plan_id", plan.id),
    db.from("exams").select("subject_id, kind, label, paper_no, exam_date, created_at").eq("plan_id", plan.id),
  ]);
  const subjectName = new Map<string, string>(
    (planSubjects ?? []).map((ps: { subject_id: string; subjects: { name: string } | { name: string }[] | null }) => [
      ps.subject_id,
      (Array.isArray(ps.subjects) ? ps.subjects[0]?.name : ps.subjects?.name) ?? "Subject",
    ]),
  );
  const nameOf = (id: string) => subjectName.get(id) ?? "Subject";

  const bySubject = new Map<string, { planned: number; done: number }>();
  const upcoming: { subject: string; topic: string; date: string; slot: number }[] = [];
  for (const s of sessions ?? []) {
    const date = sessionDate(plan.start_date, s.week_number, s.day_label);
    if (!date) continue;
    if (date >= weekStart && date <= weekEnd) {
      summary.planned++;
      const row = bySubject.get(s.subject_id) ?? { planned: 0, done: 0 };
      row.planned++;
      if (s.completed_at) {
        summary.done++;
        row.done++;
        summary.minutes += s.length_minutes ?? 0;
      } else if (s.missed_at) summary.missed++;
      bySubject.set(s.subject_id, row);
    }
    const nextStart = addDays(weekEnd, 1);
    if (date >= nextStart && date <= addDays(nextStart, 6)) summary.nextWeekPlanned++;
    if (date > today && !s.completed_at) {
      upcoming.push({ subject: nameOf(s.subject_id), topic: s.topic_text ?? "", date, slot: s.session_slot ?? 0 });
    }
  }
  summary.bySubject = [...bySubject].map(([id, v]) => ({ name: nameOf(id), ...v })).sort((a, b) => b.planned - a.planned);
  upcoming.sort((a, b) => a.date.localeCompare(b.date) || a.slot - b.slot);
  summary.nextUp = upcoming[0] ? { subject: upcoming[0].subject, topic: upcoming[0].topic, date: upcoming[0].date } : null;

  const examLabel = (e: { kind: string; label: string | null; paper_no: number }) =>
    [e.kind === "mock" ? "Mock" : "", e.label?.trim() || `Paper ${e.paper_no}`].filter(Boolean).join(" ");
  summary.mocksAdded = (exams ?? [])
    .filter((e) => e.kind === "mock" && e.created_at >= since)
    .map((e) => ({ subject: nameOf(e.subject_id), date: e.exam_date, label: examLabel(e) }));
  summary.nextExams = (exams ?? [])
    .filter((e) => e.exam_date && e.exam_date > today)
    .sort((a, b) => a.exam_date.localeCompare(b.exam_date))
    .slice(0, 3)
    .map((e) => ({ subject: nameOf(e.subject_id), label: examLabel(e), date: e.exam_date, days: daysBetween(today, e.exam_date) }));
  return summary;
}

const hasAnything = (s: Summary) =>
  s.planName !== null || s.checkers.length > 0 || s.rated.red + s.rated.amber + s.rated.green > 0 || s.topicsAdded > 0;

// ---------- The email ----------

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const shortTopic = (t: string) => (t.length > 70 ? `${t.slice(0, 67)}…` : t);

function subjectLine(s: Summary, forParent: boolean) {
  const who = forParent ? `${s.name}'s` : "Your";
  if (s.planned) return `${who} RevPlan week: ${s.done} of ${plural(s.planned, "session")} done`;
  return `${who} RevPlan week`;
}

function renderEmail(s: Summary, forParent: boolean, unsubscribe: string) {
  const C = { navy: "#1b1840", orange: "#f59e0b", red: "#c0392b", amber: "#d68910", green: "#1e8449", muted: "#5b6275", line: "#e6e8ef" };
  const section = (title: string, body: string) =>
    `<tr><td style="padding:18px 24px 0"><p style="margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:${C.muted}">${title}</p>${body}</td></tr>`;
  const p = (t: string) => `<p style="margin:0 0 6px;font-size:15px;line-height:1.5;color:${C.navy}">${t}</p>`;
  const pct = s.planned ? Math.round((s.done / s.planned) * 100) : 0;

  const intro = forParent
    ? `Here's how ${esc(s.name)} got on with their revision this week (${niceDate(s.weekStart)} to ${niceDate(s.weekEnd)}). They chose to share this summary with you.`
    : `Here's your revision week (${niceDate(s.weekStart)} to ${niceDate(s.weekEnd)}).`;

  const sessions = s.planned
    ? p(`<strong>${s.done} of ${plural(s.planned, "session")}</strong> ticked off (${pct}%)${s.minutes ? `, ${s.minutes < 60 ? plural(s.minutes, "minute") : `about ${plural(Math.round(s.minutes / 6) / 10, "hour")}`} of revision` : ""}.${s.missed ? ` ${plural(s.missed, "session")} marked as missed.` : ""}`) +
      `<div style="height:8px;border-radius:99px;background:${C.line};margin:6px 0 10px"><div style="height:8px;border-radius:99px;width:${pct}%;background:${C.orange}"></div></div>` +
      s.bySubject.map((r) => `<p style="margin:0 0 3px;font-size:14px;color:${C.navy}">${esc(r.name)}: ${r.done} of ${r.planned}</p>`).join("")
    : p(s.planName ? "No sessions were planned this week." : "No revision plan yet. Building one takes about five minutes.");

  const activity: string[] = [];
  if (s.checkers.length)
    activity.push(`${plural(s.checkers.length, "knowledge checker")} saved: ${s.checkers.slice(0, 5).map((c) => esc([c.subject, c.topic].filter(Boolean).join(", "))).join("; ")}${s.checkers.length > 5 ? "…" : ""}`);
  const ratedTotal = s.rated.red + s.rated.amber + s.rated.green;
  if (ratedTotal)
    activity.push(`${plural(ratedTotal, "topic")} rated: <span style="color:${C.red};font-weight:700">${s.rated.red} red</span>, <span style="color:${C.amber};font-weight:700">${s.rated.amber} amber</span>, <span style="color:${C.green};font-weight:700">${s.rated.green} green</span>`);
  if (s.topicsAdded) activity.push(`${plural(s.topicsAdded, "topic")} added to My Topics`);
  for (const m of s.mocksAdded) activity.push(`Mock added: ${esc(m.subject)}, ${esc(m.label)} on ${niceDate(m.date)}`);

  const exams = s.nextExams.length
    ? s.nextExams.map((e) => p(`<strong>${e.days} days</strong> until ${esc(e.subject)}, ${esc(e.label)} (${niceDate(e.date)})`)).join("")
    : "";

  const next = s.nextUp
    ? p(`${plural(s.nextWeekPlanned, "session")} planned next week. Next up: <strong>${esc(s.nextUp.subject)}</strong>, ${esc(shortTopic(s.nextUp.topic))} on ${niceDate(s.nextUp.date)}.`)
    : "";

  const footer = forParent
    ? `You're getting this because ${esc(s.name)} added your email to their RevPlan account. <a href="${unsubscribe}" style="color:${C.muted}">Stop these emails</a>.`
    : `You get this because the weekly summary is switched on in your RevPlan account. <a href="${unsubscribe}" style="color:${C.muted}">Stop these emails</a> or change it in <a href="${APP_URL}/account" style="color:${C.muted}">your account</a>.`;

  const html = `<!doctype html><html><body style="margin:0;background:#f3f4f8;font-family:Nunito,Segoe UI,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f8;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:${C.navy};padding:20px 24px"><p style="margin:0;font-size:22px;font-weight:800;color:#ffffff">Rev<span style="color:${C.orange}">Plan</span></p>
<p style="margin:6px 0 0;font-size:15px;color:#dfe1ee">${intro}</p></td></tr>
${section("Revision sessions", sessions)}
${activity.length ? section("Other activity", activity.map(p).join("")) : ""}
${exams ? section("Exam countdown", exams) : ""}
${next ? section("Coming up", next) : ""}
<tr><td style="padding:22px 24px"><a href="${APP_URL}/plan" style="display:inline-block;background:${C.orange};color:${C.navy};font-weight:800;font-size:15px;text-decoration:none;padding:12px 20px;border-radius:99px">${forParent ? "See RevPlan" : "Open my plan"}</a></td></tr>
<tr><td style="padding:14px 24px 22px;border-top:1px solid ${C.line}"><p style="margin:0;font-size:12px;line-height:1.5;color:${C.muted}">${footer}</p></td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    "RevPlan weekly summary",
    intro.replace(/<[^>]+>/g, ""),
    s.planned ? `Sessions: ${s.done} of ${s.planned} done.` : "",
    ...activity.map((a) => a.replace(/<[^>]+>/g, "")),
    ...s.nextExams.map((e) => `${e.days} days until ${e.subject}, ${e.label}`),
    `Open RevPlan: ${APP_URL}/plan`,
    `Stop these emails: ${unsubscribe}`,
  ].filter(Boolean).join("\n\n");

  return { subject: subjectLine(s, forParent), html, text };
}

async function sendEmail(to: string, email: { subject: string; html: string; text: string }, unsubscribe: string) {
  if (!RESEND_API_KEY || !DIGEST_FROM) throw new Error("Email isn't set up yet: add RESEND_API_KEY and DIGEST_FROM.");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: DIGEST_FROM, to: [to], subject: email.subject, html: email.html, text: email.text,
      headers: { "List-Unsubscribe": `<${unsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

// ---------- Handlers ----------

async function emailsFor(db: SupabaseClient) {
  const map = new Map<string, string>();
  for (let page = 1; page < 100; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    for (const u of data.users) if (u.email) map.set(u.id, u.email);
    if (data.users.length < 1000) break;
  }
  return map;
}

const displayName = (profile: { display_name: string | null } | null, email: string) =>
  profile?.display_name?.trim() || email.split("@")[0]!.split(/[._+-]/)[0]!.replace(/^./, (c) => c.toUpperCase()) || "Your child";

async function weeklyRun(db: SupabaseClient, force: boolean) {
  const now = londonNow();
  if (!force && !(now.weekday === "Sunday" && now.hour >= 18 && now.hour < 23)) {
    return json({ skipped: "Not Sunday evening in the UK yet." });
  }
  if (!RESEND_API_KEY || !DIGEST_FROM) {
    return json({ skipped: "Email isn't set up yet: add RESEND_API_KEY and DIGEST_FROM." });
  }
  const sixDaysAgo = new Date(Date.now() - 6 * 86_400_000).toISOString();
  const { data: profiles, error } = await db
    .from("profiles")
    .select("id, display_name, parent_email, last_digest_sent_at")
    .eq("digest_opt_in", true)
    .or(`last_digest_sent_at.is.null,last_digest_sent_at.lt.${sixDaysAgo}`);
  if (error) return json({ error: error.message }, 500);

  const emails = await emailsFor(db);
  let sent = 0;
  const failures: string[] = [];
  for (const profile of profiles ?? []) {
    const studentEmail = emails.get(profile.id);
    if (!studentEmail) continue;
    // Claim this week first so a second run at the same time can't send twice.
    const { data: claimed } = await db
      .from("profiles")
      .update({ last_digest_sent_at: new Date().toISOString() })
      .eq("id", profile.id)
      .or(`last_digest_sent_at.is.null,last_digest_sent_at.lt.${sixDaysAgo}`)
      .select("id");
    if (!claimed?.length) continue;
    try {
      const summary = await buildSummary(db, profile.id, displayName(profile, studentEmail), now.date);
      if (!hasAnything(summary)) continue;
      const studentUnsub = await unsubscribeUrl(profile.id, "student");
      await sendEmail(studentEmail, renderEmail(summary, false, studentUnsub), studentUnsub);
      sent++;
      const parent = profile.parent_email?.trim();
      if (parent && parent.toLowerCase() !== studentEmail.toLowerCase()) {
        const parentUnsub = await unsubscribeUrl(profile.id, "parent");
        await sendEmail(parent, renderEmail(summary, true, parentUnsub), parentUnsub);
        sent++;
      }
    } catch (e) {
      failures.push(`${profile.id}: ${(e as Error).message}`);
    }
  }
  return json({ sent, failures });
}

async function forSignedInStudent(db: SupabaseClient, req: Request, mode: "preview" | "test") {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth } = await db.auth.getUser(token);
  const user = auth?.user;
  if (!user?.email) return json({ error: "Please sign in again." }, 401);
  const { data: profile } = await db
    .from("profiles")
    .select("display_name, last_digest_test_at")
    .eq("id", user.id)
    .maybeSingle();
  const summary = await buildSummary(db, user.id, displayName(profile, user.email), londonNow().date);
  const unsub = await unsubscribeUrl(user.id, "student");
  const email = renderEmail(summary, false, unsub);
  if (mode === "preview") return json({ subject: email.subject, html: email.html });

  if (profile?.last_digest_test_at && Date.now() - Date.parse(profile.last_digest_test_at) < 10 * 60_000) {
    return json({ error: "A test email was sent in the last 10 minutes. Check your inbox (and spam)." }, 429);
  }
  await db.from("profiles").update({ last_digest_test_at: new Date().toISOString() }).eq("id", user.id);
  try {
    await sendEmail(user.email, email, unsub);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
  return json({ sent: user.email });
}

async function unsubscribe(db: SupabaseClient, url: URL) {
  const token = url.searchParams.get("unsubscribe") ?? "";
  const sig = url.searchParams.get("sig") ?? "";
  const page = (msg: string, status = 200) =>
    new Response(
      `<!doctype html><meta name="viewport" content="width=device-width"><body style="font-family:Arial,sans-serif;max-width:480px;margin:60px auto;padding:0 16px;color:#1b1840"><h1 style="font-size:22px">RevPlan</h1><p>${msg}</p></body>`,
      { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  if (!token || sig !== (await sign(token))) return page("That link isn't valid. You can change emails in your RevPlan account.", 400);
  const [userId, who] = token.split(".");
  const patch = who === "parent" ? { parent_email: null } : { digest_opt_in: false };
  const { error } = await db.from("profiles").update(patch).eq("id", userId);
  if (error) return page("Something went wrong. Please try again later.", 500);
  return page(who === "parent" ? "Done. You won't get these weekly summaries any more." : "Done. Your weekly summary is switched off. You can turn it back on in your account.");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const url = new URL(req.url);
  try {
    if (url.searchParams.has("unsubscribe")) return await unsubscribe(db, url);
    if (req.method !== "POST") return json({ error: "Use POST." }, 405);
    const body = await req.json().catch(() => ({}));
    if (body?.mode === "preview" || body?.mode === "test") return await forSignedInStudent(db, req, body.mode);
    return await weeklyRun(db, false);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
