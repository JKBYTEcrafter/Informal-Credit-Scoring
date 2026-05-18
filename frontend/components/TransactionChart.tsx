"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/utils/formatters";
import type { DashboardSummary } from "@/utils/types";

type Props = {
  summary: DashboardSummary | null;
  isLoading: boolean;
};

export function TransactionChart({ summary, isLoading }: Props) {
  const data = [
    { name: "Income", value: summary?.total_income ?? 0, fill: "#0f9f8f" },
    { name: "Expenses", value: summary?.total_expenses ?? 0, fill: "#e6a012" },
  ];

  return (
    <section className="border border-line bg-white p-5 shadow-soft">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase text-mint">Cash flow</p>
        <h2 className="mt-1 text-lg font-semibold">Income and expenses</h2>
      </div>

      <div className="h-[280px] w-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-600">
            Loading chart
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 6, right: 6, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="#e7ebf1" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${Number(value) / 1000}k`}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                cursor={{ fill: "#f3f5f9" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
