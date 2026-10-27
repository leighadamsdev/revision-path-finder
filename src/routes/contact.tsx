import { createFileRoute, Link } from "@tanstack/react-router";

import { ContactEmail, Fill, LegalPage, Section } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us | RevPlan" },
      { name: "description", content: "How to get help with RevPlan, your account or Premium." },
      { property: "og:title", content: "Contact us | RevPlan" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ContactPage,
});

const link = "font-bold text-primary underline";

function ContactPage() {
  return (
    <LegalPage
      title="Contact us"
      showUpdated={false}
      intro={
        <p>
          Email <ContactEmail /> and we'll get back to you, usually within 2 working days. Please write from the email
          address on your RevPlan account so we can find it.
        </p>
      }
    >
      <Section title="Quick answers">
        <ul>
          <li><strong>Forgotten your password?</strong> Use "Forgot password?" on the <Link to="/auth" className={link}>sign-in page</Link>.</li>
          <li><strong>Cancel Premium?</strong> Go to the <Link to="/upgrade" className={link}>Upgrade page</Link> and choose "Manage or cancel". You keep Premium until the end of the period you've paid for.</li>
          <li><strong>Want a refund?</strong> If you first bought Premium in the last 14 days, email us. See <Link to="/terms" hash="14-days" className={link}>your 14-day right to cancel</Link>.</li>
          <li><strong>Stop the weekly email, or change your parent's email?</strong> Go to <Link to="/account" className={link}>Account</Link>, or use the unsubscribe link in the email.</li>
          <li><strong>Delete your account or get a copy of your data?</strong> Email us. See the <Link to="/privacy" className={link}>Privacy policy</Link>.</li>
        </ul>
      </Section>

      <Section title="Worried about something?">
        <p>
          If you see anything on RevPlan that worries you, or you're concerned about a young person's safety, email us
          straight away and we'll look into it. If someone is in immediate danger, call 999. Students can talk to
          Childline for free, any time, on 0800 1111 or at{" "}
          <a href="https://www.childline.org.uk" className={link} target="_blank" rel="noreferrer">childline.org.uk</a>.
        </p>
      </Section>

      <Section title="Our details">
        <p>
          <Fill value={LEGAL.ownerName} />
          <br />
          <Fill value={LEGAL.address} />
          <br />
          <ContactEmail />
          {LEGAL.companyNumber ? (
            <>
              <br />
              Company number: <Fill value={LEGAL.companyNumber} />
            </>
          ) : null}
        </p>
      </Section>
    </LegalPage>
  );
}
