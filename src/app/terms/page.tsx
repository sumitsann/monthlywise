import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { CONTACT_EMAIL, LAST_UPDATED } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of Use",
  description:
    "The terms that apply when you use MonthlyWise calculators and tools.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <ContentPage title="Terms of Use" updated={LAST_UPDATED}>
      <p>
        These Terms of Use govern your use of www.monthlywise.com (the
        &quot;Site&quot;). By using the Site, you agree to these terms. If you
        do not agree, please do not use the Site.
      </p>

      <h2 className="text-2xl font-bold">Use of the Site</h2>
      <p>
        MonthlyWise provides free financial calculators and a shared-expense
        tool for personal, non-commercial use. You agree not to misuse the
        Site, including by attempting to disrupt it, access it through
        automated means at excessive rates, or upload unlawful or harmful
        content.
      </p>

      <h2 className="text-2xl font-bold">No financial advice</h2>
      <p>
        All results are estimates for educational and informational purposes
        only. They are not financial, investment, tax, or legal advice, and
        they are not an offer of credit. Actual loan terms, payments, and costs
        are set by lenders and may differ. Please read our{" "}
        <Link href="/disclaimer">Disclaimer</Link> and consult a qualified
        professional before making financial decisions.
      </p>

      <h2 className="text-2xl font-bold">Content you submit</h2>
      <p>
        When you create a Split Expenses group, you are responsible for the
        information you enter and for who you share the group link with. Do not
        enter sensitive personal data. We may remove groups that violate these
        terms.
      </p>

      <h2 className="text-2xl font-bold">Intellectual property</h2>
      <p>
        The Site&apos;s design, text, and code are owned by MonthlyWise and
        may not be copied or republished without permission, except as allowed
        by law.
      </p>

      <h2 className="text-2xl font-bold">Third-party links and ads</h2>
      <p>
        The Site displays advertising from third parties, including Google
        AdSense, and may link to other websites. We are not responsible for
        the content, products, or practices of third parties.
      </p>

      <h2 className="text-2xl font-bold">Disclaimer of warranties</h2>
      <p>
        The Site is provided &quot;as is&quot; and &quot;as available&quot;
        without warranties of any kind. We do not guarantee that results will
        be accurate, complete, or error-free, or that the Site will always be
        available.
      </p>

      <h2 className="text-2xl font-bold">Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, MonthlyWise is not liable for
        any loss or damage arising from your use of the Site or reliance on its
        results.
      </p>

      <h2 className="text-2xl font-bold">Changes</h2>
      <p>
        We may update these terms at any time. Continued use of the Site after
        changes means you accept the updated terms.
      </p>

      <h2 className="text-2xl font-bold">Contact</h2>
      <p>
        Questions? Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </ContentPage>
  );
}
