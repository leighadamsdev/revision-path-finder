import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { SchoolSearch, fetchAllSchools } from "@/components/SchoolSearch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
              <span className="block text-[13px] font-extrabold">Weekly summary email</span>
              <span className="block text-[12px] font-medium text-muted-foreground">
                Sessions done vs planned, mastery per subject and exam countdown — sent to you, and to
                your parent email if you've added one.
              </span>
            </span>
          </label>
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
