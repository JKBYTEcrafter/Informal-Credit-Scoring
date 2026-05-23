"use client";

import type { FinancialHealthReportResponse } from "@/utils/types";

interface FinancialHealthRadarProps {
  healthReport: FinancialHealthReportResponse | null;
  isLoading?: boolean;
}

const DIMENSION_COLORS = [
  "#10b981", // emerald — income reliability
  "#6366f1", // indigo — savings discipline
  "#f59e0b", // amber — expense management
  "#3b82f6", // blue — cash flow health
  "#8b5cf6", // violet — stability
  "#06b6d4", // cyan — volatility control
];

function RadialProgress({
  score,
  label,
  color,
  description,
}: {
  score: number;
  label: string;
  color: string;
  description: string;
}) {
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="group flex flex-col items-center gap-2">
      <div className="relative" title={description}>
        <svg width={88} height={88} className="-rotate-90">
          {/* Track */}
          <circle cx={44} cy={44} r={r} fill="none" stroke="#1e293b" strokeWidth={8} />
          {/* Progress */}
          <circle
            cx={44}
            cy={44}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{score}</span>
        </div>
      </div>
      <p className="text-center text-xs font-medium text-slate-300 leading-tight max-w-[80px]">{label}</p>
      <p className="text-center text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity max-w-[90px] leading-tight">
        {description}
      </p>
    </div>
  );
}

export function FinancialHealthRadar({
  healthReport,
  isLoading,
}: FinancialHealthRadarProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-6 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-[88px] w-[88px] animate-pulse rounded-full bg-slate-800" />
            <div className="h-3 w-16 animate-pulse rounded bg-slate-800" />
          </div>
        ))}
      </div>
    );
  }

  if (!healthReport) {
    return (
      <div className="flex h-48 items-center justify-center text-slate-500">
        <p className="text-sm">No health data available</p>
      </div>
    );
  }

  const { dimensions, health_score, percentile_benchmarks } = healthReport;

  const overallColor =
    health_score >= 70 ? "#10b981" : health_score >= 45 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-6">
      {/* Overall health badge */}
      <div className="flex items-center gap-4 rounded-2xl bg-slate-800/60 p-4">
        <div className="relative flex-shrink-0">
          <svg width={72} height={72} className="-rotate-90">
            <circle cx={36} cy={36} r={28} fill="none" stroke="#1e293b" strokeWidth={7} />
            <circle
              cx={36}
              cy={36}
              r={28}
              fill="none"
              stroke={overallColor}
              strokeWidth={7}
              strokeDasharray={2 * Math.PI * 28}
              strokeDashoffset={2 * Math.PI * 28 - (health_score / 100) * 2 * Math.PI * 28}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-white">{health_score}</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Overall Financial Health</p>
          <p className="text-xs text-slate-400">
            Better than{" "}
            <span style={{ color: overallColor }} className="font-semibold">
              {percentile_benchmarks.overall_health?.toFixed(0) ?? "—"}%
            </span>{" "}
            of users
          </p>
          <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] text-slate-400">
            <span>Savings: top {100 - (percentile_benchmarks.savings_ratio ?? 50)}%</span>
            <span>Cash flow: top {100 - (percentile_benchmarks.cash_flow_consistency ?? 50)}%</span>
          </div>
        </div>
      </div>

      {/* Dimension radials */}
      <div className="grid grid-cols-3 gap-4">
        {dimensions.map((dim, i) => (
          <RadialProgress
            key={dim.label}
            score={dim.score}
            label={dim.label}
            color={DIMENSION_COLORS[i] ?? "#94a3b8"}
            description={dim.description}
          />
        ))}
      </div>

      {/* Percentile bar */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Population Benchmarks
        </p>
        {Object.entries(percentile_benchmarks)
          .filter(([k]) => k !== "overall_health")
          .map(([key, pct]) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span className="capitalize">{key.replace(/_/g, " ")}</span>
                <span className="font-medium text-slate-300">
                  {pct.toFixed(0)}th percentile
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${pct}%`,
                    backgroundColor:
                      pct >= 70 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
