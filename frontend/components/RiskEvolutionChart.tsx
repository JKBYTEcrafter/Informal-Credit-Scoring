"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RiskTrendsResponse } from "@/utils/types";

interface RiskEvolutionChartProps {
  riskTrends: RiskTrendsResponse | null;
  isLoading?: boolean;
}

const TREND_COLORS = {
  Improving: "#10b981",
  Declining: "#ef4444",
  Stable: "#6366f1",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-xl">
      <p className="mb-2 text-xs font-semibold text-slate-400">{d?.month}</p>
      <p className="text-sm font-bold text-violet-400">Score: {d?.credit_score?.toFixed(0)}</p>
      <p className="text-xs text-emerald-400">Health: {d?.health_score}</p>
      <p className="text-xs text-slate-400 capitalize">{d?.risk_level}</p>
    </div>
  );
};

export function RiskEvolutionChart({ riskTrends, isLoading }: RiskEvolutionChartProps) {
  if (isLoading) {
    return (
      <div className="h-64 animate-pulse rounded-xl bg-slate-800/40" />
    );
  }

  if (!riskTrends || !riskTrends.trend_points.length) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 text-slate-500">
        <span className="text-3xl">📈</span>
        <p className="text-sm">Need multiple months of transactions for trend analysis</p>
      </div>
    );
  }

  const { trend_points, score_change_6m, trend_direction } = riskTrends;
  const trendColor = TREND_COLORS[trend_direction] ?? "#6366f1";

  return (
    <div className="space-y-4">
      {/* Trend summary */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className="rounded-lg px-2.5 py-1 text-xs font-semibold"
              style={{ background: `${trendColor}20`, color: trendColor }}
            >
              {trend_direction}
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: score_change_6m >= 0 ? "#10b981" : "#ef4444" }}
            >
              {score_change_6m >= 0 ? "+" : ""}
              {score_change_6m.toFixed(1)} pts over {trend_points.length} months
            </span>
          </div>
        </div>
        {riskTrends.best_month && (
          <span className="text-xs text-slate-500">
            Peak: <span className="text-emerald-400 font-medium">{riskTrends.best_month}</span>
          </span>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={trend_points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={trendColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[280, 920]}
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="credit_score"
            stroke={trendColor}
            strokeWidth={2.5}
            fill="url(#scoreGrad)"
            dot={{ fill: trendColor, r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: trendColor, fill: "#0f172a" }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Score range markers */}
      <div className="flex items-center gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-px w-4 border-t border-dashed border-emerald-500" />
          750+ Low Risk
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-px w-4 border-t border-dashed border-amber-500" />
          600+ Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-px w-4 border-t border-dashed border-red-500" />
          {"<"}600 High Risk
        </span>
      </div>
    </div>
  );
}
