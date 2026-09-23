import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { ensureProfile, useAuth } from "@/hooks/useAuth";
import { PublicHeader } from "@/components/PublicHeader";

type AuthSearch = { mode?: "signup"; context?: string; returnTo?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search["mode"] === "signup" ? "signup" as const : undefined,
    context: typeof search["context"] === "string" ? search["context"] : undefined,
    returnTo: typeof search["returnTo"] === "string" ? search["returnTo"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — rev.plan" },
      {
        name: "description",
        content: "Sign in or create your rev.plan account to build your GCSE revision plan.",
      },
      { property: "og:title", content: "Sign in — rev.plan" },
      {
        property: "og:description",
        content: "Sign in or create a rev.plan account to build your GCSE revision plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      void ensureProfile(user)
        .catch(() => undefined)
        .then(async () => {
          const { data } = await supabase.from("plans").select("id").limit(1);
          const safeReturnTo = search.returnTo?.startsWith("/") && !search.returnTo.startsWith("//")
            ? search.returnTo
            : null;
          if (safeReturnTo) {
            navigate({ to: safeReturnTo });
          } else {
            navigate({ to: data && data.length > 0 ? "/plan" : "/setup" });
          }
        });
    }
  }, [loading, user, navigate, search.returnTo]);

  async function handleReset(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't send that email.");
    } finally {
      setBusy(false);
    }
  }


  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.href },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "That didn't work. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.href,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in didn't work. Try email instead.");
      return;
    }
    if (result.redirected) return;
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <PublicHeader />

      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-16 pt-6">
        <div className="rounded-[18px] bg-card p-5 ring-1 ring-black/5">
          {checkEmail ? (
            <div>
              <p className="text-lg font-extrabold tracking-tight">Check your email</p>
              <p className="mt-2 text-[13px] font-medium leading-relaxed text-muted-foreground">
                We've sent a confirmation link to {email}. Click it to finish setting up your
                account, then come back here to sign in.
              </p>
              <button
                onClick={() => {
                  setCheckEmail(false);
                  setMode("signin");
                }}
                className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-extrabold text-primary-foreground"
              >
                Back to sign in
              </button>
            </div>
          ) : mode === "forgot" ? (
            <div>
              <p className="text-lg font-extrabold tracking-tight">Reset your password</p>
              {resetSent ? (
                <>
                  <p className="mt-2 text-[13px] font-medium leading-relaxed text-muted-foreground">
                    We've emailed a reset link to {email}. Open it and you can choose a new password.
                  </p>
                  <button
                    onClick={() => {
                      setResetSent(false);
                      setMode("signin");
                    }}
                    className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-extrabold text-primary-foreground"
                  >
                    Back to sign in
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                    Enter your email and we'll send you a link to set a new password.
                  </p>
                  <form onSubmit={handleReset} className="mt-5 space-y-3">
                    <label className="block">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        Email
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded-[12px] bg-background px-3 py-2.5 text-sm font-medium ring-1 ring-border focus:outline-none focus:ring-ring"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full rounded-full bg-primary py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-60"
                    >
                      {busy ? "Sending…" : "Email me a reset link"}
                    </button>
                  </form>
                  <button
                    onClick={() => setMode("signin")}
                    className="mt-4 w-full text-center text-[13px] font-bold text-muted-foreground"
                  >
                    Back to sign in
                  </button>
                </>
              )}
            </div>
          ) : (

            <>
              <p className="text-lg font-extrabold tracking-tight">
                {mode === "signup"
                  ? search.context === "create-plan" ? "Create your revision plan" : "Create your account"
                  : search.context === "exams" ? "Sign in to view your exam timetable" : "Welcome back"}
              </p>
              <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                {mode === "signin"
                  ? search.context === "exams" ? "We'll bring you back to your exam timetable after sign-in." : "Sign in to pick up your revision plan."
                  : "Your plan is private to your account."}
              </p>

              <button
                onClick={handleGoogle}
                disabled={busy}
                className="mt-5 w-full rounded-full border border-border bg-background py-3 text-sm font-bold text-foreground disabled:opacity-60"
              >
                Continue with Google
              </button>

              <div className="my-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  or
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    Email
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-[12px] bg-background px-3 py-2.5 text-sm font-medium ring-1 ring-border focus:outline-none focus:ring-ring"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    Password
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
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-full bg-primary py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-60"
                >
                  {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
                </button>
              </form>

              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="mt-4 w-full text-center text-[13px] font-bold text-muted-foreground"
              >
                {mode === "signin"
                  ? "New here? Create an account"
                  : "Already have an account? Sign in"}
              </button>

              {mode === "signin" ? (
                <button
                  onClick={() => {
                    setResetSent(false);
                    setMode("forgot");
                  }}
                  className="mt-2 w-full text-center text-[13px] font-bold text-muted-foreground underline"
                >
                  Forgot password?
                </button>
              ) : null}
            </>
          )}

        </div>
      </main>
    </div>
  );
}
