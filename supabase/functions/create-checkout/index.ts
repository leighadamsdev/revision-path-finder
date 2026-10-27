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

/** RevPlan Premium prices, in pence. Change them here. */
const PRICES = { month: 499, year: 2999 } as const;

// Starts a Stripe Checkout for RevPlan Premium. Body: { interval: "month" | "year", agreedToTerms: true }.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const db = adminClient();
    const user = await signedInUser(db, req);
    if (!user?.email) return json({ error: "Please sign in again." }, 401);
    const body = await req.json().catch(() => ({}));
    const interval: "month" | "year" = body?.interval === "year" ? "year" : "month";
    if (body?.agreedToTerms !== true) {
      return json({ error: "Please tick the box to agree to the Terms before paying." }, 400);
    }
    // Kept on the subscription as a record that they agreed to the Terms and asked to start straight away.
    const agreedAt = new Date().toISOString();

    const stripe = stripeClient();
    let customer = await findCustomer(stripe, db, user);
    if (!customer) {
      customer = (await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } })).id;
    }
    await db.from("subscribers").upsert({
      user_id: user.id,
      email: user.email,
      stripe_customer_id: customer,
      updated_at: new Date().toISOString(),
    });
    const active = await stripe.subscriptions.list({ customer, status: "active", limit: 1 });
    if (active.data.length) return json({ error: "You already have Premium." }, 409);

    const site = siteUrl(req);
    const session = await stripe.checkout.sessions.create({
      customer,
      mode: "subscription",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: PRICES[interval],
            recurring: { interval },
            product_data: { name: "RevPlan Premium" },
          },
        },
      ],
      allow_promotion_codes: true,
      client_reference_id: user.id,
      subscription_data: {
        metadata: { user_id: user.id, agreed_to_terms_at: agreedAt, immediate_start_requested: "true" },
      },
      success_url: `${site}/upgrade?success=1`,
      cancel_url: `${site}/upgrade`,
    });
    return json({ url: session.url });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
