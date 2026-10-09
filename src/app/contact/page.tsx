import { ContentPage } from "@/components/content-page";
import { CONTACT_EMAIL } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Contact MonthlyWise with questions, feedback, bug reports, or calculator suggestions.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <ContentPage title="Contact Us">
      <p>
        We&apos;d love to hear from you. Whether you have a question about a
        calculator, spotted something that looks wrong, or have an idea for a
        new tool, send us an email and we&apos;ll get back to you as soon as we
        can, usually within 2–3 business days.
      </p>

      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-slate-800">
        <p className="!mt-0 text-sm font-semibold uppercase tracking-wide text-blue-700">
          Email
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="mt-1 inline-block text-xl font-bold"
        >
          {CONTACT_EMAIL}
        </a>
      </div>

      <h2 className="text-2xl font-bold">Helpful details to include</h2>
      <ul>
        <li>Which calculator you were using.</li>
        <li>The numbers you entered and the result you expected.</li>
        <li>Your device and browser, if something didn&apos;t display correctly.</li>
      </ul>

      <h2 className="text-2xl font-bold">Data requests</h2>
      <p>
        To request deletion of a Split Expenses group or other data, email us
        with the group link and we&apos;ll take care of it.
      </p>

      <p>
        Please note that we can&apos;t provide personalized financial advice.
        For decisions about loans or investments, consult a licensed
        professional.
      </p>
    </ContentPage>
  );
}
