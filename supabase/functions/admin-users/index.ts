// Admin user management for RevPlan. Only signed-in admins (a row in user_roles with role
// 'admin') can use it. Body: { action, ... }
//   list                      → every user with membership, admin flag and activity
//   reset   { userId }        → emails the user a password reset link
//   premium { userId, on }    → gives or removes free (complimentary) Premium
//   admin   { userId, on }    → makes the user an admin, or removes admin
//   delete  { userId }        → deletes the account and its data
// Admins can never see or set anyone's password.
import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const APP_URL = (Deno.env.get("APP_URL") ?? "https://revisionplan.lovable.app").replace(/\/$/, "");
const siteUrl = (req: Request) => {
  const origin = req.headers.get("origin");
  return origin && /^https:\/\//.test(origin) ? origin.replace(/\/$/, "") : APP_URL;
};

async function isAdmin(db: SupabaseClient, userId: string) {
  const { data } = await db.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).some((r) => String(r.role) === "admin");
}

async function allUsers(db: SupabaseClient): Promise<User[]> {
  const out: User[] = [];
  for (let page = 1; page < 50; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    out.push(...data.users);
    if (data.users.length < 1000) break;
  }
  return out;
}

async function list(db: SupabaseClient) {
  const users = await allUsers(db);
  const [{ data: subs }, { data: roles }, { data: plans }, { data: subjects }, { data: profiles }] = await Promise.all([
    db.from("subscribers").select("user_id, subscribed, complimentary, plan, current_period_end"),
    db.from("user_roles").select("user_id, role"),
    db.from("plans").select("profile_id"),
    db.from("library_subjects").select("user_id"),
    db.from("profiles").select("id, parent_email, digest_opt_in"),
  ]);
  const count = (rows: { [k: string]: unknown }[] | null, key: string) => {
    const m = new Map<string, number>();
    for (const r of rows ?? []) m.set(String(r[key]), (m.get(String(r[key])) ?? 0) + 1);
    return m;
  };
  const planCount = count(plans, "profile_id");
  const subjectCount = count(subjects, "user_id");
  const subBy = new Map((subs ?? []).map((s) => [s.user_id as string, s]));
  const admins = new Set((roles ?? []).filter((r) => String(r.role) === "admin").map((r) => r.user_id as string));
  const profileBy = new Map((profiles ?? []).map((p) => [p.id as string, p]));
  return users
    .map((u) => {
      const s = subBy.get(u.id);
      const p = profileBy.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        confirmed: Boolean(u.email_confirmed_at),
        admin: admins.has(u.id),
        subscribed: Boolean(s?.subscribed),
        complimentary: Boolean(s?.complimentary),
        plan: (s?.plan as string | null) ?? null,
        renews: (s?.current_period_end as string | null) ?? null,
        plans: planCount.get(u.id) ?? 0,
        subjects: subjectCount.get(u.id) ?? 0,
        parent_email: (p?.parent_email as string | null) ?? null,
        weekly_email: p?.digest_opt_in !== false,
      };
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);
  try {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: auth } = token ? await db.auth.getUser(token) : { data: null };
    const me = auth?.user;
    if (!me) return json({ error: "Please sign in again." }, 401);
    if (!(await isAdmin(db, me.id))) return json({ error: "Only admins can manage users." }, 403);

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "");
    const userId = typeof body?.userId === "string" ? body.userId : "";

    if (action === "list") return json({ users: await list(db) });
    if (!userId) return json({ error: "Choose a user first." }, 400);
    const { data: target, error: findError } = await db.auth.admin.getUserById(userId);
    if (findError || !target?.user) return json({ error: "That user no longer exists." }, 404);
    const user = target.user;

    if (action === "reset") {
      if (!user.email) return json({ error: "This user has no email address." }, 400);
      const { error } = await db.auth.resetPasswordForEmail(user.email, { redirectTo: `${siteUrl(req)}/reset-password` });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, message: `Password reset email sent to ${user.email}.` });
    }

    if (action === "premium") {
      const on = Boolean(body?.on);
      const { error } = await db
        .from("subscribers")
        .upsert({ user_id: user.id, email: user.email, complimentary: on, updated_at: new Date().toISOString() });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, message: on ? `${user.email} now has free Premium.` : `Free Premium removed from ${user.email}.` });
    }

    if (action === "admin") {
      const on = Boolean(body?.on);
      if (!on && user.id === me.id) return json({ error: "You can't remove your own admin access." }, 400);
      if (on) {
        if (!(await isAdmin(db, user.id))) {
          const { error } = await db.from("user_roles").insert({ user_id: user.id, role: "admin" });
          if (error) return json({ error: error.message }, 500);
        }
      } else {
        const { error } = await db.from("user_roles").delete().eq("user_id", user.id).eq("role", "admin");
        if (error) return json({ error: error.message }, 500);
      }
      return json({ ok: true, message: on ? `${user.email} is now an admin.` : `${user.email} is no longer an admin.` });
    }

    if (action === "delete") {
      if (user.id === me.id) return json({ error: "You can't delete your own account here." }, 400);
      const { error } = await db.auth.admin.deleteUser(user.id);
      if (error) return json({ error: `Couldn't delete this account: ${error.message}` }, 500);
      return json({ ok: true, message: `${user.email} and their data have been deleted.` });
    }

    return json({ error: "Unknown action." }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
