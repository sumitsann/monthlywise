"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Mode = "basic" | "advanced";
type Strategy = "avalanche" | "snowball";

type CreditCard = {
  id: number;
  name: string;
  balance: number;
  apr: number;
  minimum: number;
  promoApr: number;
  promoMonths: number;
};

type ScheduleRow = {
  month: number;
  payment: number;
  interest: number;
  balance: number;
};

const money = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const safeNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

function calculatePayoff(
  cards: CreditCard[],
  monthlyBudget: number,
  strategy: Strategy,
) {
  const working = cards.map((card) => ({
    ...card,
    balance: Math.max(0, card.balance),
  }));

  const schedule: ScheduleRow[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let insufficientPayment = false;

  const startingBalance = working.reduce((sum, card) => sum + card.balance, 0);

  if (startingBalance <= 0) {
    return {
      schedule,
      totalInterest: 0,
      totalPaid: 0,
      payoffMonths: 0,
      paidOff: true,
      insufficientPayment: false,
    };
  }

  // Safety cap prevents infinite calculations when
  // monthly payments are too small.
  const maxMonths = 1200;

  for (let month = 1; month <= maxMonths; month++) {
    const active = working.filter((card) => card.balance > 0.000001);

    if (active.length === 0) break;

    let monthInterest = 0;

    // Apply interest to each outstanding balance.
    for (const card of active) {
      const currentApr = month <= card.promoMonths ? card.promoApr : card.apr;

      const interest = card.balance * (currentApr / 100 / 12);
      card.balance += interest;
      monthInterest += interest;
    }

    // Make required minimum payments first.
    let budgetRemaining = Math.max(0, monthlyBudget);
    let monthPayment = 0;

    const minimumRequired = active.reduce(
      (sum, card) => sum + Math.min(card.balance, card.minimum),
      0,
    );

    if (budgetRemaining + 0.000001 < minimumRequired) {
      insufficientPayment = true;
      break;
    }

    for (const card of active) {
      const minimumPaid = Math.min(card.balance, card.minimum);
      card.balance -= minimumPaid;
      budgetRemaining -= minimumPaid;
      monthPayment += minimumPaid;
    }

    // Direct remaining funds to the priority card.
    const prioritized = working
      .filter((card) => card.balance > 0.000001)
      .sort((a, b) => {
        if (strategy === "snowball") {
          return a.balance - b.balance;
        }

        const aprA = month <= a.promoMonths ? a.promoApr : a.apr;
        const aprB = month <= b.promoMonths ? b.promoApr : b.apr;

        return aprB - aprA || a.balance - b.balance;
      });

    for (const card of prioritized) {
      if (budgetRemaining <= 0) break;

      const paid = Math.min(card.balance, budgetRemaining);
      card.balance -= paid;
      budgetRemaining -= paid;
      monthPayment += paid;
    }

    totalInterest += monthInterest;
    totalPaid += monthPayment;

    const remainingBalance = working.reduce(
      (sum, card) => sum + card.balance,
      0,
    );

    schedule.push({
      month,
      payment: monthPayment,
      interest: monthInterest,
      balance: Math.max(0, remainingBalance),
    });

    if (remainingBalance <= 0.000001) break;

    // Detect a non-decreasing debt balance.
    if (monthPayment <= monthInterest + 0.000001 && month > 1) {
      insufficientPayment = true;
      break;
    }
  }

  const remaining = working.reduce((sum, card) => sum + card.balance, 0);

  return {
    schedule,
    totalInterest,
    totalPaid,
    payoffMonths: schedule.length,
    paidOff: remaining <= 0.000001,
    insufficientPayment,
  };
}

export default function CreditCardCalculator() {
  const [mode, setMode] = useState<Mode>("basic");

  // Basic mode
  const [balance, setBalance] = useState(5000);
  const [apr, setApr] = useState(22);
  const [monthlyPayment, setMonthlyPayment] = useState(200);

  // Advanced mode
  const [cards, setCards] = useState<CreditCard[]>([
    {
      id: 1,
      name: "Credit Card 1",
      balance: 5000,
      apr: 22,
      minimum: 125,
      promoApr: 0,
      promoMonths: 0,
    },
    {
      id: 2,
      name: "Credit Card 2",
      balance: 3000,
      apr: 18,
      minimum: 75,
      promoApr: 0,
      promoMonths: 0,
    },
  ]);

  const [budget, setBudget] = useState(350);
  const [extraPayment, setExtraPayment] = useState(0);
  const [strategy, setStrategy] = useState<Strategy>("avalanche");
  const [showSchedule, setShowSchedule] = useState(false);

  const results = useMemo(() => {
    if (mode === "basic") {
      return calculatePayoff(
        [
          {
            id: 1,
            name: "Credit Card",
            balance,
            apr,
            minimum: 0,
            promoApr: 0,
            promoMonths: 0,
          },
        ],
        monthlyPayment,
        "avalanche",
      );
    }

    return calculatePayoff(cards, budget + extraPayment, strategy);
  }, [
    mode,
    balance,
    apr,
    monthlyPayment,
    cards,
    budget,
    extraPayment,
    strategy,
  ]);

  const updateCard = (
    id: number,
    field: keyof CreditCard,
    value: string | number,
  ) => {
    setCards((current) =>
      current.map((card) =>
        card.id === id ? { ...card, [field]: value } : card,
      ),
    );
  };

  const addCard = () => {
    setCards((current) => [
      ...current,
      {
        id: Date.now(),
        name: `Credit Card ${current.length + 1}`,
        balance: 0,
        apr: 20,
        minimum: 25,
        promoApr: 0,
        promoMonths: 0,
      },
    ]);
  };

  const numberInput = (
    label: string,
    value: number,
    setter: (value: number) => void,
  ) => (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        type="number"
        min="0"
        step="any"
        value={value}
        onChange={(event) => setter(safeNumber(event.target.value))}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
      />
    </label>
  );

  const totalStartingBalance =
    mode === "basic"
      ? balance
      : cards.reduce((sum, card) => sum + card.balance, 0);

  return (
    <main className="bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="font-medium text-blue-700 hover:underline">
          ← Back to MonthlyWise
        </Link>

        <h1 className="mt-7 text-3xl font-bold sm:text-4xl">
          Credit Card Payoff Calculator
        </h1>

        <p className="mt-3 max-w-3xl text-slate-600">
          Estimate how long it will take to eliminate credit card debt and
          compare payoff strategies.
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
            <h2 className="text-xl font-bold">Credit Card Details</h2>

            {mode === "basic" ? (
              <>
                {numberInput("Current balance ($)", balance, setBalance)}
                {numberInput("Annual interest rate (%)", apr, setApr)}
                {numberInput(
                  "Monthly payment ($)",
                  monthlyPayment,
                  setMonthlyPayment,
                )}
              </>
            ) : (
              <>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">
                    Payoff strategy
                  </span>
                  <select
                    value={strategy}
                    onChange={(event) =>
                      setStrategy(event.target.value as Strategy)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                  >
                    <option value="avalanche">
                      Avalanche — highest APR first
                    </option>
                    <option value="snowball">
                      Snowball — smallest balance first
                    </option>
                  </select>
                </label>

                {numberInput(
                  "Monthly debt payment budget ($)",
                  budget,
                  setBudget,
                )}
                {numberInput(
                  "Extra monthly payment ($)",
                  extraPayment,
                  setExtraPayment,
                )}

                <div className="space-y-5">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      className="space-y-4 rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold">{card.name}</h3>

                        <button
                          type="button"
                          onClick={() =>
                            setCards((current) =>
                              current.filter((item) => item.id !== card.id),
                            )
                          }
                          className="text-sm font-medium text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>

                      <label className="block">
                        <span className="mb-1 block text-sm">Card name</span>
                        <input
                          type="text"
                          value={card.name}
                          onChange={(event) =>
                            updateCard(card.id, "name", event.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                      </label>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {(
                          [
                            ["Balance ($)", "balance"],
                            ["Regular APR (%)", "apr"],
                            ["Minimum payment ($)", "minimum"],
                            ["Promotional APR (%)", "promoApr"],
                            ["Promo duration (months)", "promoMonths"],
                          ] as const
                        ).map(([label, field]) => (
                          <label key={field} className="block">
                            <span className="mb-1 block text-sm">{label}</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={card[field]}
                              onChange={(event) =>
                                updateCard(
                                  card.id,
                                  field,
                                  safeNumber(event.target.value),
                                )
                              }
                              className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addCard}
                  className="w-full rounded-xl border border-blue-700 px-4 py-3 font-semibold text-blue-700 hover:bg-blue-50"
                >
                  + Add another credit card
                </button>
              </>
            )}
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Your Debt Payoff Estimate</h2>

            <p className="mt-6 text-sm text-slate-500">
              Starting credit card debt
            </p>
            <p className="mt-1 text-4xl font-extrabold text-blue-700">
              {money(totalStartingBalance)}
            </p>

            {!results.paidOff && (
              <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                {results.insufficientPayment
                  ? "Your monthly payment is too low to cover the modeled minimums or reduce the debt. Increase your payment budget."
                  : "The debt was not fully paid within the 100-year calculation limit. Increase your monthly payment."}
              </div>
            )}

            <div className="mt-8 space-y-4">
              {[
                ["Total interest", results.totalInterest],
                ["Total payments", results.totalPaid],
                [
                  "Remaining balance",
                  results.schedule.length > 0
                    ? results.schedule[results.schedule.length - 1].balance
                    : results.paidOff
                      ? 0
                      : totalStartingBalance,
                ],
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

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Estimated payoff time</p>
              <p className="mt-1 text-xl font-bold">
                {results.paidOff
                  ? `${Math.floor(results.payoffMonths / 12)} years ${
                      results.payoffMonths % 12
                    } months`
                  : "Not achievable with current inputs"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              className="mt-7 w-full rounded-xl border border-blue-700 px-4 py-3 font-semibold text-blue-700 hover:bg-blue-50"
            >
              {showSchedule ? "Hide payoff schedule" : "View payoff schedule"}
            </button>

            {showSchedule && (
              <div className="mt-5 max-h-96 overflow-auto rounded-xl border">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="sticky top-0 bg-slate-100">
                    <tr>
                      <th className="p-3">Month</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Interest</th>
                      <th className="p-3">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.schedule.map((row) => (
                      <tr key={row.month} className="border-t">
                        <td className="p-3">{row.month}</td>
                        <td className="p-3">{money(row.payment)}</td>
                        <td className="p-3">{money(row.interest)}</td>
                        <td className="p-3">{money(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className="mt-7 text-xs leading-5 text-slate-500">
              Estimates assume fixed APRs outside promotional periods, monthly
              interest accrual, no new purchases, and fixed minimum payment
              amounts. Promotional APRs are treated as temporary rates, not
              deferred-interest offers. Actual card issuers may calculate
              interest daily and apply different minimum-payment rules and fees.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
