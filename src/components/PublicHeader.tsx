import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { PremiumTag } from "@/components/PremiumGate";

type NavItem = { to: string; label: string; premium?: boolean };

const MY_REVISION: readonly NavItem[] = [
  { to: "/library", label: "My Subjects" },
  { to: "/topics", label: "My Topics" },
  { to: "/rate-topics", label: "Rate my topics" },
  { to: "/knowledge-checker", label: "Knowledge Checker", premium: true },
  { to: "/exams", label: "Exam timetable", premium: true },
  { to: "/plan", label: "Revision Planner", premium: true },
  { to: "/ai-tutor", label: "Build my AI tutor", premium: true },
];

const FREE_RESOURCES: readonly NavItem[] = [
  { to: "/revision-guide", label: "Effective Revision" },
  { to: "/papers", label: "Past Papers" },
  { to: "/sites", label: "Revision Links" },
  { to: "/revision-tools", label: "Revision Tools" },
];

const GROUPS: { label: string; items: readonly NavItem[] }[] = [
  { label: "My revision", items: MY_REVISION },
  { label: "Free resources", items: FREE_RESOURCES },
];

const MOBILE_PRIMARY = ["/library", "/topics"] as const;

export function PublicHeader() {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const [moreOpen, setMoreOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const pathname = useLocation().pathname;

  useEffect(() => {
    if (!moreOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [moreOpen]);

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
            aria-label="RevPlan home"
            className="inline-flex items-center rounded-[8px] bg-background px-3 py-2 shadow-sm ring-1 ring-border"
          >
            <Logo className="h-8 w-auto" />
          </Link>
          {user ? (
            <Link to="/plan" className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">My plan</Link>
          ) : (
            <Link to="/auth" search={{ mode: "signup", context: "create-plan", returnTo: "/library" }} className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Sign up free</Link>
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
                        className={`flex items-center gap-2 whitespace-nowrap rounded-[8px] px-3 py-2.5 text-sm font-bold text-muted-foreground hover:bg-accent hover:text-foreground ${
                          isActive(item.to) ? activeLinkClass : ""
                        }`}
                      >
                        {item.label}
                        {item.premium && !isPremium ? <PremiumTag className="ml-auto" /> : null}
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
            <Link to="/" className="flex min-h-11 items-center justify-center rounded-[8px] px-1 text-center text-[11px] font-bold text-muted-foreground" activeProps={{ className: activeLinkClass }} activeOptions={{ exact: true }}>Home</Link>
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
            <div className="fixed inset-0 z-50 flex flex-col bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-sm font-bold text-foreground">Menu</span>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  aria-label="Close menu"
                  className="grid size-10 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-10">
                {GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70">{group.label}</p>
                    {group.items.map((item) => (
                      <Link key={item.to} to={item.to} onClick={() => setMoreOpen(false)} className={`flex items-center gap-2 rounded-[8px] px-3 py-3 text-sm font-bold text-muted-foreground hover:bg-accent hover:text-foreground ${isActive(item.to) ? activeLinkClass : ""}`}>{item.label}{item.premium && !isPremium ? <PremiumTag className="ml-auto" /> : null}</Link>
                    ))}
                  </div>
                ))}
                <div className="mt-4 border-t border-border px-3 pt-4">
                  {user ? (
                    <Link to="/plan" onClick={() => setMoreOpen(false)} className="block rounded-full bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground">My plan</Link>
                  ) : (
                    <Link to="/auth" search={{ mode: "signup", context: "create-plan", returnTo: "/library" }} onClick={() => setMoreOpen(false)} className="block rounded-full bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground">Sign up free</Link>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
