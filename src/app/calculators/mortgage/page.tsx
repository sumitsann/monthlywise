"use client";

import { useState } from "react";
import Link from "next/link";

export default function MortgageCalculator() {
  const [price, setPrice] = useState(350000);
  const [downPayment, setDownPayment] = useState(70000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [propertyTax, setPropertyTax] = useState(6000);
  const [insurance, setInsurance] = useState(1800);
  const [hoa, setHoa] = useState(0);
  const [pmi, setPmi] = useState(0);

  const loanAmount = Math.max(0, price - downPayment);
  const monthlyRate = rate / 100 / 12;
  const numberOfPayments = years * 12;

  const principalInterest =
    numberOfPayments <= 0
      ? 0
      : monthlyRate === 0
        ? loanAmount / numberOfPayments
        : (loanAmount * monthlyRate) /
          (1 - Math.pow(1 + monthlyRate, -numberOfPayments));

  const monthlyTax = propertyTax / 12;
  const monthlyInsurance = insurance / 12;

  const totalMonthly =
    principalInterest + monthlyTax + monthlyInsurance + hoa + pmi;

  const currency = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });

  const fields = [
    { label: "Home Price ($)", value: price, setter: setPrice },
    { label: "Down Payment ($)", value: downPayment, setter: setDownPayment },
    { label: "Interest Rate (%)", value: rate, setter: setRate },
    { label: "Loan Term (Years)", value: years, setter: setYears },
    {
      label: "Annual Property Tax ($)",
      value: propertyTax,
      setter: setPropertyTax,
    },
    {
      label: "Annual Home Insurance ($)",
      value: insurance,
      setter: setInsurance,
    },
    { label: "Monthly HOA ($)", value: hoa, setter: setHoa },
    { label: "Monthly PMI ($)", value: pmi, setter: setPmi },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to MonthlyWise
        </Link>

        <h1 className="mt-8 text-4xl font-bold">Mortgage Payment Calculator</h1>

        <p className="mt-3 text-slate-600">
          Estimate your monthly mortgage payment including taxes, insurance,
          HOA, and PMI.
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold">Mortgage Details</h2>

            <div className="space-y-4">
              {fields.map((field) => (
                <label key={field.label} className="block">
                  <span className="mb-1 block text-sm font-medium">
                    {field.label}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={field.value}
                    onChange={(event) =>
                      field.setter(Math.max(0, Number(event.target.value) || 0))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Your Estimated Payment</h2>

            <p className="mt-6 text-sm text-slate-500">Total Monthly Payment</p>

            <p className="mt-1 text-4xl font-bold text-blue-600">
              {currency(totalMonthly)}
            </p>

            <div className="mt-8 space-y-4">
              {[
                ["Loan Amount", loanAmount],
                ["Principal & Interest / month", principalInterest],
                ["Property Tax / month", monthlyTax],
                ["Home Insurance / month", monthlyInsurance],
                ["HOA / month", hoa],
                ["PMI / month", pmi],
              ].map(([label, amount]) => (
                <div
                  key={String(label)}
                  className="flex justify-between gap-4 border-b border-slate-100 pb-3"
                >
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold">
                    {currency(Number(amount))}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs leading-5 text-slate-500">
              Estimates only. Property tax, insurance, HOA, and PMI are entered
              manually and may change. This calculator does not automatically
              look up local tax districts, escrow adjustments, or
              lender-specific fees.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
