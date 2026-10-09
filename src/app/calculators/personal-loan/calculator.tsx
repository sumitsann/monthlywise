"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Mode = "basic" | "advanced";
type FeeMethod = "deducted" | "financed" | "upfront";

const money = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function payment(principal: number, apr: number, months: number) {
  if (principal <= 0 || months <= 0) return 0;
  const rate = apr / 100 / 12;
  if (rate === 0) return principal / months;
  return (principal * rate) / (1 - Math.pow(1 + rate, -months));
}

function amortize(
  principal: number,
  apr: number,
  months: number,
  extra: number,
) {
  const regular = payment(principal, apr, months);
  const rate = apr / 100 / 12;
  let balance = principal;
  let totalInterest = 0;

  const rows: {
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }[] = [];

  for (let month = 1; month <= months && balance > 0.000001; month++) {
    const interest = balance * rate;
    const principalPaid = Math.min(
      balance,
      Math.max(0, regular - interest) + extra,
    );
    const actualPayment = principalPaid + interest;

    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;

    rows.push({
      month,
      payment: actualPayment,
      principal: principalPaid,
      interest,
      balance,
    });
  }

  return {
    regular,
    rows,
    totalInterest,
    payoffMonths: rows.length,
    totalPayments: principal + totalInterest,
  };
}

