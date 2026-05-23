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

// Premium dark-theme category colors
const colors = ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e", "#06b6d4"];

export function SpendingAnalyticsCharts({ health, isLoading }: Props) {
  const cashFlow = health?.monthly_cash_flow ?? [];
  const categories = health?.category_distribution ?? [];

  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] p-5">
      
      {/* Cash Flow Trends */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 shadow-lg">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Monthly Behavior</p>
          <h2 className="mt-1 text-base font-bold text-white">Cash Flow Trends</h2>
        </div>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              <span className="animate-pulse">Loading cash flow trends...</span>
            </div>
          ) : cashFlow.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No cash flow metrics generated yet. Ingest statements to activate.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlow} margin={{ left: 6, right: 10, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis 
                  dataKey="month" 
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
                  contentStyle={{
                    backgroundColor: "#0d1220",
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="rgba(16, 185, 129, 0.08)" />
                <Area type="monotone" dataKey="expenses" stroke="#f59e0b" fill="rgba(245, 158, 11, 0.08)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Spending Mix */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 shadow-lg">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Categories</p>
          <h2 className="mt-1 text-base font-bold text-white">Spending Mix</h2>
        </div>
        <div className="h-[300px] flex items-center justify-center">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              <span className="animate-pulse">Loading categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500 text-center px-4">
              No category metrics generated yet. Ingest statements to activate.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="total_spent"
                  nameKey="category"
                  innerRadius={58}
                  outerRadius={90}
                  paddingAngle={3}
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
                  contentStyle={{
                    backgroundColor: "#0d1220",
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 shadow-lg xl:col-span-2">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Income vs Spending</p>
          <h2 className="mt-1 text-base font-bold text-white">Monthly Comparison</h2>
        </div>
        <div className="h-[260px]">
          {cashFlow.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500 text-center">
              Ingest multiple statements across months to compare cash flow history.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlow} margin={{ left: 6, right: 10, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis 
                  dataKey="month" 
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
                  contentStyle={{
                    backgroundColor: "#0d1220",
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}
