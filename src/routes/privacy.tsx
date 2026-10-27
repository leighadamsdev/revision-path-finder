import { createFileRoute, Link } from "@tanstack/react-router";

import { ContactEmail, Fill, LegalPage, Section, Summary } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy | RevPlan" },
      { name: "description", content: "How RevPlan collects, uses and protects your information." },
      { property: "og:title", content: "Privacy policy | RevPlan" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro={
        <p>
          RevPlan helps GCSE students plan their revision. Many of the people who use it are 13 to 16, so we've
          tried to keep this clear. The short version comes first; the full detail follows.
        </p>
      }
    >
      <Summary title="The short version">
        <li>We only collect what we need to run RevPlan: your email, your subjects and topics, how confident you feel, your plans and your revision activity.</li>
        <li>We never sell your information, we don't show adverts and we don't track you around the internet.</li>
        <li>If you add a parent or carer's email, they get a weekly summary of your revision. You can remove them or switch it off any time in Account.</li>
        <li>Payments are handled by Stripe. We never see your card details.</li>
        <li>You can ask to see, correct or delete your information at any time by emailing us.</li>
      </Summary>

      <Section title="1. Who we are">
        <p>
          RevPlan is run by <Fill value={LEGAL.ownerName} />, <Fill value={LEGAL.ownerType} />
          {LEGAL.companyNumber ? (
            <>
              {" "}
              (company number <Fill value={LEGAL.companyNumber} />)
            </>
          ) : null}
          . We are the "controller" of your personal information, which means we decide how it's used and we're
          responsible for looking after it.
        </p>
        <p>
          Address: <Fill value={LEGAL.address} />
          <br />
          Email: <ContactEmail />
          <br />
          ICO registration number: <Fill value={LEGAL.icoNumber} />
        </p>
      </Section>

      <Section title="2. Who can use RevPlan">
        <p>
          You need to be 13 or older to create an account. If you're under 18, we recommend you tell a parent or
          carer that you're using RevPlan, especially before buying Premium. If we find out an account belongs to
          someone under 13, we'll delete it.
        </p>
      </Section>

      <Section title="3. What we collect">
        <p><strong>Information you give us:</strong></p>
        <ul>
          <li>Your email address and password (passwords are stored scrambled, so nobody at RevPlan can see them).</li>
          <li>Your school, if you choose one.</li>
          <li>A parent or carer's email address, if you add one.</li>
          <li>Your subjects, exam boards, tiers, topics and exam dates.</li>
          <li>Your red, amber and green ratings, and any mock exam results you enter.</li>
          <li>Your revision plans, the sessions you tick off, Knowledge Checker results, flashcards and saved practice question sets.</li>
          <li>Photos or files you upload so we can read topic lists or exam timetables from them.</li>
          <li>Messages you send us.</li>
        </ul>
        <p><strong>Information created when you use RevPlan:</strong></p>
        <ul>
          <li>When you signed up and last signed in.</li>
          <li>Whether you have Premium, which plan, and when it renews or ends.</li>
          <li>Basic technical records our hosting providers keep to run the service securely, such as IP addresses and error logs.</li>
        </ul>
        <p><strong>From Stripe, if you buy Premium:</strong> whether your payment worked, your plan, renewal dates and the last few digits and type of card. We never receive your full card number.</p>
        <p>We don't ask for your name, date of birth, address or phone number, and we'd ask you not to put personal details like these into topic names or notes.</p>
      </Section>

      <Section title="4. How we use it, and our legal reasons">
        <p>UK data protection law says we need a lawful reason for each way we use your information:</p>
        <ul>
          <li><strong>To run your account and the features you use</strong>, like building your plan, rating topics and saving your work. Reason: to provide the service you've asked for (contract).</li>
          <li><strong>To take payment and manage Premium</strong>. Reason: contract, and we must keep payment records for tax purposes (legal obligation).</li>
          <li><strong>To send the weekly summary email</strong> to you and, if you added one, your parent or carer. Reason: it's part of Premium (contract) and, for parents, our legitimate interest in helping families support revision. Every email has an unsubscribe link, and you can switch it off in Account.</li>
          <li><strong>To send service emails</strong>, like confirming your email address, resetting your password, receipts and important changes to RevPlan. Reason: contract.</li>
          <li><strong>To read topic lists or timetables from files you upload</strong>. Reason: contract, because you asked us to.</li>
          <li><strong>To keep RevPlan safe and working</strong>, fix problems and help you when you contact us. Reason: legitimate interests.</li>
        </ul>
        <p>We don't send marketing emails. If we ever want to, we'll ask first. We don't use your information for advertising or make automated decisions about you that have legal or similarly significant effects.</p>
      </Section>

      <Section title="5. AI features">
        <p>
          <strong>Reading uploads.</strong> When you upload a photo or file of a topic list, exam timetable or mock
          results, we send that file to an AI model through Lovable's AI service so it can read the text and turn it
          into topics or dates. Only the file is sent, not your email address.
        </p>
        <p>
          <strong>AI tutor and practice question prompts.</strong> These are written inside RevPlan using your
          subjects, topics and ratings. RevPlan doesn't send them anywhere: you copy them yourself into an AI tool you
          choose, such as ChatGPT, Gemini or Claude. That tool's own privacy policy and age rules then apply, so
          please check them, and don't paste in anything personal you wouldn't want that company to have.
        </p>
      </Section>

      <Section title="6. Who we share it with">
        <p>We only share your information with companies that help us run RevPlan, and only what they need:</p>
        <ul>
          <li><strong>Lovable and Supabase</strong>: host the website and database where your account and revision data are stored, and provide the AI service used to read uploads.</li>
          <li><strong>Stripe</strong>: takes payments for Premium.</li>
          <li><strong>Resend</strong>: sends our emails.</li>
          <li><strong>Google Fonts</strong>: provides the lettering used on the site, so your browser contacts Google, which sees your IP address.</li>
        </ul>
        <p>
          We may also share information if the law requires it, to protect someone's safety, or if RevPlan is sold
          (the new owner would have to follow this policy). If you share a plan using a share link, anyone with that
          link can see the plan.
        </p>
        <p>
          Some of these companies store data outside the UK, including in the USA. When that happens, we rely on
          protections approved under UK law, such as the UK–US data bridge or the UK's international data transfer
          agreements.
        </p>
      </Section>

      <Section title="7. How long we keep it">
        <ul>
          <li><strong>Your account and revision data</strong>: while you have an account. If you ask us to delete your account, we'll delete it within 30 days.</li>
          <li><strong>Inactive accounts</strong>: if you haven't signed in for 2 years, we may delete your account. We'll email you first.</li>
          <li><strong>Payment records</strong>: 6 years, because tax law requires it.</li>
          <li><strong>Emails you send us</strong>: up to 2 years after we've dealt with them.</li>
          <li><strong>Technical logs</strong>: kept by our hosting and email providers for a short time, usually no more than 90 days.</li>
        </ul>
      </Section>

      <Section title="8. Keeping it safe">
        <p>
          Your information is stored on secure, encrypted servers. Each account can only see its own data, passwords
          are never stored in a readable form and payments are handled entirely by Stripe. RevPlan admins can see
          account emails, membership status and how many subjects and plans an account has so they can help with
          problems, but they can't see passwords.
        </p>
      </Section>

      <Section title="9. Your rights">
        <p>You have the right to:</p>
        <ul>
          <li>ask for a copy of the information we hold about you;</li>
          <li>ask us to correct anything that's wrong;</li>
          <li>ask us to delete your information;</li>
          <li>object to, or ask us to limit, how we use it;</li>
          <li>ask for your information in a format you can take elsewhere.</li>
        </ul>
        <p>
          Email <ContactEmail /> to use any of these rights. These are your rights even if you're under 18. A parent
          or carer can also contact us on your behalf. We'll reply within one month and it's free.
        </p>
        <p>
          You can change your parent or carer email and switch off the weekly summary yourself in{" "}
          <Link to="/account" className="font-bold text-primary underline">Account</Link>.
        </p>
      </Section>

      <Section title="10. Complaints">
        <p>
          If you're unhappy with how we've used your information, please tell us first at <ContactEmail /> so we can
          put it right. You can also complain to the Information Commissioner's Office (ICO), the UK's data protection
          regulator, at{" "}
          <a href="https://ico.org.uk/make-a-complaint/" className="font-bold text-primary underline" target="_blank" rel="noreferrer">
            ico.org.uk/make-a-complaint
          </a>{" "}
          or on 0303 123 1113.
        </p>
      </Section>

      <Section title="11. Cookies">
        <p>
          We only use the storage your browser needs to keep you signed in and remember your settings. See our{" "}
          <Link to="/cookies" className="font-bold text-primary underline">Cookie policy</Link>.
        </p>
      </Section>

      <Section title="12. Changes to this policy">
        <p>
          If we make important changes, we'll tell you by email or on the site before they take effect. The date at
          the top shows when this policy was last updated.
        </p>
      </Section>
    </LegalPage>
  );
}