export default function PersonalLoanCalculator() {
  const [mode, setMode] = useState<Mode>("basic");
  const [loanAmount, setLoanAmount] = useState(15000);
  const [apr, setApr] = useState(10);
  const [termMonths, setTermMonths] = useState(48);

  const [feePercent, setFeePercent] = useState(3);
  const [fixedFee, setFixedFee] = useState(0);
  const [feeMethod, setFeeMethod] = useState<FeeMethod>("deducted");
  const [extraPayment, setExtraPayment] = useState(0);
  const [showSchedule, setShowSchedule] = useState(false);

  const results = useMemo(() => {
    const advanced = mode === "advanced";
    const fee = advanced ? (loanAmount * feePercent) / 100 + fixedFee : 0;

    const financedPrincipal =
      advanced && feeMethod === "financed" ? loanAmount + fee : loanAmount;

    const cashReceived =
      advanced && feeMethod === "deducted" ? loanAmount - fee : loanAmount;

    const upfrontFee = advanced && feeMethod === "upfront" ? fee : 0;

    const months = Math.max(1, Math.round(termMonths));

    const standard = amortize(financedPrincipal, apr, months, 0);

    const accelerated = amortize(
      financedPrincipal,
      apr,
      months,
      advanced ? extraPayment : 0,
    );

    // Borrowing cost relative to the money the borrower
    // actually receives, including any upfront fee.
    const borrowingCost = accelerated.totalPayments + upfrontFee - cashReceived;

    return {
      fee,
      financedPrincipal,
      cashReceived,
      upfrontFee,
      standard,
      accelerated,
      borrowingCost,
      interestSaved: Math.max(
        0,
        standard.totalInterest - accelerated.totalInterest,
      ),
      monthsSaved: Math.max(
        0,
        standard.payoffMonths - accelerated.payoffMonths,
      ),
    };
  }, [
    mode,
    loanAmount,
    apr,
    termMonths,
    feePercent,
    fixedFee,
    feeMethod,
    extraPayment,
  ]);

  const input = (
    label: string,
    value: number,
    setter: (value: number) => void,
    step = "any",
  ) => (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          setter(Number.isFinite(parsed) ? Math.max(0, parsed) : 0);
        }}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
      />
    </label>
  );

  const row = (label: string, value: number) => (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-3">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold">{money(value)}</span>
    </div>
  );

  return (
    <main className="bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="font-medium text-blue-700 hover:underline">
          ← Back to MonthlyWise
        </Link>

        <h1 className="mt-7 text-3xl font-bold sm:text-4xl">
          Personal Loan Calculator
        </h1>

        <p className="mt-3 text-slate-600">
          Calculate monthly loan payments, origination fees, total borrowing
          costs, and early payoff savings.
        </p>

        <div className="mt-7 inline-flex rounded-xl border bg-white p-1">
          {(["basic", "advanced"] as Mode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-lg px-5 py-2 font-medium capitalize ${
                mode === item ? "bg-blue-700 text-white" : "text-slate-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
          <section className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Loan Details</h2>

            {input("Loan amount ($)", loanAmount, setLoanAmount)}
            {input("Annual interest rate (%)", apr, setApr)}
            {input("Loan term (months)", termMonths, setTermMonths, "1")}

            {mode === "advanced" && (
              <div className="space-y-5 border-t border-slate-200 pt-5">
                <h3 className="text-lg font-bold">Origination Fees</h3>

                {input("Origination fee (%)", feePercent, setFeePercent)}
                {input("Additional fixed fee ($)", fixedFee, setFixedFee)}

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">
                    How is the fee paid?
                  </span>
                  <select
                    value={feeMethod}
                    onChange={(event) =>
                      setFeeMethod(event.target.value as FeeMethod)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                  >
                    <option value="deducted">
                      Deducted from loan proceeds
                    </option>
                    <option value="financed">Added to loan principal</option>
                    <option value="upfront">Paid separately upfront</option>
                  </select>
                </label>

                {input(
                  "Extra monthly principal payment ($)",
                  extraPayment,
                  setExtraPayment,
                )}

                {feeMethod === "deducted" && results.cashReceived < 0 && (
                  <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                    Your fees exceed the loan proceeds. Review these inputs.
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Estimated Monthly Payment</h2>

            <p className="mt-6 text-4xl font-extrabold text-blue-700">
              {money(results.standard.regular)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Scheduled payment, excluding optional extra principal.
            </p>

            <div className="mt-8">
              {row("Requested loan amount", loanAmount)}
              {row("Origination and fixed fees", results.fee)}
              {row("Amount financed", results.financedPrincipal)}
              {row("Cash received", results.cashReceived)}
              {row("Fee paid upfront", results.upfrontFee)}
              {row("Total loan interest", results.accelerated.totalInterest)}
              {row("Total loan payments", results.accelerated.totalPayments)}
              {row("Estimated borrowing cost", results.borrowingCost)}
            </div>

            {mode === "advanced" && extraPayment > 0 && (
              <div className="mt-6 rounded-xl bg-blue-50 p-5">
                <h3 className="font-bold text-blue-900">
                  Extra Payment Benefits
                </h3>
                <p className="mt-3 text-sm">
                  Payment including extra principal
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {money(results.standard.regular + extraPayment)}
                </p>
                <p className="mt-3 text-sm">
                  Interest saved:{" "}
                  <strong>{money(results.interestSaved)}</strong>
                </p>
                <p className="mt-1 text-sm">
                  Months saved: <strong>{results.monthsSaved}</strong>
                </p>
              </div>
            )}

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Estimated payoff time</p>
              <p className="mt-1 text-xl font-bold">
                {Math.floor(results.accelerated.payoffMonths / 12)} years{" "}
                {results.accelerated.payoffMonths % 12} months
              </p>
            </div>

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
              <div className="mt-5 max-h-96 overflow-auto rounded-xl border">
                <table className="w-full min-w-[570px] text-left text-sm">
                  <thead className="sticky top-0 bg-slate-100">
                    <tr>
                      <th className="p-3">Month</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Principal</th>
                      <th className="p-3">Interest</th>
                      <th className="p-3">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.accelerated.rows.map((item) => (
                      <tr key={item.month} className="border-t">
                        <td className="p-3">{item.month}</td>
                        <td className="p-3">{money(item.payment)}</td>
                        <td className="p-3">{money(item.principal)}</td>
                        <td className="p-3">{money(item.interest)}</td>
                        <td className="p-3">{money(item.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className="mt-7 text-xs leading-5 text-slate-500">
              Estimates assume a fixed interest rate, monthly compounding, and
              payments made on schedule. Fees are modeled separately from the
              entered interest rate. The displayed borrowing cost is not a
              legally calculated Truth in Lending APR. Actual lender terms may
              differ.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
