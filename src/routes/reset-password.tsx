import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Choose a new password — RevisionPath" },
      {
        name: "description",
        content: "Set a new password for your RevisionPath account and get back to your revision plan.",
      },
      { property: "og:title", content: "Choose a new password — RevisionPath" },
      {
        property: "og:description",
        content: "Set a new password for your RevisionPath account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      toast.error("Those two passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. You're signed in.");
      navigate({ to: "/plan" });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "We couldn't set that password. Try the email link again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <header className="mx-auto w-full max-w-md px-5 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-[10px] bg-structure">
            <span className="text-sm font-extrabold text-structure-foreground">R</span>
          </div>
          <p className="text-[15px] font-extrabold tracking-tight">RevisionPath</p>
        </Link>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-16">
        <div className="rounded-[18px] bg-card p-5 ring-1 ring-black/5">
          <p className="text-lg font-extrabold tracking-tight">Choose a new password</p>
          <p className="mt-1 text-[13px] font-medium text-muted-foreground">
            Open this page from the link we emailed you, then pick a new password.
          </p>
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                New password
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-[12px] bg-background px-3 py-2.5 text-sm font-medium ring-1 ring-border focus:outline-none focus:ring-ring"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Confirm password
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full rounded-[12px] bg-background px-3 py-2.5 text-sm font-medium ring-1 ring-border focus:outline-none focus:ring-ring"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-primary py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save new password"}
            </button>
          </form>
          <Link
            to="/auth"
            className="mt-4 block text-center text-[13px] font-bold text-muted-foreground"
          >
            Back to sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
