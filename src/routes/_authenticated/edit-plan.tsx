import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { DatePicker } from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { useActivePlan } from "@/hooks/useActivePlan";
import { updatePlanDetails } from "@/lib/plan";

export const Route = createFileRoute("/_authenticated/edit-plan")({
  head: () => ({
    meta: [
      { title: "Edit revision plan — RevisionPath" },
      { name: "description", content: "Update your revision plan name and start date." },
      { property: "og:title", content: "Edit revision plan — RevisionPath" },
      { property: "og:description", content: "Update your revision plan without losing your progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EditPlanPage,
});

function EditPlanPage() {
  const { plan, isLoading } = useActivePlan();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (!plan) return;
    setName(plan.name);
    setStartDate(plan.start_date ?? format(new Date(plan.created_at), "yyyy-MM-dd"));
  }, [plan]);

  async function save() {
    if (!plan || !startDate) return;
    setSaving(true);
    try {
      await updatePlanDetails(plan.id, name, startDate);
      await queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plan updated");
      navigate({ to: "/plan" });
    } catch (error) {
      console.error(error);
      toast.error("Your changes couldn't be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return <AppShell><p className="text-sm font-semibold text-muted-foreground">Loading your plan…</p></AppShell>;
  }

  if (!plan) {
    return <AppShell><p className="text-sm font-semibold">No plan was found.</p></AppShell>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-extrabold tracking-tight">Edit plan</h1>
        <p className="mt-1 text-[13px] font-medium text-muted-foreground">
          Changes apply immediately. Your topics, ratings and notes stay untouched.
        </p>

        <div className="mt-5 rounded-[16px] bg-card p-5 ring-1 ring-black/5">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Plan name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-[12px] bg-background px-3 py-2.5 text-sm font-medium ring-1 ring-border focus:outline-none"
            />
          </label>

          <div className="mt-4">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Plan start date</span>
            <div className="mt-1">
              <DatePicker value={startDate} onChange={setStartDate} />
            </div>
            <p className="mt-1.5 text-[12px] font-medium text-muted-foreground">
              Moving this date automatically moves every study date in the timetable.
            </p>
          </div>

          <div className="mt-5 flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link to="/plan">Cancel</Link>
            </Button>
            <Button className="flex-1" disabled={!startDate || saving} onClick={() => void save()}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}