import Link from "next/link";
import { calculators } from "@/lib/site";

const companyLinks = [
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
  { title: "Privacy Policy", href: "/privacy-policy" },
  { title: "Terms of Use", href: "/terms" },
  { title: "Disclaimer", href: "/disclaimer" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-10 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
        <div>
          <Link
            href="/"
            className="text-lg font-bold text-blue-700 dark:text-blue-400"
          >
            MonthlyWise
          </Link>
          <p className="mt-2 leading-6">
            Free, simple financial calculators to help you plan monthly
            payments, budgets, and shared expenses.
          </p>
        </div>

        <nav aria-label="Calculators">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Calculators
          </h2>
          <ul className="mt-3 space-y-2">
            {calculators.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-blue-700">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Company
          </h2>
          <ul className="mt-3 space-y-2">
            {companyLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-blue-700">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="mx-auto mt-8 max-w-6xl border-t border-slate-200 pt-6 text-xs leading-5 dark:border-slate-800">
        © 2026 MonthlyWise. Results are estimates for educational purposes only
        and are not financial advice.
      </p>
    </footer>
  );
}
