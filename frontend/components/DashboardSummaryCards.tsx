"use client";

import { IndianRupee, PiggyBank, ReceiptText, TrendingDown } from "lucide-react";

import { formatCurrency, formatPercent } from "@/utils/formatters";
import type { DashboardSummary } from "@/utils/types";

type Props = {
  summary: DashboardSummary | null;
  isLoading: boolean;
};

export function DashboardSummaryCards({ summary, isLoading }: Props) {
  const cards = [
    {
      label: "Total income",
      value: summary ? formatCurrency(summary.total_income) : "--",
      icon: IndianRupee,
      accent: "text-mint",
    },
    {
      label: "Total expenses",
      value: summary ? formatCurrency(summary.total_expenses) : "--",
      icon: TrendingDown,
      accent: "text-saffron",
    },
    {
      label: "Savings ratio",
      value: summary ? formatPercent(summary.savings_ratio) : "--",
      icon: PiggyBank,
      accent: "text-plum",
    },
    {
      label: "Transactions",
      value: summary ? summary.transaction_count.toLocaleString("en-IN") : "--",
      icon: ReceiptText,
      accent: "text-ink",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.label} className="border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-600">{card.label}</p>
              <Icon className={card.accent} size={20} aria-hidden="true" />
            </div>
            <p className="mt-4 min-h-8 text-2xl font-semibold">
              {isLoading ? "Loading" : card.value}
            </p>
          </article>
        );
      })}
    </section>
  );
}
