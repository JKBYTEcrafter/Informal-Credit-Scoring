"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency, formatPercent } from "@/utils/formatters";
import type { FinancialHealthResponse } from "@/utils/types";

type Props = {
  health: FinancialHealthResponse | null;
  isLoading: boolean;
};

const colors = ["#0f9f8f", "#e6a012", "#6d4aff", "#17202a", "#64748b", "#ef4444"];

export function SpendingAnalyticsCharts({ health, isLoading }: Props) {
  const cashFlow = health?.monthly_cash_flow ?? [];
  const categories = health?.category_distribution ?? [];

  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="border border-line bg-white p-5 shadow-soft">
        <div className="mb-4">
          <p className="text-sm font-semibold uppercase text-mint">Monthly behavior</p>
          <h2 className="mt-1 text-lg font-semibold">Cash flow trends</h2>
        </div>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-600">
              Loading trends
            </div>
          ) : cashFlow.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-600">
              No monthly cash flow yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlow} margin={{ left: 6, right: 10, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="#e7ebf1" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Area type="monotone" dataKey="income" stroke="#0f9f8f" fill="#ccfbf1" />
                <Area type="monotone" dataKey="expenses" stroke="#e6a012" fill="#fef3c7" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="border border-line bg-white p-5 shadow-soft">
        <div className="mb-4">
          <p className="text-sm font-semibold uppercase text-mint">Categories</p>
          <h2 className="mt-1 text-lg font-semibold">Spending mix</h2>
        </div>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-600">
              Loading categories
            </div>
          ) : categories.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-600">
              No category data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="total_spent"
                  nameKey="category"
                  innerRadius={58}
                  outerRadius={94}
                  paddingAngle={2}
                >
                  {categories.map((entry, index) => (
                    <Cell key={entry.category} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, props) => [
                    formatCurrency(Number(value)),
                    `${props.payload.category} (${formatPercent(props.payload.ratio)})`,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="border border-line bg-white p-5 shadow-soft xl:col-span-2">
        <div className="mb-4">
          <p className="text-sm font-semibold uppercase text-mint">Income vs spending</p>
          <h2 className="mt-1 text-lg font-semibold">Monthly comparison</h2>
        </div>
        <div className="h-[260px]">
          {cashFlow.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-600">
              Upload more transactions to compare monthly flows.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlow} margin={{ left: 6, right: 10, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="#e7ebf1" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="income" fill="#0f9f8f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#e6a012" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}
