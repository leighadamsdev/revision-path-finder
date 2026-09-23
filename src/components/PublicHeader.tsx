import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/Logo";

const PUBLIC_LINKS = [
  { to: "/", label: "Home" },
  { to: "/exams", label: "Exam timetable" },
  { to: "/papers", label: "Past Papers" },
  { to: "/sites", label: "Revision links" },
  { to: "/revision-help", label: "Revision Help" },
] as const;

export function PublicHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-4xl px-5 pb-3 pt-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            aria-label="rev.plan home"
            className="inline-flex items-center rounded-[8px] bg-card px-3 py-2 shadow-sm"
          >
            <Logo className="h-8 w-auto" />
          </Link>
          <Link
            to="/auth"
            className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            Sign in
          </Link>
        </div>
        <nav className="mt-3 overflow-x-auto border-t border-border pt-2" aria-label="Main navigation">
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
      </div>
    </header>
  );
}