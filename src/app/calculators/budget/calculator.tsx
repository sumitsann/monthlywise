"use client";

import { useMemo, useState } from "react";

type Mode = "basic" | "advanced";
type Frequency = "monthly" | "weekly" | "biweekly" | "yearly";
type Category = "needs" | "wants" | "savings";

type BudgetItem = {
  id: number;
  name: string;
  amount: number;
  frequency: Frequency;
  category: Category;
};

const currency = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const monthlyValue = (amount: number, frequency: Frequency) => {
  switch (frequency) {
    case "weekly":
      return (amount * 52) / 12;
    case "biweekly":
      return (amount * 26) / 12;
    case "yearly":
      return amount / 12;
    default:
      return amount;
  }
};

const safeNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

const initialExpenses: BudgetItem[] = [
  {
    id: 1,
    name: "Rent / Mortgage",
    amount: 1800,
    frequency: "monthly",
    category: "needs",
  },
  {
    id: 2,
    name: "Utilities",
    amount: 250,
    frequency: "monthly",
    category: "needs",
  },
  {
    id: 3,
    name: "Groceries",
    amount: 600,
    frequency: "monthly",
    category: "needs",
  },
  {
    id: 4,
    name: "Transportation",
    amount: 450,
    frequency: "monthly",
    category: "needs",
  },
  {
    id: 5,
    name: "Insurance",
    amount: 250,
    frequency: "monthly",
    category: "needs",
  },
  {
    id: 6,
    name: "Debt Payments",
    amount: 300,
    frequency: "monthly",
    category: "needs",
  },
  {
    id: 7,
    name: "Dining Out",
    amount: 250,
    frequency: "monthly",
    category: "wants",
  },
  {
    id: 8,
    name: "Entertainment",
    amount: 150,
    frequency: "monthly",
    category: "wants",
  },
  {
    id: 9,
    name: "Shopping",
    amount: 200,
    frequency: "monthly",
    category: "wants",
  },
  {
    id: 10,
    name: "Emergency Savings",
    amount: 400,
    frequency: "monthly",
    category: "savings",
  },
  {
    id: 11,
    name: "Retirement Savings",
    amount: 300,
    frequency: "monthly",
    category: "savings",
  },
];

