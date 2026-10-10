"use client";

import { useMemo, useState } from "react";
import NumberInput from "@/components/number-input";

type Mode = "basic" | "advanced";
type DownMode = "dollars" | "percent";
type LoanType = "conventional" | "fha" | "va" | "usda";

const loanTypeLabels: Record<LoanType, string> = {
  conventional: "Conventional",
  fha: "FHA",
  va: "VA",
  usda: "USDA",
};

const loanTypeOrder: LoanType[] = ["conventional", "fha", "va", "usda"];

// Typical published program terms; lenders and agencies update these.
const loanTypeDetails: Record<
  LoanType,
  {
    minDown: string;
    insurance: string;
    upfrontFee: string;
    bestFor: string;
  }
> = {
  conventional: {
    minDown: "3% (first-time buyers) to 5%",
    insurance:
      "PMI only if you put less than 20% down. It can be removed once you reach 20% equity.",
    upfrontFee: "None",
    bestFor: "Buyers with good credit (about 620+) and steady income.",
  },
  fha: {
    minDown: "3.5% with a 580+ credit score (10% with 500–579)",
    insurance:
      "Annual MIP of about 0.15%–0.55% of the loan. It lasts for the life of the loan with less than 10% down, or 11 years with 10%+ down.",
    upfrontFee: "1.75% upfront MIP, usually added to the loan",
    bestFor: "Buyers with lower credit scores or a small down payment.",
  },
  va: {
    minDown: "0%",
    insurance: "None. VA loans have no monthly mortgage insurance.",
    upfrontFee:
      "Funding fee of 1.25%–3.3%, usually added to the loan. Waived for many veterans with a service-connected disability.",
    bestFor: "Eligible veterans, active-duty service members, and some surviving spouses.",
  },
  usda: {
    minDown: "0%",
    insurance: "Annual guarantee fee of 0.35% of the loan.",
    upfrontFee: "1% guarantee fee, usually added to the loan",
    bestFor:
      "Low- to moderate-income buyers in eligible rural and suburban areas.",
  },
};

type LoanCosts = {
  upfrontFee: number;
  upfrontFeeRate: number;
  monthlyInsurance: number;
  insuranceLabel: string;
};

function loanCosts(
  type: LoanType,
  baseLoan: number,
  price: number,
  years: number,
  manualPmi: number,
  vaUsedBefore: boolean,
  vaExempt: boolean,
): LoanCosts {
  const ltv = price > 0 ? (baseLoan / price) * 100 : 0;
  const downPercent = 100 - ltv;

  if (type === "fha") {
    const annualMip =
      years > 15 ? (ltv > 95 ? 0.55 : 0.5) : ltv > 90 ? 0.4 : 0.15;

    return {
      upfrontFee: baseLoan * 0.0175,
      upfrontFeeRate: 1.75,
      monthlyInsurance: (baseLoan * annualMip) / 100 / 12,
      insuranceLabel: `FHA MIP (${annualMip}%/yr)`,
    };
  }

  if (type === "va") {
    const feeRate = vaExempt
      ? 0
      : downPercent < 5
        ? vaUsedBefore
          ? 3.3
          : 2.15
        : downPercent < 10
          ? 1.5
          : 1.25;

    return {
      upfrontFee: (baseLoan * feeRate) / 100,
      upfrontFeeRate: feeRate,
      monthlyInsurance: 0,
      insuranceLabel: "Mortgage insurance",
    };
  }

  if (type === "usda") {
    const upfrontFee = baseLoan * 0.01;

    return {
      upfrontFee,
      upfrontFeeRate: 1,
      monthlyInsurance: ((baseLoan + upfrontFee) * 0.35) / 100 / 12,
      insuranceLabel: "USDA annual fee (0.35%/yr)",
    };
  }

  return {
    upfrontFee: 0,
    upfrontFeeRate: 0,
    monthlyInsurance: manualPmi,
    insuranceLabel: "PMI",
  };
}

