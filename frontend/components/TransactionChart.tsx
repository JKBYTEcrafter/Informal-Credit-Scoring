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
    { name: "Income", value: summary?.total_income ?? 0, fill: "#10b981" },
    { name: "Expenses", value: summary?.total_expenses ?? 0, fill: "#f59e0b" },
  ];

  return (
    <section className="bg-transparent border-0 p-0 shadow-none">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Cash Flow</p>
        <h2 className="mt-1 text-lg font-bold text-white">Inflow vs Outflow</h2>
      </div>

      <div className="h-[280px] w-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            <span className="animate-pulse">Loading cash flow analytics...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 6, right: 6, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
                contentStyle={{
                  backgroundColor: "#0d1220",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
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
