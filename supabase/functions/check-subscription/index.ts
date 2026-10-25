// Part of RevPlan Premium (Stripe). Needs the STRIPE_SECRET_KEY secret in Lovable Cloud.
import Stripe from "npm:stripe@17.7.0";
import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const APP_URL = (Deno.env.get("APP_URL") ?? "https://revisionplan.lovable.app").replace(/\/$/, "");

/** The site the student came from (so links work on a custom domain too), else the published site. */
function siteUrl(req: Request) {
  const origin = req.headers.get("origin");
  return origin && /^https:\/\//.test(origin) ? origin.replace(/\/$/, "") : APP_URL;
}

function stripeClient() {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("Payments aren't set up yet: add STRIPE_SECRET_KEY.");
  return new Stripe(key, { apiVersion: "2025-02-24.acacia", httpClient: Stripe.createFetchHttpClient() });
}

function adminClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
}

async function signedInUser(db: SupabaseClient, req: Request): Promise<User | null> {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data } = await db.auth.getUser(token);
  return data?.user ?? null;
}

/** The student's Stripe customer, found by the id we saved or by email. */
async function findCustomer(stripe: Stripe, db: SupabaseClient, user: User) {
  const { data: row } = await db.from("subscribers").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (row?.stripe_customer_id) return row.stripe_customer_id as string;
  const found = await stripe.customers.list({ email: user.email!, limit: 1 });
  return found.data[0]?.id ?? null;
}

// Looks up the signed-in student's Stripe subscription and saves it to public.subscribers.
// Called after checkout, when the app loads, and from the Upgrade page.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const db = adminClient();
    const user = await signedInUser(db, req);
    if (!user?.email) return json({ error: "Please sign in again." }, 401);
    // Payments not set up yet: everyone is on the free plan, no error.
    if (!Deno.env.get("STRIPE_SECRET_KEY")) return json({ subscribed: false, payments_enabled: false });
    const stripe = stripeClient();
    const customer = await findCustomer(stripe, db, user);
    const now = new Date().toISOString();
    if (!customer) {
      await db.from("subscribers").upsert({ user_id: user.id, email: user.email, subscribed: false, plan: null, current_period_end: null, updated_at: now });
      return json({ subscribed: false });
    }
    const subs = await stripe.subscriptions.list({ customer, status: "all", limit: 10 });
    const live = subs.data.find((s) => ["active", "trialing", "past_due"].includes(s.status));
    const item = live?.items.data[0];
    const plan = live ? (item?.price.recurring?.interval === "year" ? "yearly" : "monthly") : null;
    const endSeconds =
      (live as unknown as { current_period_end?: number } | undefined)?.current_period_end ??
      (item as unknown as { current_period_end?: number } | undefined)?.current_period_end;
    const current_period_end = endSeconds ? new Date(endSeconds * 1000).toISOString() : null;
    await db.from("subscribers").upsert({
      user_id: user.id,
      email: user.email,
      stripe_customer_id: customer,
      subscribed: Boolean(live),
      plan,
      current_period_end,
      updated_at: now,
    });
    return json({ subscribed: Boolean(live), plan, current_period_end, cancelling: Boolean(live?.cancel_at_period_end) });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