// Minimum down payment (%) each program typically allows.
const minDownPercent: Record<LoanType, number> = {
  conventional: 3,
  fha: 3.5,
  va: 0,
  usda: 0,
};

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

  const [loanTypeChoice, setLoanTypeChoice] =
    useState<LoanType>("conventional");
  const [vaUsedBefore, setVaUsedBefore] = useState(false);
  const [vaExempt, setVaExempt] = useState(false);

  // Basic mode keeps the original conventional-with-manual-PMI behavior.
  const loanType: LoanType =
    mode === "advanced" ? loanTypeChoice : "conventional";

  const downPayment =
    downMode === "percent"
      ? (price * Math.min(downValue, 100)) / 100
      : Math.min(downValue, price);

  const downPercent = price > 0 ? (downPayment / price) * 100 : 0;
  const baseLoan = Math.max(0, price - downPayment);
  const months = Math.max(1, Math.round(years * 12));

  const costsFor = (type: LoanType) =>
    loanCosts(type, baseLoan, price, years, monthlyPmi, vaUsedBefore, vaExempt);

  const costs = costsFor(loanType);

  // Upfront program fees are assumed to be financed into the loan.
  const loanAmount = baseLoan + costs.upfrontFee;
  const basePayment = payment(loanAmount, rate, months);
  const monthlyMortgageInsurance = costs.monthlyInsurance;

  // Texas rates are commonly expressed as dollars per $100
  // of taxable property value.
  const totalTaxRate = taxes.reduce((sum, tax) => sum + tax.rate, 0);

  const detailedAnnualTax = (taxableValue / 100) * totalTaxRate + annualPid;

  const effectiveAnnualTax =
    mode === "advanced" ? detailedAnnualTax : annualTax;

  const monthlyTax = effectiveAnnualTax / 12;
  const monthlyInsurance = annualInsurance / 12;

  const monthlyTotal =
    basePayment +
    monthlyTax +
    monthlyInsurance +
    monthlyHoa +
    monthlyMortgageInsurance;

  // Same inputs, priced under each program, for the comparison table.
  const comparison = loanTypeOrder.map((type) => {
    const typeCosts = costsFor(type);
    const typePayment = payment(
      baseLoan + typeCosts.upfrontFee,
      rate,
      months,
    );

    return {
      type,
      costs: typeCosts,
      monthly:
        typePayment +
        monthlyTax +
        monthlyInsurance +
        monthlyHoa +
        typeCosts.monthlyInsurance,
      belowMinDown: downPercent + 1e-9 < minDownPercent[type],
    };
  });

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
      <NumberInput
        min="0"
        step={step}
        value={value}
        onValueChange={(raw) => onChange(numeric(raw))}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
      />
    </label>
  );

  return (
    <main className="bg-slate-50 px-4 pb-10 pt-4 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
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
                <h3 className="text-lg font-semibold">Loan Type</h3>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">
                    Loan program
                  </span>
                  <select
                    value={loanTypeChoice}
                    onChange={(event) =>
                      setLoanTypeChoice(event.target.value as LoanType)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                  >
                    {loanTypeOrder.map((type) => (
                      <option key={type} value={type}>
                        {loanTypeLabels[type]}
                      </option>
                    ))}
                  </select>
                </label>

                {loanType === "va" && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={vaUsedBefore}
                        onChange={(event) =>
                          setVaUsedBefore(event.target.checked)
                        }
                      />
                      I&apos;ve used a VA loan before
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={vaExempt}
                        onChange={(event) => setVaExempt(event.target.checked)}
                      />
                      Exempt from the VA funding fee (e.g. service-connected
                      disability)
                    </label>
                  </div>
                )}

                {comparison.find((row) => row.type === loanType)
                  ?.belowMinDown && (
                  <p
                    role="alert"
                    className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800"
                  >
                    {loanTypeLabels[loanType]} loans usually need at least{" "}
                    {minDownPercent[loanType]}% down. Your down payment is{" "}
                    {downPercent.toFixed(1)}%.
                  </p>
                )}

                {costs.upfrontFee > 0 && (
                  <p className="text-sm text-slate-600">
                    Includes a {costs.upfrontFeeRate}% upfront fee of{" "}
                    <strong>{money(costs.upfrontFee)}</strong>, added to your
                    loan amount.
                  </p>
                )}

                <h3 className="border-t border-slate-200 pt-5 text-lg font-semibold">
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
                {loanType === "conventional" &&
                  input("Monthly PMI ($)", monthlyPmi, setMonthlyPmi)}
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
              {(
                [
                  ...(mode === "advanced"
                    ? [["Loan type", loanTypeLabels[loanType]]]
                    : []),
                  ["Loan amount", money(loanAmount)],
                  ...(costs.upfrontFee > 0
                    ? [["Upfront fee (financed)", money(costs.upfrontFee)]]
                    : []),
                  ["Principal & interest", money(basePayment)],
                  ["Property tax / month", money(monthlyTax)],
                  ["Insurance / month", money(monthlyInsurance)],
                  ["HOA / month", money(monthlyHoa)],
                  [
                    `${costs.insuranceLabel} / month`,
                    money(monthlyMortgageInsurance),
                  ],
                ] as [string, string][]
              ).map(([label, amount]) => (
                <div
                  key={String(label)}
                  className="flex justify-between gap-4 border-b border-slate-100 pb-3"
                >
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold">{amount}</span>
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
              manual estimate. FHA, VA, and USDA fees use typical program rates.
              Property tax and insurance are held constant in these estimates.
            </p>
          </section>
        </div>

        {mode === "advanced" && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
              Conventional vs FHA vs VA vs USDA
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              How the main loan types differ, and what each would cost with the
              numbers you entered above.
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="w-36 p-3" />
                    {comparison.map((row) => (
                      <th
                        key={row.type}
                        className={`p-3 text-base ${
                          row.type === loanType
                            ? "bg-blue-50 text-blue-800"
                            : ""
                        }`}
                      >
                        {loanTypeLabels[row.type]}
                        {row.type === loanType && (
                          <span className="ml-2 text-xs font-medium">
                            (selected)
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr className="border-b border-slate-100">
                    <th className="p-3 font-semibold text-slate-700">
                      Your est. monthly payment
                    </th>
                    {comparison.map((row) => (
                      <td
                        key={row.type}
                        className={`p-3 ${row.type === loanType ? "bg-blue-50" : ""}`}
                      >
                        <span className="text-lg font-bold text-blue-700">
                          {money(row.monthly)}
                        </span>
                        {row.belowMinDown && (
                          <span className="mt-1 block text-xs text-amber-700">
                            Needs at least {minDownPercent[row.type]}% down
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                  {(
                    [
                      ["Minimum down payment", "minDown"],
                      ["Mortgage insurance", "insurance"],
                      ["Upfront fee", "upfrontFee"],
                      ["Best for", "bestFor"],
                    ] as const
                  ).map(([label, key]) => (
                    <tr key={key} className="border-b border-slate-100">
                      <th className="p-3 font-semibold text-slate-700">
                        {label}
                      </th>
                      {comparison.map((row) => (
                        <td
                          key={row.type}
                          className={`p-3 text-slate-600 ${
                            row.type === loanType ? "bg-blue-50" : ""
                          }`}
                        >
                          {loanTypeDetails[row.type][key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Conventional PMI uses the monthly amount you entered. FHA, VA,
              and USDA fees use typical program rates and assume upfront fees
              are financed. Eligibility, limits, and fees vary; confirm with a
              lender.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