export default function BudgetCalculator() {
  const [mode, setMode] = useState<Mode>("basic");

  // Basic mode
  const [income, setIncome] = useState(6000);
  const [housing, setHousing] = useState(1800);
  const [transportation, setTransportation] = useState(450);
  const [groceries, setGroceries] = useState(600);
  const [utilities, setUtilities] = useState(250);
  const [debt, setDebt] = useState(300);
  const [other, setOther] = useState(600);
  const [savings, setSavings] = useState(700);

  // Advanced mode
  const [incomeSources, setIncomeSources] = useState<BudgetItem[]>([
    {
      id: 100,
      name: "Primary Salary (take-home)",
      amount: 5000,
      frequency: "monthly",
      category: "needs",
    },
    {
      id: 101,
      name: "Other Income",
      amount: 1000,
      frequency: "monthly",
      category: "needs",
    },
  ]);

  const [expenses, setExpenses] = useState<BudgetItem[]>(initialExpenses);
  const [nextId, setNextId] = useState(200);

  const results = useMemo(() => {
    if (mode === "basic") {
      const needs = housing + transportation + groceries + utilities + debt;
      const wants = other;
      const saved = savings;
      const total = needs + wants + saved;

      return {
        income,
        needs,
        wants,
        savings: saved,
        total,
        remaining: income - total,
      };
    }

    const totalIncome = incomeSources.reduce(
      (sum, item) => sum + monthlyValue(item.amount, item.frequency),
      0,
    );

    const totals = {
      needs: 0,
      wants: 0,
      savings: 0,
    };

    expenses.forEach((item) => {
      totals[item.category] += monthlyValue(item.amount, item.frequency);
    });

    const total = totals.needs + totals.wants + totals.savings;

    return {
      income: totalIncome,
      needs: totals.needs,
      wants: totals.wants,
      savings: totals.savings,
      total,
      remaining: totalIncome - total,
    };
  }, [
    mode,
    income,
    housing,
    transportation,
    groceries,
    utilities,
    debt,
    other,
    savings,
    incomeSources,
    expenses,
  ]);

  const percentages = {
    needs: results.income > 0 ? (results.needs / results.income) * 100 : 0,
    wants: results.income > 0 ? (results.wants / results.income) * 100 : 0,
    savings: results.income > 0 ? (results.savings / results.income) * 100 : 0,
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

  const updateItem = (
    list: BudgetItem[],
    setter: (items: BudgetItem[]) => void,
    id: number,
    changes: Partial<BudgetItem>,
  ) => {
    setter(
      list.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  };

  const addItem = (kind: "income" | "expense") => {
    const item: BudgetItem = {
      id: nextId,
      name: kind === "income" ? "New Income" : "New Expense",
      amount: 0,
      frequency: "monthly",
      category: "needs",
    };

    setNextId((current) => current + 1);

    if (kind === "income") {
      setIncomeSources((current) => [...current, item]);
    } else {
      setExpenses((current) => [...current, item]);
    }
  };

  const itemEditor = (item: BudgetItem, kind: "income" | "expense") => {
    const list = kind === "income" ? incomeSources : expenses;
    const setter = kind === "income" ? setIncomeSources : setExpenses;

    return (
      <div
        key={item.id}
        className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-2"
      >
        <label className="block">
          <span className="mb-1 block text-sm">Name</span>
          <input
            type="text"
            value={item.name}
            onChange={(event) =>
              updateItem(list, setter, item.id, {
                name: event.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm">Amount ($)</span>
          <input
            type="number"
            min="0"
            step="any"
            value={item.amount}
            onChange={(event) =>
              updateItem(list, setter, item.id, {
                amount: safeNumber(event.target.value),
              })
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm">Frequency</span>
          <select
            value={item.frequency}
            onChange={(event) =>
              updateItem(list, setter, item.id, {
                frequency: event.target.value as Frequency,
              })
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Every 2 weeks</option>
            <option value="yearly">Yearly</option>
          </select>
        </label>

        {kind === "expense" && (
          <label className="block">
            <span className="mb-1 block text-sm">Category</span>
            <select
              value={item.category}
              onChange={(event) =>
                updateItem(list, setter, item.id, {
                  category: event.target.value as Category,
                })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              <option value="needs">Needs</option>
              <option value="wants">Wants</option>
              <option value="savings">Savings / Debt Paydown</option>
            </select>
          </label>
        )}

        <button
          type="button"
          onClick={() => setter(list.filter((entry) => entry.id !== item.id))}
          className="text-left text-sm font-medium text-red-600 hover:underline"
        >
          Remove
        </button>
      </div>
    );
  };

  const summaryRow = (label: string, value: number) => (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-3">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold">{currency(value)}</span>
    </div>
  );

  return (
    <main className="bg-slate-50 px-4 pb-10 pt-4 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Household Budget Calculator
        </h1>

        <p className="mt-3 text-slate-600">
          Plan your monthly income, expenses, and savings with a detailed
          household budget breakdown.
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
            {mode === "basic" ? (
              <>
                <h2 className="text-xl font-bold">Monthly Budget</h2>

                {numberInput("Monthly take-home income ($)", income, setIncome)}
                {numberInput("Housing ($)", housing, setHousing)}
                {numberInput(
                  "Transportation ($)",
                  transportation,
                  setTransportation,
                )}
                {numberInput("Groceries ($)", groceries, setGroceries)}
                {numberInput("Utilities ($)", utilities, setUtilities)}
                {numberInput("Debt payments ($)", debt, setDebt)}
                {numberInput("Other expenses ($)", other, setOther)}
                {numberInput("Monthly savings ($)", savings, setSavings)}
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold">Income Sources</h2>

                <div className="space-y-4">
                  {incomeSources.map((item) => itemEditor(item, "income"))}
                </div>

                <button
                  type="button"
                  onClick={() => addItem("income")}
                  className="w-full rounded-xl border border-blue-700 px-4 py-3 font-semibold text-blue-700 hover:bg-blue-50"
                >
                  + Add income source
                </button>

                <h2 className="border-t border-slate-200 pt-6 text-xl font-bold">
                  Expenses & Savings
                </h2>

                <div className="space-y-4">
                  {expenses.map((item) => itemEditor(item, "expense"))}
                </div>

                <button
                  type="button"
                  onClick={() => addItem("expense")}
                  className="w-full rounded-xl border border-blue-700 px-4 py-3 font-semibold text-blue-700 hover:bg-blue-50"
                >
                  + Add expense or savings goal
                </button>
              </>
            )}
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Your Monthly Budget Summary</h2>

            <p className="mt-6 text-sm text-slate-500">
              Money remaining after planned spending and savings
            </p>

            <p
              className={`mt-1 text-4xl font-extrabold ${
                results.remaining >= 0 ? "text-green-700" : "text-red-600"
              }`}
            >
              {currency(results.remaining)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {results.remaining >= 0
                ? "Your planned budget is within your income."
                : "Your planned spending and savings exceed your income."}
            </p>

            <div className="mt-8">
              {summaryRow("Monthly income", results.income)}
              {summaryRow("Needs", results.needs)}
              {summaryRow("Wants", results.wants)}
              {summaryRow("Savings / planned debt paydown", results.savings)}
              {summaryRow("Total planned allocation", results.total)}
              {summaryRow("Unallocated income", results.remaining)}
            </div>

            <h3 className="mt-8 text-lg font-bold">
              50/30/20 Budget Comparison
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              A common guideline suggests using up to 50% of take-home income
              for needs, 30% for wants, and around 20% for savings and extra
              debt payments. Your priorities may differ.
            </p>

            <div className="mt-6 space-y-5">
              {(
                [
                  ["Needs", percentages.needs, 50, "bg-blue-600"],
                  ["Wants", percentages.wants, 30, "bg-amber-500"],
                  ["Savings", percentages.savings, 20, "bg-green-600"],
                ] as const
              ).map(([label, actual, target, color]) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span className="font-semibold">{label}</span>
                    <span>
                      {actual.toFixed(1)}% / {target}% guideline
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{
                        width: `${Math.min(100, actual)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl bg-slate-50 p-5">
              <h3 className="font-bold">Budget Health</h3>

              {results.income <= 0 ? (
                <p className="mt-2 text-sm text-slate-600">
                  Enter your income to see your budget analysis.
                </p>
              ) : results.remaining < 0 ? (
                <p className="mt-2 text-sm text-red-700">
                  Your planned budget has a deficit of{" "}
                  <strong>{currency(-results.remaining)}</strong> per month.
                  Review your expenses or savings allocations to balance it.
                </p>
              ) : (
                <p className="mt-2 text-sm text-green-700">
                  You have <strong>{currency(results.remaining)}</strong> left
                  to allocate each month.
                </p>
              )}
            </div>

            <p className="mt-7 text-xs leading-5 text-slate-500">
              Calculations use average monthly equivalents: weekly amounts × 52
              ÷ 12, biweekly amounts × 26 ÷ 12, and yearly amounts ÷ 12. Use
              take-home income for a more realistic budget. Savings are treated
              as planned allocations, not spending.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
