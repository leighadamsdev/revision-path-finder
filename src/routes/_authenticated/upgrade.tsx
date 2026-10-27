import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PREMIUM_FEATURES, PREMIUM_PRICES, usePremium } from "@/hooks/usePremium";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/upgrade")({
  head: () => ({
    meta: [
      { title: "RevPlan Premium" },
      {
        name: "description",
        content: "Upgrade to RevPlan Premium for your revision plan, Knowledge Checker, AI tutor and weekly summary email.",
      },
      { property: "og:title", content: "RevPlan Premium" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (raw: Record<string, unknown>): { success?: boolean } =>
    raw["success"] === 1 || raw["success"] === "1" || raw["success"] === true ? { success: true } : {},
  component: UpgradePage,
});

const FREE_FEATURES = [
  "My Subjects, with exam boards and tiers",
  "My Topics, from exam board lists, photos or your own",
  "Rate my topics red, amber or green",
  "Past Papers and Revision Links",
  "Effective Revision guide and Revision Tools",
] as const;

/** Calls a payment function and opens the Stripe page it returns. */
async function openStripe(fn: "create-checkout" | "customer-portal", body: object) {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  let message = (data as { error?: string } | null)?.error;
  if (!message && error && "context" in error) {
    try {
      message = ((await (error as { context: Response }).context.json()) as { error?: string }).error;
    } catch {
      /* no body */
    }
  }
  const url = (data as { url?: string } | null)?.url;
  if (url) {
    window.location.href = url;
    return;
  }
  toast.error(message ?? "Payments aren't available just now. Please try again later.");
}

function UpgradePage() {
  const { isPremium, isAdmin, subscription, loading, refresh } = usePremium();
  const { success } = Route.useSearch();
  const [interval, setBilling] = useState<"month" | "year">("year");
  const [busy, setBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [checking, setChecking] = useState(Boolean(success));

  // Back from Stripe: check a few times, as the payment can take a moment to show.
  useEffect(() => {
    if (!success) return;
    let cancelled = false;
    void (async () => {
      for (let i = 0; i < 5 && !cancelled; i++) {
        const latest = await refresh();
        if (latest?.subscribed) break;
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (!cancelled) setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  const renews = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          <Sparkles className="size-6 text-primary" aria-hidden="true" />
          RevPlan Premium
        </h1>

        {loading || checking ? (
          <div className="mt-5 space-y-3">
            {checking ? (
              <p className="text-[14px] font-semibold text-muted-foreground">Confirming your payment…</p>
            ) : null}
            <Skeleton className="h-40 w-full" />
          </div>
        ) : isPremium ? (
          <div className="mt-5 rounded-[16px] bg-card p-6 ring-1 ring-black/5">
            <p className="text-lg font-extrabold">
              {success ? "Welcome to Premium! " : ""}
              {subscription?.subscribed
                ? `You're on Premium (${subscription.plan === "yearly" ? "yearly" : "monthly"}).`
                : subscription?.complimentary
                  ? "You have free Premium, given by RevPlan."
                  : "You have full access as an admin."}
            </p>
            {renews ? (
              <p className="mt-1 text-[14px] font-medium text-muted-foreground">Renews or ends on {renews}.</p>
            ) : null}
            <ul className="mt-4 space-y-2">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[14px] font-medium">
                  <Check className="mt-0.5 size-4 shrink-0 text-conf-high" strokeWidth={3} aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/setup">Build my plan</Link>
              </Button>
              {subscription?.subscribed ? (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setBusy(true);
                    void openStripe("customer-portal", {}).finally(() => setBusy(false));
                  }}
                >
                  {busy ? "Opening…" : "Manage or cancel"}
                </Button>
              ) : null}
            </div>
            {isAdmin && !subscription?.subscribed && !subscription?.complimentary ? (
              <p className="mt-3 text-[12px] font-medium text-muted-foreground">
                Admins see every Premium feature without paying, so you can check the site.
              </p>
            ) : null}
          </div>
        ) : (
          <>
            {success ? (
              <p className="mt-3 rounded-[10px] bg-secondary px-3 py-2 text-[13px] font-semibold">
                We haven't seen your payment yet. It can take a minute, so try refreshing this page.
              </p>
            ) : null}
            <p className="mt-2 max-w-[60ch] text-[14px] font-medium text-muted-foreground">
              Your subjects, topics and ratings are free. Premium turns them into a plan you can follow
              and lets you keep testing yourself as you revise.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[16px] bg-card p-5 ring-1 ring-black/5">
                <p className="text-[12px] font-extrabold uppercase tracking-wide text-muted-foreground">Free</p>
                <p className="mt-1 text-2xl font-extrabold">£0</p>
                <ul className="mt-4 space-y-2">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[14px] font-medium">
                      <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={3} aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[12px] font-bold text-muted-foreground">You have this now.</p>
              </div>

              <div className="rounded-[16px] bg-structure p-5 text-structure-foreground shadow-lg ring-2 ring-primary">
                <p className="text-[12px] font-extrabold uppercase tracking-wide text-primary">Premium</p>
                <div className="mt-2 inline-flex rounded-full bg-structure-foreground/10 p-1" role="radiogroup" aria-label="Billing">
                  {(["month", "year"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={interval === v}
                      onClick={() => setBilling(v)}
                      className={`rounded-full px-3 py-1.5 text-[12px] font-extrabold ${
                        interval === v ? "bg-primary text-primary-foreground" : "opacity-80"
                      }`}
                    >
                      {v === "month" ? "Monthly" : "Yearly · save 50%"}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-2xl font-extrabold">
                  {PREMIUM_PRICES[interval]}
                  <span className="text-[14px] font-bold opacity-80"> / {interval}</span>
                </p>
                <p className="text-[12px] font-medium opacity-80">Everything in Free, plus:</p>
                <ul className="mt-3 space-y-2">
                  {PREMIUM_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[14px] font-medium">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={3} aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <label className="mt-5 flex items-start gap-2.5 text-[12px] font-semibold leading-snug">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 size-4 shrink-0 accent-primary"
                  />
                  <span>
                    I agree to the{" "}
                    <Link to="/terms" target="_blank" className="font-bold underline">Terms</Link>. I want Premium to
                    start now, and I understand it renews every {interval} until I cancel. If I cancel within 14 days,
                    I'll get a refund minus the days I've used.
                  </span>
                </label>
                <Button
                  className="mt-3 w-full"
                  disabled={busy || !agreed}
                  onClick={() => {
                    setBusy(true);
                    void openStripe("create-checkout", { interval, agreedToTerms: true }).finally(() => setBusy(false));
                  }}
                >
                  {busy ? "Opening secure checkout…" : `Upgrade for ${PREMIUM_PRICES[interval]} a ${interval}`}
                </Button>
                <p className="mt-2 text-center text-[11px] font-medium opacity-75">
                  Secure payment by Stripe. Cancel any time from this page. Under 18? Check with a parent or carer first.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
