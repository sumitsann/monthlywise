"use client";

import { useMemo, useState } from "react";
import NumberInput from "@/components/number-input";

type Mode = "basic" | "advanced";

const money = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const safe = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

function monthlyPayment(principal: number, apr: number, months: number) {
  if (principal <= 0 || months <= 0) return 0;
  const r = apr / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

type ScheduleRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

function amortize(amount: number, apr: number, months: number, extra: number) {
  const regular = monthlyPayment(amount, apr, months);
  const rate = apr / 100 / 12;
  let balance = amount;
  let interestTotal = 0;
  const rows: ScheduleRow[] = [];

  for (let month = 1; month <= months; month++) {
    if (balance < 0.000001) break;

    const interest = balance * rate;
    const principal = Math.min(
      balance,
      Math.max(0, regular - interest) + extra,
    );

    const actual = principal + interest;
    balance = Math.max(0, balance - principal);
    interestTotal += interest;

    rows.push({
      month,
      payment: actual,
      principal,
      interest,
      balance,
    });
  }

  return {
    regular,
    rows,
    interestTotal,
    payoffMonths: rows.length,
    totalPayments: amount + interestTotal,
  };
}

export default function AutoLoanCalculator() {
  const [mode, setMode] = useState<Mode>("basic");

  // Vehicle and financing
  const [msrp, setMsrp] = useState(35000);
  const [discount, setDiscount] = useState(0);
  const [downPayment, setDownPayment] = useState(5000);
  const [apr, setApr] = useState(6.5);
  const [months, setMonths] = useState(60);

  // Upgrades
  const [accessories, setAccessories] = useState(0);
  const [technology, setTechnology] = useState(0);
  const [wheels, setWheels] = useState(0);
  const [otherUpgrades, setOtherUpgrades] = useState(0);

  // Dealer add-ons
  const [warranty, setWarranty] = useState(0);
  const [gap, setGap] = useState(0);
  const [maintenance, setMaintenance] = useState(0);

  // Trade-in
  const [tradeValue, setTradeValue] = useState(0);
  const [tradePayoff, setTradePayoff] = useState(0);

  // Tax and rebates
  const [taxRate, setTaxRate] = useState(6.25);
  const [rebate, setRebate] = useState(0);
  const [tradeTaxCredit, setTradeTaxCredit] = useState(true);
  const [rebateReducesTax, setRebateReducesTax] = useState(false);
  const [taxUpgrades, setTaxUpgrades] = useState(true);
  const [taxAddons, setTaxAddons] = useState(false);

  // Fees
  const [docFee, setDocFee] = useState(300);
  const [titleFee, setTitleFee] = useState(150);
  const [registration, setRegistration] = useState(150);
  const [inspection, setInspection] = useState(0);
  const [otherFees, setOtherFees] = useState(0);

  // Finance options
  const [financeTaxFees, setFinanceTaxFees] = useState(true);
  const [financeAddons, setFinanceAddons] = useState(true);
  const [extraPayment, setExtraPayment] = useState(0);
  const [showSchedule, setShowSchedule] = useState(false);

  const results = useMemo(() => {
    const advanced = mode === "advanced";

    const vehiclePrice = Math.max(0, msrp - discount);

    const upgrades = advanced
      ? accessories + technology + wheels + otherUpgrades
      : 0;

    const addons = advanced ? warranty + gap + maintenance : 0;

    const totalFees = advanced
      ? docFee + titleFee + registration + inspection + otherFees
      : 0;

    const tradeEquity = advanced ? tradeValue - tradePayoff : 0;

    let taxable = vehiclePrice;

    if (advanced) {
      if (taxUpgrades) taxable += upgrades;
      if (taxAddons) taxable += addons;
      if (tradeTaxCredit) taxable -= tradeValue;
      if (rebateReducesTax) taxable -= rebate;
    }

    taxable = Math.max(0, taxable);

    const salesTax = advanced ? (taxable * taxRate) / 100 : 0;

    const cashRebate = advanced ? rebate : 0;

    // Items not financed are paid upfront.
    const financedAddons = advanced && financeAddons ? addons : 0;

    const upfrontAddons = advanced && !financeAddons ? addons : 0;

    const financedTaxFees =
      advanced && financeTaxFees ? salesTax + totalFees : 0;

    const upfrontTaxFees =
      advanced && !financeTaxFees ? salesTax + totalFees : 0;

    // Trade equity may be negative when a trade-in
    // loan payoff exceeds the vehicle's value.
    const rawLoan =
      vehiclePrice +
      upgrades +
      financedAddons +
      financedTaxFees -
      downPayment -
      tradeEquity -
      cashRebate;

    const amountFinanced = Math.max(0, rawLoan);
    const surplusCash = Math.max(0, -rawLoan);

    const cashDue = downPayment + upfrontAddons + upfrontTaxFees;

    const term = Math.max(1, Math.round(months));

    const normal = amortize(amountFinanced, apr, term, 0);

    const accelerated = amortize(
      amountFinanced,
      apr,
      term,
      advanced ? extraPayment : 0,
    );

    return {
      vehiclePrice,
      upgrades,
      addons,
      totalFees,
      tradeEquity,
      taxable,
      salesTax,
      amountFinanced,
      surplusCash,
      cashDue,
      normal,
      accelerated,
      interestSaved: Math.max(
        0,
        normal.interestTotal - accelerated.interestTotal,
      ),
      monthsSaved: Math.max(0, normal.payoffMonths - accelerated.payoffMonths),
    };
  }, [
    mode,
    msrp,
    discount,
    downPayment,
    apr,
    months,
    accessories,
    technology,
    wheels,
    otherUpgrades,
    warranty,
    gap,
    maintenance,
    tradeValue,
    tradePayoff,
    taxRate,
    rebate,
    tradeTaxCredit,
    rebateReducesTax,
    taxUpgrades,
    taxAddons,
    docFee,
    titleFee,
    registration,
    inspection,
    otherFees,
    financeTaxFees,
    financeAddons,
    extraPayment,
  ]);

  const input = (
    label: string,
    value: number,
    setter: (value: number) => void,
  ) => (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <NumberInput
        min="0"
        step="any"
        value={value}
        onValueChange={(raw) => setter(safe(raw))}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
      />
    </label>
  );

  const checkbox = (
    label: string,
    checked: boolean,
    setter: (checked: boolean) => void,
  ) => (
    <label className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setter(e.target.checked)}
        className="mt-1"
      />
      <span>{label}</span>
    </label>
  );

  const sectionTitle = (title: string) => (
    <h3 className="border-b border-slate-200 pb-2 text-lg font-bold">
      {title}
    </h3>
  );

  const resultRow = (label: string, value: number) => (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-3">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold">{money(value)}</span>
    </div>
  );

  return (
    <main className="bg-slate-50 px-4 pb-10 pt-4 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Auto Loan Calculator
        </h1>

        <p className="mt-3 text-slate-600">
          Estimate vehicle financing with taxes, trade-ins, upgrades, dealer
          add-ons, and early payoff options.
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
          <section className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
            {sectionTitle("Vehicle & Financing")}

            {input("Vehicle MSRP / listed price ($)", msrp, setMsrp)}

            {mode === "advanced" &&
              input("Negotiated discount ($)", discount, setDiscount)}

            {input("Cash down payment ($)", downPayment, setDownPayment)}
            {input("Annual percentage rate (%)", apr, setApr)}
            {input("Loan term (months)", months, setMonths)}

            {mode === "advanced" && (
              <>
                {sectionTitle("Vehicle Upgrades")}
                {input("Accessories ($)", accessories, setAccessories)}
                {input("Technology package ($)", technology, setTechnology)}
                {input("Wheels / tires ($)", wheels, setWheels)}
                {input("Other upgrades ($)", otherUpgrades, setOtherUpgrades)}

                {sectionTitle("Dealer Add-ons")}
                {input("Extended warranty ($)", warranty, setWarranty)}
                {input("GAP coverage ($)", gap, setGap)}
                {input("Maintenance plan ($)", maintenance, setMaintenance)}

                {sectionTitle("Trade-in")}
                {input("Trade-in vehicle value ($)", tradeValue, setTradeValue)}
                {input("Trade-in loan payoff ($)", tradePayoff, setTradePayoff)}

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Net trade-in equity</p>
                  <p
                    className={`text-xl font-bold ${
                      results.tradeEquity < 0
                        ? "text-red-600"
                        : "text-green-700"
                    }`}
                  >
                    {money(results.tradeEquity)}
                  </p>
                </div>

                {sectionTitle("Taxes & Rebates")}
                {input("Vehicle sales tax rate (%)", taxRate, setTaxRate)}
                {input("Manufacturer / dealer rebate ($)", rebate, setRebate)}

                {checkbox(
                  "Apply trade-in credit when estimating taxable value",
                  tradeTaxCredit,
                  setTradeTaxCredit,
                )}
                {checkbox(
                  "Rebate reduces taxable value (only if applicable)",
                  rebateReducesTax,
                  setRebateReducesTax,
                )}
                {checkbox(
                  "Include upgrades in taxable value",
                  taxUpgrades,
                  setTaxUpgrades,
                )}
                {checkbox(
                  "Include dealer add-ons in taxable value",
                  taxAddons,
                  setTaxAddons,
                )}

                {sectionTitle("Dealer & Government Fees")}
                {input("Dealer documentation fee ($)", docFee, setDocFee)}
                {input("Title fee ($)", titleFee, setTitleFee)}
                {input("Registration fee ($)", registration, setRegistration)}
                {input("Inspection fee ($)", inspection, setInspection)}
                {input("Other fees ($)", otherFees, setOtherFees)}

                {sectionTitle("Financing Options")}
                {checkbox(
                  "Finance taxes and fees into the loan",
                  financeTaxFees,
                  setFinanceTaxFees,
                )}
                {checkbox(
                  "Finance dealer add-ons into the loan",
                  financeAddons,
                  setFinanceAddons,
                )}
                {input(
                  "Extra monthly principal payment ($)",
                  extraPayment,
                  setExtraPayment,
                )}
              </>
            )}
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Estimated Monthly Payment</h2>

            <p className="mt-6 text-4xl font-extrabold text-blue-700">
              {money(results.normal.regular)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Scheduled payment, excluding optional extra principal.
            </p>

            <div className="mt-8">
              {resultRow("Negotiated vehicle price", results.vehiclePrice)}
              {resultRow("Vehicle upgrades", results.upgrades)}
              {resultRow("Dealer add-ons", results.addons)}
              {resultRow("Trade-in equity", results.tradeEquity)}
              {resultRow("Estimated taxable value", results.taxable)}
              {resultRow("Estimated sales tax", results.salesTax)}
              {resultRow("Total fees", results.totalFees)}
              {resultRow("Amount financed", results.amountFinanced)}
              {resultRow("Cash due at purchase", results.cashDue)}
              {resultRow(
                "Total loan interest",
                results.accelerated.interestTotal,
              )}
              {resultRow(
                "Total loan payments",
                results.accelerated.totalPayments,
              )}
            </div>

            {results.surplusCash > 0 && (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                Your entered down payment and credits exceed the modeled
                financed costs by {money(results.surplusCash)}. Review the
                purchase amounts; this is not necessarily a cash refund.
              </p>
            )}

            {mode === "advanced" && extraPayment > 0 && (
              <div className="mt-6 rounded-xl bg-blue-50 p-5">
                <h3 className="font-bold text-blue-900">
                  Extra Payment Benefits
                </h3>

                <p className="mt-3 text-sm">
                  Payment including extra principal
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {money(results.normal.regular + extraPayment)}
                </p>

                <div className="mt-4 space-y-2 text-sm">
                  <p>
                    Interest saved:{" "}
                    <strong>{money(results.interestSaved)}</strong>
                  </p>
                  <p>
                    Months saved: <strong>{results.monthsSaved}</strong>
                  </p>
                </div>
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
                    {results.accelerated.rows.map((row) => (
                      <tr key={row.month} className="border-t">
                        <td className="p-3">{row.month}</td>
                        <td className="p-3">{money(row.payment)}</td>
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
              Estimates only. Tax treatment for trade-ins, rebates, upgrades,
              warranties, and fees varies by jurisdiction and transaction. Tax
              toggles are modeling assumptions, not legal tax determinations.
              Actual lender and dealership figures may differ.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
