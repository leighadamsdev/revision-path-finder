import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  CalendarDays,
  FileText,
  House,
  Pencil,
  Settings,
  Sparkles,
  Lightbulb,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useActivePlan } from "@/hooks/useActivePlan";
import { useIsAdmin } from "@/hooks/useRole";
import { LogoOnDark } from "@/components/Logo";


const TABS = [
  { to: "/plan", label: "Home", icon: House },
  { to: "/exams", label: "Exam timetable", icon: CalendarDays },
  { to: "/papers", label: "Past Papers", icon: FileText },
  { to: "/sites", label: "Revision links", icon: Sparkles },
  { to: "/revision-help", label: "Revision Help", icon: Lightbulb },
  { to: "/knowledge-checker", label: "Knowledge Checker", icon: ClipboardCheck },
  { to: "/revision-guide", label: "Revision guide", icon: GraduationCap },
] as const;


const ADMIN_TAB = { to: "/admin", label: "Admin", icon: Settings } as const;

export function AppShell({
  children,
  headerCentre,
}: {
  children: ReactNode;
  headerCentre?: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { plan, plans, setActive } = useActivePlan();
  const { isAdmin } = useIsAdmin();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }


  return (
    <div className="app-shell min-h-screen bg-background font-sans text-foreground">
      <div className="app-header sticky top-0 z-20 border-b border-structure bg-structure text-structure-foreground">
        <div className="mx-auto max-w-5xl px-4 pb-3 pt-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <Link to="/plan" aria-label="Home" title="Home">
                <LogoOnDark className="h-5 w-auto" />
              </Link>
              <div className="min-w-0 leading-none">
                {plan ? (
                  plans.length > 1 ? (
                    <select
                      value={plan.id}
                      onChange={(e) => setActive(e.target.value)}
                      className="mt-1 max-w-[150px] truncate bg-transparent text-[11px] font-semibold text-structure-foreground/75 focus:outline-none"
                    >
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} · {p.weeks} weeks
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="mt-1 truncate text-[11px] font-semibold text-structure-foreground/75">
                      {plan.name} · {plan.weeks} weeks
                    </p>
                  )
                ) : null}
              </div>
            </div>

            {headerCentre}

            <div className="flex shrink-0 items-center gap-1">
              {plan ? (
                <Link
                  to="/edit-plan"
                  aria-label="Edit plan"
                  title="Edit plan"
                  className="grid size-9 place-items-center rounded-full text-structure-foreground/75 hover:bg-structure-foreground/10"
                >
                  <Pencil className="size-4" />
                </Link>
              ) : null}

              <Link
                to="/setup"
                className="hidden rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground sm:inline-flex"
              >
                New plan
              </Link>
              <button
                onClick={signOut}
                className="rounded-full px-3 py-2 text-[13px] font-bold text-structure-foreground/75 hover:bg-structure-foreground/10"
              >
                Sign out
              </button>
            </div>
          </div>

          <nav className="app-nav mt-3 border-t border-structure-foreground/15" aria-label="Main navigation">
            <div className={`grid items-stretch gap-1 pt-2 ${isAdmin ? "grid-cols-8" : "grid-cols-7"}`}>
              {(isAdmin ? [...TABS, ADMIN_TAB] : TABS).map((tab) => (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className="flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-[8px] px-1 py-2 text-center text-structure-foreground/70 sm:min-h-10 sm:flex-row sm:gap-2 sm:px-3"
                  activeProps={{ className: "bg-structure-foreground/10 text-primary" }}
                  activeOptions={{ exact: true }}
                >
                  <tab.icon className="size-4 shrink-0" strokeWidth={2.5} />
                  <span className="text-[10px] font-bold leading-tight sm:text-[11px]">{tab.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

      <main className="app-main mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6">{children}</main>
    </div>
  );
}
