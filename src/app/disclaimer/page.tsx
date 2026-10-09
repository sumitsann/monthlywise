import { ContentPage } from "@/components/content-page";
import { CONTACT_EMAIL, LAST_UPDATED } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Disclaimer",
  description:
    "MonthlyWise calculators provide estimates for educational purposes only and are not financial advice.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <ContentPage title="Disclaimer" updated={LAST_UPDATED}>
      <h2 className="text-2xl font-bold">Not financial advice</h2>
      <p>
        MonthlyWise is an educational resource. Our calculators and guides
        are designed to help you understand how loans, interest, and budgets
        work. Nothing on this Site is financial, investment, tax, accounting,
        or legal advice, and MonthlyWise is not a lender, broker, or licensed
        financial advisor.
      </p>

      <h2 className="text-2xl font-bold">Estimates only</h2>
      <p>
        Calculator results are estimates based on the numbers you enter and
        standard formulas. Real-world results can differ because of lender
        fees, credit approval, rate changes, rounding, escrow adjustments,
        local taxes, insurance premiums, and other factors. Always confirm
        figures with your lender or a qualified professional before making a
        decision.
      </p>

      <h2 className="text-2xl font-bold">Accuracy</h2>
      <p>
        We work to keep our formulas and content accurate, but we make no
        guarantees. Tax rates, interest rates, and regulations change, and
        information may become out of date. If you spot an error, please let
        us know at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2 className="text-2xl font-bold">Advertising</h2>
      <p>
        MonthlyWise is supported by advertising. Ads are served by third
        parties such as Google AdSense. An ad appearing on this Site is not an
        endorsement of the advertiser or its products.
      </p>
    </ContentPage>
  );
}
