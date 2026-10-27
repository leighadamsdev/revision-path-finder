import { createFileRoute, Link } from "@tanstack/react-router";

import { ContactEmail, LegalPage, Section, Summary } from "@/components/LegalPage";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie policy | RevPlan" },
      { name: "description", content: "The small amount of browser storage RevPlan uses, and why." },
      { property: "og:title", content: "Cookie policy | RevPlan" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CookiesPage,
});

const ROWS: { name: string; what: string; how: string }[] = [
  {
    name: "Sign-in (sb-…-auth-token)",
    what: "Keeps you signed in as you move around RevPlan.",
    how: "Until you sign out",
  },
  {
    name: "Your settings (revplan.* and revisionpath.*)",
    what: "Remembers choices like your active plan, your colour filter and unfinished forms, so you don't lose them.",
    how: "Until you clear your browser storage",
  },
  {
    name: "Stripe",
    what: "Set by Stripe on its own secure checkout and account pages, to take payment safely and prevent fraud.",
    how: "Set by Stripe; see Stripe's cookie policy",
  },
];

function CookiesPage() {
  return (
    <LegalPage
      title="Cookie policy"
      intro={
        <p>
          Cookies and similar browser storage are small pieces of information a website saves on your device. RevPlan
          only uses the ones it needs to work.
        </p>
      }
    >
      <Summary title="The short version">
        <li>We only store what's needed to keep you signed in and remember your settings.</li>
        <li>No advertising cookies, no tracking cookies and no analytics.</li>
        <li>Because everything we use is essential, we don't need to ask before setting it, so there's no cookie banner.</li>
      </Summary>

      <Section title="What we use">
        <div className="overflow-x-auto rounded-[12px] ring-1 ring-border">
          <table className="w-full text-left text-[13px] sm:text-[14px]">
            <thead className="bg-secondary text-[12px] font-extrabold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Why</th>
                <th className="hidden px-3 py-2 sm:table-cell">How long</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.name} className="border-t border-border align-top">
                  <td className="px-3 py-2 font-bold">{r.name}</td>
                  <td className="px-3 py-2">
                    {r.what}
                    <span className="mt-1 block text-[12px] font-semibold text-muted-foreground sm:hidden">{r.how}</span>
                  </td>
                  <td className="hidden px-3 py-2 sm:table-cell">{r.how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          The lettering on RevPlan comes from Google Fonts. This doesn't set cookies, but your browser contacts Google to
          download it, so Google sees your IP address.
        </p>
      </Section>

      <Section title="Managing cookies">
        <p>
          You can delete or block cookies and site storage in your browser's settings. If you block them, you won't be
          able to stay signed in to RevPlan.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          If we ever want to add cookies that aren't essential, such as analytics, we'll update this page and ask for
          your permission first. Questions? Email <ContactEmail /> or read our{" "}
          <Link to="/privacy" className="font-bold text-primary underline">Privacy policy</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
