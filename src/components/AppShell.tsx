import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { CalendarRange, CircleGauge, FileText, Sparkles } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useActivePlan } from "@/hooks/useActivePlan";

const TABS = [
  { to: "/plan", label: "Timetable", icon: CalendarRange },
  { to: "/progress", label: "Progress", icon: CircleGauge },
  { to: "/papers", label: "Past Papers", icon: FileText },
  { to: "/sites", label: "Sites", icon: Sparkles },
] as const;

export function AppShell({
  children,
  headerCentre,
}: {
  children: ReactNode;
  headerCentre?: ReactNode;
}) {
  const navigate = useNavigate();
  const { plan, plans, setActive } = useActivePlan();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="app-shell min-h-screen bg-background font-sans text-foreground">
      <div className="app-header sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 pb-3 pt-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-maths">
                <span className="text-sm font-extrabold text-background">R</span>
              </div>
              <div className="min-w-0 leading-none">
                <p className="text-[15px] font-extrabold tracking-tight">RevisionPath</p>
                {plan ? (
                  plans.length > 1 ? (
                    <select
                      value={plan.id}
                      onChange={(e) => setActive(e.target.value)}
                      className="mt-1 max-w-[150px] truncate bg-transparent text-[11px] font-semibold text-muted-foreground focus:outline-none"
                    >
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} · {p.weeks} weeks
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="mt-1 truncate text-[11px] font-semibold text-muted-foreground">
                      {plan.name} · {plan.weeks} weeks
                    </p>
                  )
                ) : null}
              </div>
            </div>

            {headerCentre}

            <div className="flex shrink-0 items-center gap-1">
              <Link
                to="/setup"
                className="hidden rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground sm:inline-flex"
              >
                New plan
              </Link>
              <button
                onClick={signOut}
                className="rounded-full px-3 py-2 text-[13px] font-bold text-muted-foreground hover:bg-card"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="app-main mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6">{children}</main>

      <nav className="app-nav fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-4">
            {TABS.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                className="flex flex-col items-center gap-1 py-2.5 text-muted-foreground"
                activeProps={{ className: "text-maths" }}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`grid size-6 place-items-center rounded-full ${isActive ? "bg-maths/10" : ""}`}
                    >
                      <tab.icon className="size-4" strokeWidth={2.5} />
                    </span>
                    <span
                      className={`text-[10px] ${isActive ? "font-extrabold" : "font-bold"}`}
                    >
                      {tab.label}
                    </span>
                  </>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
