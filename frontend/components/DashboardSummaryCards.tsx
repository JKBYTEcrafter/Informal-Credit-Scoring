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
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Total expenses",
      value: summary ? formatCurrency(summary.total_expenses) : "--",
      icon: TrendingDown,
      accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Savings ratio",
      value: summary ? formatPercent(summary.savings_ratio) : "--",
      icon: PiggyBank,
      accent: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    },
    {
      label: "Transactions",
      value: summary ? summary.transaction_count.toLocaleString("en-IN") : "--",
      icon: ReceiptText,
      accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article 
            key={card.label} 
            className="rounded-xl border border-slate-800 bg-[#0d1220]/60 p-5 shadow-xl transition-all duration-300 hover:border-slate-700/60"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-400">{card.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${card.accent}`}>
                <Icon size={18} aria-hidden="true" />
              </div>
            </div>
            <p className="mt-4 min-h-8 text-2xl font-bold text-white">
              {isLoading ? (
                <span className="inline-block h-6 w-16 animate-pulse rounded bg-slate-800" />
              ) : (
                card.value
              )}
            </p>
          </article>
        );
      })}
    </section>
  );
}
