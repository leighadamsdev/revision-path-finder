import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { SchoolSearch, fetchAllSchools } from "@/components/SchoolSearch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { PremiumTag } from "@/components/PremiumGate";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Your account — RevPlan" },
      { name: "description", content: "Your school, parent email and weekly summary settings." },
      { property: "og:title", content: "Your account — RevPlan" },
      { property: "og:description", content: "Your school, parent email and weekly summary settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

const field =
  "mt-1 w-full rounded-[12px] bg-background px-3 py-2.5 text-sm font-medium ring-1 ring-border focus:outline-none focus:ring-ring";

function AccountPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const schools = useQuery({
    queryKey: ["schools"],
    queryFn: fetchAllSchools,
  });
  const profile = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("school_id, parent_email, digest_opt_in")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });
  const [schoolId, setSchoolId] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [digest, setDigest] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile.data) return;
    setSchoolId(profile.data.school_id ?? "");
    setParentEmail(profile.data.parent_email ?? "");
    setDigest(profile.data.digest_opt_in);
  }, [profile.data]);

  async function save() {
    if (!user) return;
    const email = parentEmail.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("That parent email doesn't look right.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert(
      { id: user.id, school_id: schoolId || null, parent_email: email || null, digest_opt_in: digest },
      { onConflict: "id" },
    );
    // Keep sign-up details in step so they aren't re-applied later.
    await supabase.auth.updateUser({ data: { school_id: schoolId || null, parent_email: email || null } });
    setSaving(false);
    if (error) {
      toast.error("Couldn't save — try again.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    toast.success("Saved.");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-lg">
        <h1 className="text-xl font-extrabold tracking-tight">Your account</h1>
        <p className="mt-1 text-[13px] font-medium text-muted-foreground">{user?.email}</p>
        <MembershipCard />
        <div className="mt-5 space-y-4 rounded-[16px] bg-card p-5 ring-1 ring-black/5">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">School</span>
            <SchoolSearch schools={schools.data ?? []} value={schoolId} onChange={setSchoolId} />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Parent or carer email (optional)
            </span>
            <input type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className={field} />
          </label>
          <label className="flex items-start gap-2.5">
            <input type="checkbox" className="mt-1" checked={digest} onChange={(e) => setDigest(e.target.checked)} />
            <span>
              <span className="flex items-center gap-2 text-[13px] font-extrabold">
                Weekly summary email <PremiumBadgeIfFree />
              </span>
              <span className="block text-[12px] font-medium text-muted-foreground">
                Every Sunday at 6pm: sessions ticked off, knowledge checkers, topics rated, mocks
                added and your exam countdown. Sent to you, and to your parent or carer if you've
                added their email.
              </span>
            </span>
          </label>
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
        <PremiumOnly>
          <WeeklySummaryPreview />
        </PremiumOnly>
      </div>
    </AppShell>
  );
}

/** Shows this week's summary email as it would arrive, and can send a test copy. */
function WeeklySummaryPreview() {
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);
  const [busy, setBusy] = useState<"preview" | "test" | null>(null);

  async function run(mode: "preview" | "test") {
    setBusy(mode);
    const { data, error } = await supabase.functions.invoke("weekly-summary", { body: { mode } });
    setBusy(null);
    const message = (data as { error?: string } | null)?.error;
    if (error || message) {
      let detail = message;
      if (!detail && error && "context" in error) {
        try {
          detail = ((await (error as { context: Response }).context.json()) as { error?: string }).error;
        } catch {
          /* no body */
        }
      }
      toast.error(detail ?? "The weekly summary isn't available yet. Please try again later.");
      return;
    }
    if (mode === "preview") setPreview(data as { subject: string; html: string });
    else toast.success(`Sent to ${(data as { sent: string }).sent}. Check your inbox (and spam).`);
  }

  return (
    <div className="mt-5 rounded-[16px] bg-card p-5 ring-1 ring-black/5">
      <h2 className="text-sm font-extrabold">Your weekly summary</h2>
      <p className="mt-1 text-[12px] font-medium text-muted-foreground">
        See what this week's email says so far. It updates as you tick off sessions, use the
        Knowledge Checker and rate topics.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => void run("preview")} disabled={busy !== null}>
          {busy === "preview" ? "Loading…" : preview ? "Refresh preview" : "Preview this week's email"}
        </Button>
        <Button variant="ghost" onClick={() => void run("test")} disabled={busy !== null}>
          {busy === "test" ? "Sending…" : "Email me a test"}
        </Button>
      </div>
      {preview ? (
        <div className="mt-4">
          <p className="text-[12px] font-bold text-muted-foreground">Subject: {preview.subject}</p>
          <iframe
            title="Weekly summary email preview"
            srcDoc={preview.html}
            sandbox=""
            className="mt-2 h-[640px] w-full rounded-[12px] ring-1 ring-border"
          />
        </div>
      ) : null}
    </div>
  );
}

function PremiumBadgeIfFree() {
  const { isPremium, loading } = usePremium();
  return !loading && !isPremium ? <PremiumTag /> : null;
}

function PremiumOnly({ children }: { children: ReactNode }) {
  const { isPremium } = usePremium();
  return isPremium ? <>{children}</> : null;
}

/** Free or Premium, with the next step for each. */
function MembershipCard() {
  const { isPremium, subscription, loading } = usePremium();
  if (loading) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[16px] bg-card p-4 ring-1 ring-black/5">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Membership</p>
        <p className="text-sm font-extrabold">
          {isPremium
            ? subscription?.subscribed
              ? `Premium (${subscription.plan === "yearly" ? "yearly" : "monthly"})`
              : subscription?.complimentary
                ? "Premium (free)"
                : "Premium (admin access)"
            : "Free"}
        </p>
      </div>
      <Button asChild variant={isPremium ? "outline" : "default"}>
        <Link to="/upgrade">{isPremium ? "Manage membership" : "Upgrade to Premium"}</Link>
      </Button>
    </div>
  );
}
