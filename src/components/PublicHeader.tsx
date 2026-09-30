import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

const MY_REVISION = [
  { to: "/plan", label: "Revision Planner" },
  { to: "/my-plans", label: "My plans" },
  { to: "/library", label: "My Subjects & Topics" },
  { to: "/knowledge-checker", label: "Knowledge Checker" },
] as const;

const GREAT_RESOURCES = [
  { to: "/papers", label: "Past Papers" },
  { to: "/sites", label: "Revision Links" },
  { to: "/revision-tools", label: "Revision Tools" },
] as const;

const GROUPS: { label: string; items: readonly { to: string; label: string }[] }[] = [
  { label: "My revision", items: MY_REVISION },
  { label: "Great resources", items: GREAT_RESOURCES },
];

const MOBILE_PRIMARY = ["/", "/knowledge-checker", "/papers"] as const;

export function PublicHeader() {
  const { user } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const pathname = useLocation().pathname;

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");
  const groupActive = (items: readonly { to: string }[]) => items.some((item) => isActive(item.to));

  const linkClass =
    "rounded-[8px] px-3 py-2 text-[12px] font-bold text-muted-foreground hover:bg-accent hover:text-foreground";
  const activeLinkClass = "bg-accent text-foreground";

  return (
    <header className="public-header border-b border-border bg-card print:hidden">
      <div className="mx-auto max-w-4xl px-5 pb-3 pt-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            aria-label="rev.plan home"
            className="inline-flex items-center rounded-[8px] bg-background px-3 py-2 shadow-sm ring-1 ring-border"
          >
            <Logo className="h-8 w-auto" />
          </Link>
          {user ? (
            <Link to="/plan" className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">My plan</Link>
          ) : (
            <Link to="/auth" search={{ mode: "signup", context: "create-plan", returnTo: "/setup" }} className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Start free</Link>
          )}
        </div>
        <nav className="mt-3 hidden border-t border-border pt-2 sm:block" aria-label="Main navigation">
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={linkClass}
              activeProps={{ className: activeLinkClass }}
              activeOptions={{ exact: true }}
            >
              Home
            </Link>
            <Link
              to="/revision-guide"
              className={linkClass}
              activeProps={{ className: activeLinkClass }}
              activeOptions={{ exact: true }}
            >
              Effective Revision
            </Link>
            {GROUPS.map((group) => (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setOpenGroup(group.label)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <button
                  type="button"
                  onClick={() => setOpenGroup(group.label)}
                  aria-expanded={openGroup === group.label}
                  className={`flex items-center gap-1 whitespace-nowrap rounded-[8px] px-3 py-2 text-[12px] font-bold ${
                    groupActive(group.items)
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {group.label}
                  <ChevronDown className="size-3.5" />
                </button>
                {openGroup === group.label ? (
                  <div className="absolute left-0 top-full z-30 min-w-48 rounded-b-[8px] bg-card p-2 shadow-lg ring-1 ring-border">
                    {group.items.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpenGroup(null)}
                        className={`block whitespace-nowrap rounded-[8px] px-3 py-2.5 text-sm font-bold text-muted-foreground hover:bg-accent hover:text-foreground ${
                          isActive(item.to) ? activeLinkClass : ""
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </nav>
        <nav className="relative mt-3 border-t border-border pt-2 sm:hidden" aria-label="Mobile navigation">
          <div className="grid grid-cols-4 gap-1">
            {GROUPS.flatMap((group) => group.items)
              .filter((item) => (MOBILE_PRIMARY as readonly string[]).includes(item.to))
              .map((item) => (
                <Link key={item.to} to={item.to} className="flex min-h-11 items-center justify-center rounded-[8px] px-1 text-center text-[11px] font-bold text-muted-foreground" activeProps={{ className: activeLinkClass }} activeOptions={{ exact: true }}>{item.label}</Link>
              ))}
            <button type="button" onClick={() => setMoreOpen((open) => !open)} aria-expanded={moreOpen} className="flex min-h-11 items-center justify-center gap-1 rounded-[8px] text-[11px] font-bold text-muted-foreground hover:bg-secondary">
              {moreOpen ? <X className="size-4" /> : <Menu className="size-4" />} More
            </button>
          </div>
          {moreOpen ? (
            <div className="absolute inset-x-0 top-full z-30 mt-2 rounded-[8px] bg-card p-2 shadow-lg ring-1 ring-border">
               <Link to="/revision-guide" onClick={() => setMoreOpen(false)} className={`block rounded-[8px] px-3 py-3 text-sm font-bold text-muted-foreground hover:bg-accent hover:text-foreground ${isActive("/revision-guide") ? activeLinkClass : ""}`}>Effective Revision</Link>
              {GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70">{group.label}</p>
                  {group.items
                    .filter((item) => !(MOBILE_PRIMARY as readonly string[]).includes(item.to))
                    .map((item) => (
                       <Link key={item.to} to={item.to} onClick={() => setMoreOpen(false)} className={`block rounded-[8px] px-3 py-3 text-sm font-bold text-muted-foreground hover:bg-accent hover:text-foreground ${isActive(item.to) ? activeLinkClass : ""}`}>{item.label}</Link>
                    ))}
                </div>
              ))}
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
