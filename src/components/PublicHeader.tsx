import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

const PUBLIC_LINKS = [
  { to: "/", label: "Home" },
  { to: "/revision-guide", label: "Effective Revision" },
  { to: "/plan", label: "Revision Planner" },
  { to: "/my-plans", label: "My plans" },
  { to: "/library", label: "My Subjects & Topics" },
  { to: "/knowledge-checker", label: "Knowledge Checker" },
  { to: "/revision-tools", label: "Revision Tools" },
  { to: "/papers", label: "Past Papers" },
  { to: "/sites", label: "Revision Links" },
] as const;

export function PublicHeader() {
  const { user } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className="public-header border-b border-border bg-background print:hidden">
      <div className="mx-auto max-w-4xl px-5 pb-3 pt-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            aria-label="rev.plan home"
            className="inline-flex items-center rounded-[8px] bg-card px-3 py-2 shadow-sm"
          >
            <Logo className="h-8 w-auto" />
          </Link>
          {user ? (
            <Link to="/plan" className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">My plan</Link>
          ) : (
            <Link to="/auth" search={{ mode: "signup", context: "create-plan", returnTo: "/setup" }} className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Start free</Link>
          )}
        </div>
        <nav className="mt-3 hidden overflow-x-auto border-t border-border pt-2 sm:block" aria-label="Main navigation">
          <div className="flex min-w-max items-center gap-1">
            {PUBLIC_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-[8px] px-3 py-2 text-[12px] font-bold text-muted-foreground hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
                activeOptions={{ exact: true }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <nav className="relative mt-3 border-t border-border pt-2 sm:hidden" aria-label="Mobile navigation">
          <div className="grid grid-cols-4 gap-1">
            {PUBLIC_LINKS.filter((item) => ["/", "/knowledge-checker", "/papers"].includes(item.to)).map((item) => (
              <Link key={item.to} to={item.to} className="flex min-h-11 items-center justify-center rounded-[8px] px-1 text-center text-[11px] font-bold text-muted-foreground" activeProps={{ className: "bg-secondary text-foreground" }} activeOptions={{ exact: true }}>{item.label}</Link>
            ))}
            <button type="button" onClick={() => setMoreOpen((open) => !open)} aria-expanded={moreOpen} className="flex min-h-11 items-center justify-center gap-1 rounded-[8px] text-[11px] font-bold text-muted-foreground hover:bg-secondary">
              {moreOpen ? <X className="size-4" /> : <Menu className="size-4" />} More
            </button>
          </div>
          {moreOpen ? (
            <div className="absolute inset-x-0 top-full z-30 mt-2 rounded-[8px] bg-card p-2 shadow-lg ring-1 ring-border">
              {PUBLIC_LINKS.filter((item) => !["/", "/knowledge-checker", "/papers"].includes(item.to)).map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setMoreOpen(false)} className="block rounded-[8px] px-3 py-3 text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground" activeProps={{ className: "bg-secondary text-foreground" }}>{item.label}</Link>
              ))}
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}