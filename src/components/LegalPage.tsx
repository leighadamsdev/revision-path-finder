import type { ReactNode } from "react";

import { PublicHeader } from "@/components/PublicHeader";
import { LEGAL, isPlaceholder } from "@/lib/legal";

/** Shows a business detail from LEGAL, highlighted while it's still a placeholder. */
export function Fill({ value }: { value: string }) {
  if (!isPlaceholder(value)) return <>{value}</>;
  return (
    <mark className="rounded bg-yellow-200 px-1 font-bold text-yellow-950" title="Fill this in in src/lib/legal.ts">
      {value}
    </mark>
  );
}

/** Contact email as a link (or a highlighted placeholder). */
export function ContactEmail() {
  if (isPlaceholder(LEGAL.contactEmail)) return <Fill value={LEGAL.contactEmail} />;
  return (
    <a href={`mailto:${LEGAL.contactEmail}`} className="font-bold text-primary underline">
      {LEGAL.contactEmail}
    </a>
  );
}

/** A heading and body for one part of a policy. */
export function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="mt-8 text-lg font-extrabold tracking-tight">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

/** Page layout shared by Privacy, Terms, Cookies and Contact. */
export function LegalPage({
  title,
  intro,
  children,
  showUpdated = true,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  showUpdated?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <PublicHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16 pt-8">
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        {showUpdated ? (
          <p className="mt-1 text-[13px] font-semibold text-muted-foreground">Last updated {LEGAL.lastUpdated}</p>
        ) : null}
        {intro ? <div className="mt-4 text-[15px] font-medium leading-relaxed">{intro}</div> : null}
        <div className="legal-body text-[15px] font-medium leading-relaxed text-foreground/90 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-1.5">
          {children}
        </div>
      </main>
    </div>
  );
}

/** The "kid-friendly summary" box at the top of a policy. */
export function Summary({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6 rounded-[16px] bg-card p-5 ring-1 ring-black/5">
      <p className="text-[12px] font-extrabold uppercase tracking-wide text-primary">{title}</p>
      <ul className="mt-3 space-y-2 text-[15px] font-semibold leading-relaxed [&_li]:ml-5 [&_li]:list-disc">{children}</ul>
    </div>
  );
}
