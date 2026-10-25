import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Search, ShieldCheck, ShieldOff, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  confirmed: boolean;
  admin: boolean;
  subscribed: boolean;
  complimentary: boolean;
  plan: string | null;
  renews: string | null;
  plans: number;
  subjects: number;
  parent_email: string | null;
  weekly_email: boolean;
};

type Filter = "all" | "free" | "premium" | "admin";

/** Calls the protected admin-users function and returns its reply or a readable error. */
async function adminCall<T>(body: object): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-users", { body });
  let message = (data as { error?: string } | null)?.error;
  if (!message && error && "context" in error) {
    try {
      message = ((await (error as { context: Response }).context.json()) as { error?: string })
        .error;
    } catch {
      /* no body */
    }
  }
  if (message || error) throw new Error(message ?? "User management isn't available just now.");
  return data as T;
}

const day = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "Never";

function membership(u: AdminUser) {
  if (u.subscribed)
    return {
      label: `Premium (${u.plan === "yearly" ? "yearly" : "monthly"})`,
      tone: "bg-conf-high/15 text-conf-high",
    };
  if (u.complimentary) return { label: "Premium (free)", tone: "bg-primary/15 text-primary" };
  // Admins see everything anyway, so "Free" would be misleading.
  if (u.admin) return null;
  return { label: "Free", tone: "bg-secondary text-muted-foreground" };
}

/** Admin: find users, send password resets, give free Premium, manage admins, delete accounts. */
export function UsersPanel() {
  const queryClient = useQueryClient();
  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminCall<{ users: AdminUser[] }>({ action: "list" }).then((r) => r.users),
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (users.data ?? []).filter((u) => {
      if (
        q &&
        !u.email.toLowerCase().includes(q) &&
        !(u.parent_email ?? "").toLowerCase().includes(q)
      )
        return false;
      if (filter === "admin") return u.admin;
      if (filter === "premium") return u.subscribed || u.complimentary;
      if (filter === "free") return !u.subscribed && !u.complimentary && !u.admin;
      return true;
    });
  }, [users.data, search, filter]);

  const totals = useMemo(() => {
    const all = users.data ?? [];
    return {
      all: all.length,
      premium: all.filter((u) => u.subscribed || u.complimentary).length,
      paying: all.filter((u) => u.subscribed).length,
      admin: all.filter((u) => u.admin).length,
    };
  }, [users.data]);

  async function act(user: AdminUser, body: object, key: string) {
    setBusy(`${user.id}:${key}`);
    try {
      const r = await adminCall<{ message: string }>({ ...body, userId: user.id });
      toast.success(r.message);
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-[16px] bg-card p-4 ring-1 ring-black/5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[10px] bg-background px-3 py-2 ring-1 ring-border">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student or parent email…"
              aria-label="Search users"
              className="w-full bg-transparent text-sm font-medium focus:outline-none"
            />
          </div>
          {(
            [
              ["all", `All (${totals.all})`],
              ["premium", `Premium (${totals.premium})`],
              ["free", "Free"],
              ["admin", `Admins (${totals.admin})`],
            ] as [Filter, string][]
          ).map(([key, text]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${
                filter === key
                  ? "bg-structure text-structure-foreground"
                  : "bg-background ring-1 ring-border"
              }`}
            >
              {text}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[12px] font-medium text-muted-foreground">
          {totals.paying} paying through Stripe · {totals.premium - totals.paying} with free
          Premium. You can't see or set passwords: "Send reset email" lets the student choose a new
          one.
        </p>
      </div>

      {users.isLoading ? <Skeleton className="h-40 w-full" /> : null}
      {users.isError ? (
        <p className="rounded-[12px] bg-card p-4 text-[13px] font-semibold ring-1 ring-black/5">
          {(users.error as Error).message} If you've just added this feature, ask Lovable to deploy
          the admin-users edge function.
        </p>
      ) : null}

      <ul className="space-y-2">
        {shown.map((u) => {
          const m = membership(u);
          const isBusy = (k: string) => busy === `${u.id}:${k}`;
          return (
            <li key={u.id} className="rounded-[14px] bg-card p-4 ring-1 ring-black/5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="min-w-0 truncate text-sm font-extrabold">{u.email}</p>
                {m ? (
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${m.tone}`}>
                    {m.label}
                  </span>
                ) : null}
                {u.admin ? (
                  <span className="rounded-full bg-structure px-2 py-0.5 text-[11px] font-extrabold text-structure-foreground">
                    Admin
                  </span>
                ) : null}
                {!u.confirmed ? (
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                    Email not confirmed
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[12px] font-medium text-muted-foreground">
                Joined {day(u.created_at)} · Last signed in {day(u.last_sign_in_at)} · {u.subjects}{" "}
                subject
                {u.subjects === 1 ? "" : "s"} · {u.plans} plan{u.plans === 1 ? "" : "s"}
                {u.subscribed && u.renews ? ` · Renews ${day(u.renews)}` : ""}
                {u.parent_email ? ` · Parent: ${u.parent_email}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isBusy("reset")}
                  onClick={() => void act(u, { action: "reset" }, "reset")}
                >
                  <KeyRound /> {isBusy("reset") ? "Sending…" : "Send reset email"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isBusy("premium")}
                  onClick={() =>
                    void act(u, { action: "premium", on: !u.complimentary }, "premium")
                  }
                >
                  <Sparkles /> {u.complimentary ? "Remove free Premium" : "Give free Premium"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isBusy("admin")}
                  onClick={() => {
                    if (
                      !u.admin &&
                      !window.confirm(
                        `Make ${u.email} an admin? They'll be able to change shared content and manage users.`,
                      )
                    )
                      return;
                    void act(u, { action: "admin", on: !u.admin }, "admin");
                  }}
                >
                  {u.admin ? <ShieldOff /> : <ShieldCheck />}{" "}
                  {u.admin ? "Remove admin" : "Make admin"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    setDeleting(u);
                    setConfirmText("");
                  }}
                >
                  <Trash2 /> Delete account
                </Button>
              </div>
              {u.subscribed && u.complimentary ? (
                <p className="mt-2 text-[11px] font-semibold text-muted-foreground">
                  Also paying through Stripe. Removing free Premium won't cancel their subscription.
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
      {users.data && !shown.length ? (
        <p className="text-[13px] font-medium text-muted-foreground">No users match.</p>
      ) : null}

      {deleting ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Delete account"
        >
          <div className="w-full max-w-md rounded-[16px] bg-card p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <p className="text-lg font-extrabold">Delete this account?</p>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setDeleting(null)}
                className="rounded-full p-1 hover:bg-secondary"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-[13px] font-medium text-muted-foreground">
              This permanently deletes <strong>{deleting.email}</strong> and their subjects, topics,
              ratings, plans and checkers. It can't be undone.
              {deleting.subscribed
                ? " Cancel their Stripe subscription in Stripe first, or they'll keep being charged."
                : ""}
            </p>
            <label className="mt-3 block text-[12px] font-bold">
              Type their email to confirm
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="mt-1 w-full rounded-[10px] bg-background px-3 py-2 text-sm font-medium ring-1 ring-border focus:outline-none"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={
                  confirmText.trim().toLowerCase() !== deleting.email.toLowerCase() ||
                  isDeleting(busy, deleting)
                }
                onClick={() => {
                  const target = deleting;
                  void act(target, { action: "delete" }, "delete").then(() => setDeleting(null));
                }}
              >
                {isDeleting(busy, deleting) ? "Deleting…" : "Delete account"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const isDeleting = (busy: string | null, u: AdminUser) => busy === `${u.id}:delete`;
