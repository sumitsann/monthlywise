"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Mode = "basic" | "advanced";
type DownMode = "dollars" | "percent";

type TaxItem = {
  name: string;
  rate: number;
};

const initialTaxes: TaxItem[] = [
  { name: "County", rate: 0 },
  { name: "City", rate: 0 },
  { name: "School district (ISD)", rate: 0 },
  { name: "MUD / SUD", rate: 0 },
  { name: "Other special districts", rate: 0 },
];

const money = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const numeric = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

function payment(principal: number, annualRate: number, months: number) {
  if (principal <= 0 || months <= 0) return 0;

  const monthlyRate = annualRate / 100 / 12;

  if (monthlyRate === 0) return principal / months;

  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

export default function MortgageCalculator() {
  const [mode, setMode] = useState<Mode>("basic");
  const [price, setPrice] = useState(350000);
  const [downMode, setDownMode] = useState<DownMode>("dollars");
  const [downValue, setDownValue] = useState(70000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);

  const [annualTax, setAnnualTax] = useState(6000);
  const [annualInsurance, setAnnualInsurance] = useState(1800);
  const [monthlyHoa, setMonthlyHoa] = useState(0);
  const [monthlyPmi, setMonthlyPmi] = useState(0);

  const [taxableValue, setTaxableValue] = useState(350000);
  const [taxes, setTaxes] = useState<TaxItem[]>(initialTaxes);
  const [annualPid, setAnnualPid] = useState(0);
  const [extraPayment, setExtraPayment] = useState(0);
  const [showSchedule, setShowSchedule] = useState(false);

  const downPayment =
    downMode === "percent"
      ? (price * Math.min(downValue, 100)) / 100
      : Math.min(downValue, price);

  const loanAmount = Math.max(0, price - downPayment);
  const months = Math.max(1, Math.round(years * 12));
  const basePayment = payment(loanAmount, rate, months);

  // Texas rates are commonly expressed as dollars per $100
  // of taxable property value.
  const totalTaxRate = taxes.reduce((sum, tax) => sum + tax.rate, 0);

  const detailedAnnualTax = (taxableValue / 100) * totalTaxRate + annualPid;

  const effectiveAnnualTax =
    mode === "advanced" ? detailedAnnualTax : annualTax;

  const monthlyTax = effectiveAnnualTax / 12;
  const monthlyInsurance = annualInsurance / 12;

  const monthlyTotal =
    basePayment + monthlyTax + monthlyInsurance + monthlyHoa + monthlyPmi;

  const schedule = useMemo(() => {
    const rows: {
      month: number;
      principal: number;
      interest: number;
      balance: number;
    }[] = [];

    let balance = loanAmount;
    let totalInterest = 0;
    const monthlyRate = rate / 100 / 12;

    // Limit the schedule to the original loan term.
    for (let month = 1; month <= months; month++) {
      if (balance <= 0.000001) break;

      const interest = balance * monthlyRate;
      const principalPaid = Math.min(
        balance,
        Math.max(0, basePayment - interest) +
          (mode === "advanced" ? extraPayment : 0),
      );

      balance = Math.max(0, balance - principalPaid);
      totalInterest += interest;

      rows.push({
        month,
        principal: principalPaid,
        interest,
        balance,
      });
    }

    return {
      rows,
      totalInterest,
      totalPaid: loanAmount + totalInterest,
      payoffMonths: rows.length,
    };
  }, [loanAmount, rate, months, basePayment, extraPayment, mode]);

  const updateTax = (index: number, value: number) => {
    setTaxes((current) =>
      current.map((tax, i) => (i === index ? { ...tax, rate: value } : tax)),
    );
  };

  const input = (
    label: string,
    value: number,
    onChange: (value: number) => void,
    step = "any",
  ) => (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(event) => onChange(numeric(event.target.value))}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
      />
    </label>
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="font-medium text-blue-700 hover:underline">
          ← Back to MonthlyWise
        </Link>

        <h1 className="mt-7 text-3xl font-bold sm:text-4xl">
          Mortgage Payment Calculator
        </h1>

        <p className="mt-3 max-w-3xl text-slate-600">
          Estimate your monthly home payment, compare costs, and explore how
          extra payments affect your loan.
        </p>

        <div className="mt-7 inline-flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setMode("basic")}
            className={`rounded-lg px-5 py-2 font-medium ${
              mode === "basic" ? "bg-blue-700 text-white" : "text-slate-600"
            }`}
          >
            Basic
          </button>
          <button
            type="button"
            onClick={() => setMode("advanced")}
            className={`rounded-lg px-5 py-2 font-medium ${
              mode === "advanced" ? "bg-blue-700 text-white" : "text-slate-600"
            }`}
          >
            Advanced
          </button>
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
          <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Mortgage Details</h2>

            {input("Home price ($)", price, setPrice)}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  Down payment type
                </span>
                <select
                  value={downMode}
                  onChange={(event) => {
                    const nextMode = event.target.value as DownMode;

                    setDownValue(
                      nextMode === "percent"
                        ? price > 0
                          ? (downPayment / price) * 100
                          : 0
                        : downPayment,
                    );
                    setDownMode(nextMode);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                >
                  <option value="dollars">Dollar amount</option>
                  <option value="percent">Percentage</option>
                </select>
              </label>

              {input(
                downMode === "percent"
                  ? "Down payment (%)"
                  : "Down payment ($)",
                downValue,
                setDownValue,
              )}
            </div>

            {input("Annual interest rate (%)", rate, setRate)}
            {input("Loan term (years)", years, setYears, "1")}

            {mode === "basic" ? (
              <div className="space-y-4 border-t border-slate-200 pt-5">
                <h3 className="font-semibold">Monthly Housing Costs</h3>
                {input("Annual property tax ($)", annualTax, setAnnualTax)}
                {input(
                  "Annual homeowners insurance ($)",
                  annualInsurance,
                  setAnnualInsurance,
                )}
                {input("Monthly HOA ($)", monthlyHoa, setMonthlyHoa)}
                {input("Monthly PMI ($)", monthlyPmi, setMonthlyPmi)}
              </div>
            ) : (
              <div className="space-y-5 border-t border-slate-200 pt-5">
                <h3 className="text-lg font-semibold">
                  Advanced Property Tax Estimate
                </h3>

                <p className="text-sm text-slate-600">
                  Enter verified local tax rates manually. Rates below are
                  dollars per $100 of taxable value, not percentages. Zero means
                  no rate has been entered.
                </p>

                {input(
                  "Estimated taxable property value ($)",
                  taxableValue,
                  setTaxableValue,
                )}

                {taxes.map((tax, index) => (
                  <div key={tax.name}>
                    {input(
                      `${tax.name} rate ($ per $100)`,
                      tax.rate,
                      (value) => updateTax(index, value),
                      "0.0001",
                    )}
                  </div>
                ))}

                {input("Annual PID assessment ($)", annualPid, setAnnualPid)}

                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-sm text-slate-600">
                    Estimated annual property tax
                  </p>
                  <p className="mt-1 text-2xl font-bold text-blue-700">
                    {money(detailedAnnualTax)}
                  </p>
                </div>

                {input(
                  "Annual homeowners insurance ($)",
                  annualInsurance,
                  setAnnualInsurance,
                )}
                {input("Monthly HOA ($)", monthlyHoa, setMonthlyHoa)}
                {input("Monthly PMI ($)", monthlyPmi, setMonthlyPmi)}
                {input(
                  "Extra principal payment / month ($)",
                  extraPayment,
                  setExtraPayment,
                )}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Your Estimated Payment</h2>

            <p className="mt-6 text-sm text-slate-500">Monthly payment</p>
            <p className="mt-1 text-4xl font-extrabold text-blue-700">
              {money(monthlyTotal)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Extra principal payments are not included in the displayed monthly
              housing payment.
            </p>

            <div className="mt-8 space-y-4">
              {[
                ["Loan amount", loanAmount],
                ["Principal & interest", basePayment],
                ["Property tax / month", monthlyTax],
                ["Insurance / month", monthlyInsurance],
                ["HOA / month", monthlyHoa],
                ["PMI / month", monthlyPmi],
              ].map(([label, amount]) => (
                <div
                  key={String(label)}
                  className="flex justify-between gap-4 border-b border-slate-100 pb-3"
                >
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold">{money(Number(amount))}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Total loan interest</p>
                <p className="mt-1 text-xl font-bold">
                  {money(schedule.totalInterest)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Estimated payoff time</p>
                <p className="mt-1 text-xl font-bold">
                  {Math.floor(schedule.payoffMonths / 12)} years{" "}
                  {schedule.payoffMonths % 12} months
                </p>
              </div>
            </div>

            {mode === "advanced" && extraPayment > 0 && (
              <div className="mt-5 rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-800">
                  Monthly payment with extra principal
                </p>
                <p className="mt-1 text-2xl font-bold text-blue-700">
                  {money(monthlyTotal + extraPayment)}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              className="mt-7 w-full rounded-xl border border-blue-700 px-4 py-3 font-semibold text-blue-700 hover:bg-blue-50"
            >
              {showSchedule
                ? "Hide amortization schedule"
                : "View amortization schedule"}
            </button>

            {showSchedule && (
              <div className="mt-5 max-h-96 overflow-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="sticky top-0 bg-slate-100">
                    <tr>
                      <th className="p-3">Month</th>
                      <th className="p-3">Principal</th>
                      <th className="p-3">Interest</th>
                      <th className="p-3">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.rows.map((row) => (
                      <tr key={row.month} className="border-t border-slate-100">
                        <td className="p-3">{row.month}</td>
                        <td className="p-3">{money(row.principal)}</td>
                        <td className="p-3">{money(row.interest)}</td>
                        <td className="p-3">{money(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className="mt-7 text-xs leading-5 text-slate-500">
              Estimates only. Actual payments depend on your lender, property
              tax assessment, exemptions, insurance, escrow, and other costs.
              Tax districts and rates are not automatically verified. PMI is a
              manual estimate. Property tax and insurance are held constant in
              these estimates.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
