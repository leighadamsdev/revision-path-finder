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

const APP_URL = (Deno.env.get("APP_URL") ?? "https://revision-path-finder.lovable.app").replace(/\/$/, "");

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

// Opens Stripe's customer portal so a student can change card, switch plan or cancel.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const db = adminClient();
    const user = await signedInUser(db, req);
    if (!user?.email) return json({ error: "Please sign in again." }, 401);
    const stripe = stripeClient();
    const customer = await findCustomer(stripe, db, user);
    if (!customer) return json({ error: "No Premium subscription found for this account." }, 404);
    const session = await stripe.billingPortal.sessions.create({ customer, return_url: `${siteUrl(req)}/upgrade` });
    return json({ url: session.url });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
