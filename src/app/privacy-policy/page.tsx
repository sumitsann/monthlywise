import { ContentPage } from "@/components/content-page";
import { CONTACT_EMAIL, LAST_UPDATED } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How MonthlyWise collects, uses, and protects information, including cookies and Google AdSense advertising.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <ContentPage title="Privacy Policy" updated={LAST_UPDATED}>
      <p>
        This Privacy Policy explains how MonthlyWise (&quot;we&quot;,
        &quot;us&quot;, or &quot;our&quot;) handles information when you visit{" "}
        <a href="https://www.monthlywise.com">www.monthlywise.com</a> (the
        &quot;Site&quot;). By using the Site, you agree to the practices
        described here.
      </p>

      <h2 className="text-2xl font-bold">Information we collect</h2>
      <h3>Calculator inputs</h3>
      <p>
        The mortgage, auto loan, personal loan, credit card, and budget
        calculators run entirely in your browser. The numbers you enter are not
        sent to or stored on our servers.
      </p>

      <h3>Split Expenses groups</h3>
      <p>
        If you create a shared-expense group, we store the information you
        enter (group name, member names, expense descriptions and amounts) in
        our database so that you and the people you share the link with can
        access it. Anyone with the group link can view that group, so please do
        not enter sensitive personal information. You can ask us to delete a
        group at any time by contacting us.
      </p>

      <h3>Technical and log information</h3>
      <p>
        Like most websites, our hosting provider automatically receives
        standard technical information such as your IP address, browser type,
        device type, referring page, and the time of your visit. We use IP
        addresses briefly to prevent abuse (for example, rate-limiting how many
        groups can be created) and do not use them to identify you.
      </p>
      <p>
        We use Vercel Speed Insights to measure page performance (such as load
        times). It collects anonymous performance data and does not use
        cookies.
      </p>

      <h3>Preferences stored on your device</h3>
      <p>
        We store your light/dark theme preference in your browser&apos;s local
        storage. This never leaves your device.
      </p>

      <h2 className="text-2xl font-bold">Cookies and advertising</h2>
      <p>
        We use Google AdSense to display advertisements on the Site. Google and
        its partners use cookies and similar technologies to serve ads based on
        your prior visits to this Site and other websites.
      </p>
      <ul>
        <li>
          Third-party vendors, including Google, use cookies to serve ads based
          on a user&apos;s prior visits to this website or other websites.
        </li>
        <li>
          Google&apos;s use of advertising cookies enables it and its partners
          to serve ads to you based on your visit to this Site and/or other
          sites on the Internet.
        </li>
        <li>
          You may opt out of personalized advertising by visiting{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads Settings
          </a>
          . You can also opt out of some third-party vendors&apos; use of
          cookies for personalized advertising at{" "}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.aboutads.info
          </a>
          .
        </li>
      </ul>
      <p>
        To learn more, see{" "}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer"
        >
          How Google uses information from sites or apps that use its services
        </a>
        . Visitors in the European Economic Area, the United Kingdom, and
        Switzerland will be asked for consent before personalized ads are
        shown.
      </p>
      <p>
        You can block or delete cookies through your browser settings. Doing so
        may affect how ads are shown but will not stop the calculators from
        working.
      </p>

      <h2 className="text-2xl font-bold">How we use information</h2>
      <ul>
        <li>To provide and operate the Site and its features.</li>
        <li>To keep the Site secure and prevent spam or abuse.</li>
        <li>To display advertising that helps keep MonthlyWise free.</li>
        <li>To respond to messages you send us.</li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2 className="text-2xl font-bold">Service providers</h2>
      <p>
        We rely on trusted providers to run the Site, including Vercel
        (hosting), Supabase (database for Split Expenses groups), Upstash
        (rate limiting), and Google (advertising). These providers process data
        on our behalf under their own privacy policies.
      </p>

      <h2 className="text-2xl font-bold">Your rights</h2>
      <p>
        Depending on where you live (for example, under the GDPR or the
        California Consumer Privacy Act), you may have the right to access,
        correct, or delete personal information we hold about you, or to object
        to certain processing. To make a request, email us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2 className="text-2xl font-bold">Children&apos;s privacy</h2>
      <p>
        The Site is not directed to children under 13, and we do not knowingly
        collect personal information from children.
      </p>

      <h2 className="text-2xl font-bold">Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The &quot;Last
        updated&quot; date at the top of this page shows when it was last
        revised.
      </p>

      <h2 className="text-2xl font-bold">Contact</h2>
      <p>
        Questions about this policy? Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </ContentPage>
  );
}
