import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useActivePlan } from "@/hooks/useActivePlan";
import { deletePlan, type Plan } from "@/lib/plan";

export const Route = createFileRoute("/_authenticated/my-plans")({
  head: () => ({
    meta: [
      { title: "My plans — RevPlan" },
      { name: "description", content: "All your saved GCSE revision plans in one place — open, edit or delete them." },
      { property: "og:title", content: "My plans — RevPlan" },
      { property: "og:description", content: "Open, switch between, edit or delete your saved revision plans." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyPlansPage,
});

function MyPlansPage() {
  const { plan: active, plans, setActive, isLoading } = useActivePlan();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [toDelete, setToDelete] = useState<Plan | null>(null);
  const [typed, setTyped] = useState("");

  function open(id: string, to: "/plan" | "/edit-plan") {
    setActive(id);
    navigate({ to });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">My plans</h1>
            <p className="text-[13px] font-medium text-muted-foreground">
              Every plan you create is saved here. Open one to work on it — it becomes your current plan.
            </p>
          </div>
          <Button asChild>
            <Link to="/setup"><Plus /> Create a new plan</Link>
          </Button>
        </div>

        <div className="mt-5 space-y-3">
          {isLoading ? <div className="h-20 animate-pulse rounded-[16px] bg-card" /> : null}
          {!isLoading && plans.length === 0 ? (
            <p className="rounded-[16px] bg-card p-5 text-sm font-semibold ring-1 ring-black/5">
              You haven't saved a plan yet. <Link to="/setup" className="font-extrabold underline">Create your first plan</Link>.
            </p>
          ) : null}
          {plans.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-[16px] bg-card p-4 ring-1 ring-black/5">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-extrabold">
                  {p.name}
                  {active?.id === p.id ? (
                    <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold">Current plan</span>
                  ) : null}
                </p>
                <p className="text-[12px] font-medium text-muted-foreground">
                  {p.weeks} weeks · starts {format(parseISO(p.start_date), "d MMM yyyy")}
                </p>
              </div>
              <Button size="sm" onClick={() => open(p.id, "/plan")}><FolderOpen /> Open</Button>
              <Button size="sm" variant="outline" onClick={() => navigate({ to: "/setup", search: { from: p.id, mode: "edit" } })}><Pencil /> Edit from the start</Button>
              <Button size="sm" variant="outline" onClick={() => open(p.id, "/edit-plan")}>Quick edit</Button>
              <Button size="sm" variant="outline" onClick={() => navigate({ to: "/setup", search: { from: p.id, mode: "copy" } })}>Copy and edit</Button>
              <Button size="sm" variant="ghost" onClick={() => { setTyped(""); setToDelete(p); }}><Trash2 /> Delete</Button>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={Boolean(toDelete)} onOpenChange={(v) => !v && setToDelete(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete “{toDelete?.name}”?</DialogTitle></DialogHeader>
          <p className="text-[13px] font-medium text-muted-foreground">
            This removes the plan and all its sessions. Type the plan name to confirm.
          </p>
          <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={toDelete?.name} />
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={typed.trim() !== toDelete?.name.trim()}
              onClick={async () => {
                if (!toDelete) return;
                try {
                  await deletePlan(toDelete.id);
                  toast.success("Plan deleted.");
                  setToDelete(null);
                  await queryClient.invalidateQueries();
                } catch {
                  toast.error("Couldn't delete that plan — try again.");
                }
              }}
            >
              Delete plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
