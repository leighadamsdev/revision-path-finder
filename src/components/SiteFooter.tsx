import { Link } from "@tanstack/react-router";

import { LEGAL, isPlaceholder } from "@/lib/legal";

/** Policy links shown at the bottom of every page. */
export function SiteFooter() {
  const owner = isPlaceholder(LEGAL.ownerName) ? "RevPlan" : LEGAL.ownerName;
  return (
    <footer className="border-t border-border bg-card print:hidden">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-[12px] font-bold text-muted-foreground">
        <p>© {new Date().getFullYear()} {owner}. Not affiliated with any exam board.</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Policies">
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <Link to="/cookies" className="hover:text-foreground">Cookies</Link>
          <Link to="/contact" className="hover:text-foreground">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
