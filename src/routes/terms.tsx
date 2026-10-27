import { createFileRoute, Link } from "@tanstack/react-router";

import { ContactEmail, Fill, LegalPage, Section, Summary } from "@/components/LegalPage";
import { PREMIUM_PRICES } from "@/hooks/usePremium";
import { LEGAL } from "@/lib/legal";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and conditions | RevPlan" },
      { name: "description", content: "The terms for using RevPlan and RevPlan Premium." },
      { property: "og:title", content: "Terms and conditions | RevPlan" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: TermsPage,
});

const link = "font-bold text-primary underline";

function TermsPage() {
  return (
    <LegalPage
      title="Terms and conditions"
      intro={
        <p>
          These terms explain the agreement between you and RevPlan when you use the site. Please read them, and if
          you're under 18, it's a good idea to read them with a parent or carer.
        </p>
      }
    >
      <Summary title="The short version">
        <li>You need to be 13 or over to have an account.</li>
        <li>RevPlan is free to use. Premium costs {PREMIUM_PRICES.month} a month or {PREMIUM_PRICES.year} a year and renews automatically until you cancel.</li>
        <li>You can cancel any time from the Upgrade page. You keep Premium until the end of the period you've paid for.</li>
        <li>If you change your mind within 14 days of first buying Premium, you can get a refund (less a small amount for the days you've used).</li>
        <li>RevPlan helps you revise, but it can't guarantee your grades, and AI-generated content can contain mistakes.</li>
      </Summary>

      <Section title="1. About us">
        <p>
          RevPlan is run by <Fill value={LEGAL.ownerName} />, <Fill value={LEGAL.ownerType} />
          {LEGAL.companyNumber ? (
            <>
              {" "}
              (company number <Fill value={LEGAL.companyNumber} />)
            </>
          ) : null}
          , of <Fill value={LEGAL.address} />. You can contact us at <ContactEmail />.
          {LEGAL.vatNumber ? <> VAT number: <Fill value={LEGAL.vatNumber} />.</> : null}
        </p>
        <p>
          By creating an account you agree to these terms. Our{" "}
          <Link to="/privacy" className={link}>Privacy policy</Link> explains how we use your information.
        </p>
      </Section>

      <Section title="2. Who can use RevPlan">
        <ul>
          <li>You must be 13 or older to create an account.</li>
          <li>RevPlan is designed for students taking GCSEs in the UK, though anyone 13 or over may use it.</li>
          <li>If you're under 18, you should have permission from a parent or carer before buying Premium, and they may need to make the payment.</li>
          <li>Keep your password private. You're responsible for what happens on your account, so tell us straight away if you think someone else has used it.</li>
        </ul>
      </Section>

      <Section title="3. Free and Premium">
        <p>
          <strong>Free</strong> lets you add your subjects and topics, rate them red, amber or green, and use the free
          resources: Effective Revision, Revision Tools, Past Papers and Revision Links.
        </p>
        <p>
          <strong>Premium</strong> adds the revision planner, exam timetable, Knowledge Checker, AI tutor builder,
          practice exam questions and the weekly summary email. The{" "}
          <Link to="/upgrade" className={link}>Upgrade page</Link> lists exactly what's included. We may improve or
          change features over time, but we won't take away the main Premium features during a period you've paid for.
        </p>
      </Section>

      <Section title="4. Prices and payment">
        <ul>
          <li>Premium costs {PREMIUM_PRICES.month} a month or {PREMIUM_PRICES.year} a year. The price shown before you pay is the price you'll be charged, including any VAT.</li>
          <li>Payments are taken by Stripe. You'll pay at the start of each month or year.</li>
          <li><strong>Premium renews automatically</strong> at the end of each period, using the same payment method, until you cancel. For yearly plans, we'll email you before it renews.</li>
          <li>If we change the price, we'll email you at least 30 days before the change affects you, so you can cancel first if you want to. A change never applies to a period you've already paid for.</li>
          <li>If a payment fails, Stripe will try again and email you. If it still can't take payment, Premium will end.</li>
        </ul>
      </Section>

      <Section id="cancelling" title="5. Cancelling Premium">
        <ul>
          <li>You can cancel at any time on the <Link to="/upgrade" className={link}>Upgrade page</Link> using "Manage or cancel". You don't need to contact us.</li>
          <li>When you cancel, you won't be charged again and you keep Premium until the end of the month or year you've already paid for. After that, your account goes back to Free.</li>
          <li>Apart from the 14-day right below, we don't give refunds for part of a month or year, but this doesn't affect your legal rights if something goes wrong with the service.</li>
        </ul>
      </Section>

      <Section id="14-days" title="6. Your 14-day right to cancel">
        <p>
          When you first buy Premium, you have 14 days to change your mind. Because you ask for Premium to start
          straight away, if you cancel in those 14 days we'll refund what you paid minus a fair amount for the days you
          had Premium. To use this right, email <ContactEmail /> within 14 days of paying, or tell us in another clear
          way. We'll refund you within 14 days of hearing from you, to the card you paid with.
        </p>
      </Section>

      <Section title="7. When Premium ends">
        <p>
          Your subjects, topics, ratings, plans and saved work stay in your account. You can still see your Free
          features, but Premium features are locked and you can't add to or change Premium content. If you subscribe
          again, everything is still there.
        </p>
      </Section>

      <Section title="8. Using RevPlan fairly">
        <p>Please don't:</p>
        <ul>
          <li>share your account or let other people use it;</li>
          <li>upload anything illegal, harmful, offensive, or that you don't have the right to use;</li>
          <li>put other people's personal information into RevPlan;</li>
          <li>try to break, overload or get around the security of the site, or copy large parts of it, including by automated means;</li>
          <li>resell RevPlan or its content.</li>
        </ul>
        <p>
          If someone breaks these rules, we may suspend or close their account. Where it's fair to, we'll warn them
          first. If we close a paid account without good reason, we'll refund any unused part of the period.
        </p>
      </Section>

      <Section title="9. Revision content, AI and exam boards">
        <ul>
          <li>RevPlan gives revision guidance and tools. It isn't a substitute for your teachers, and we can't guarantee any particular grade or result.</li>
          <li>We work hard to keep topic lists, exam dates and links accurate, but exam boards change things. Always check important details, especially exam dates, with your school or the exam board.</li>
          <li>Some features use AI. AI can make mistakes, including in questions, answers and mark schemes, so check anything that doesn't look right with your teacher.</li>
          <li>The AI tutor and practice question features create prompts for you to paste into another AI tool. Those tools are run by other companies with their own terms and age limits, which you must check and follow. We're not responsible for what those tools produce.</li>
          <li>RevPlan is not affiliated with or endorsed by AQA, Pearson Edexcel, OCR, WJEC Eduqas, CCEA or any other exam board. Their names are used only to describe which course a topic belongs to. Past papers and other linked resources belong to their owners.</li>
        </ul>
      </Section>

      <Section title="10. Your content and ours">
        <p>
          Anything you add to RevPlan, like your topics, notes and uploads, stays yours. You give us permission to store
          and process it only so we can provide RevPlan to you. RevPlan's design, text and software belong to us; you
          may use them for your own revision but not copy or reuse them for anything else.
        </p>
      </Section>

      <Section title="11. Keeping RevPlan running">
        <p>
          We aim to keep RevPlan available all the time, but it may sometimes be unavailable for maintenance or because
          of problems outside our control. If RevPlan ever closes, we'll give you at least 30 days' notice and refund any
          unused part of a paid period.
        </p>
      </Section>

      <Section title="12. Our responsibility to you">
        <p>
          If we fail to follow these terms, we're responsible for loss or damage you suffer that is a foreseeable result
          of that failure. We're not responsible for loss that isn't foreseeable, for losses to a business, or for
          problems caused by things outside our reasonable control.
        </p>
        <p>
          Nothing in these terms limits our responsibility where it would be unlawful to do so, including for death or
          personal injury caused by our negligence, for fraud, or for your rights as a consumer, such as the right to a
          service provided with reasonable care and skill. For advice on your rights, contact Citizens Advice.
        </p>
      </Section>

      <Section title="13. Closing your account">
        <p>
          You can stop using RevPlan at any time. To delete your account and data, email <ContactEmail /> from the email
          address on your account. If you have Premium, please cancel it first so you're not charged again.
        </p>
      </Section>

      <Section title="14. Changes to these terms">
        <p>
          We may update these terms, for example when we add features or the law changes. If a change is important,
          we'll email you before it applies. If you don't agree, you can cancel and stop using RevPlan.
        </p>
      </Section>

      <Section title="15. Complaints and the law">
        <p>
          If something goes wrong, please contact us at <ContactEmail /> and we'll try to sort it out quickly. These
          terms are governed by the law of England and Wales. If you live in Scotland or Northern Ireland, you can also
          bring a claim in your local courts.
        </p>
      </Section>
    </LegalPage>
  );
}
