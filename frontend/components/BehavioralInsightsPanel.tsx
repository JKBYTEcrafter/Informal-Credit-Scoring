"use client";

import { AlertTriangle, Info, Shield, Zap } from "lucide-react";
import type { BehavioralAnalysisResponse } from "@/utils/types";

interface BehavioralInsightsPanelProps {
  behavioral: BehavioralAnalysisResponse | null;
  isLoading?: boolean;
}

const SEVERITY_CONFIG = {
  Critical: {
    bg: "bg-red-500/10 border-red-500/30",
    text: "text-red-400",
    icon: AlertTriangle,
    badge: "bg-red-500/20 text-red-400",
  },
  Warning: {
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-400",
    icon: Zap,
    badge: "bg-amber-500/20 text-amber-400",
  },
  Info: {
    bg: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-400",
    icon: Info,
    badge: "bg-emerald-500/20 text-emerald-400",
  },
};

export function BehavioralInsightsPanel({
  behavioral,
  isLoading,
}: BehavioralInsightsPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-28 rounded-2xl bg-slate-800/60" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-800/40" />
        ))}
      </div>
    );
  }

  if (!behavioral) {
    return (
      <div className="flex h-40 items-center justify-center text-slate-500">
        <p className="text-sm">No behavioral data available</p>
      </div>
    );
  }

  const { spender_profile, insights, spending_patterns, category_risk_breakdown } = behavioral;

  const criticalCount = insights.filter((i) => i.severity === "Critical").length;
  const warningCount = insights.filter((i) => i.severity === "Warning").length;

  return (
    <div className="space-y-5">
      {/* Spender Profile Card */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-900/30 to-indigo-900/20 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-violet-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
            Spender Profile
          </span>
        </div>
        <h3 className="mb-2 text-xl font-bold text-white">{spender_profile.profile_label}</h3>
        <p className="mb-4 text-sm text-slate-300 leading-relaxed">
          {spender_profile.profile_description}
        </p>

        {/* Strengths & Risk Flags */}
        <div className="grid grid-cols-2 gap-3">
          {spender_profile.strengths.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-emerald-400">Strengths</p>
              <ul className="space-y-1">
                {spender_profile.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
                    <span className="mt-0.5 text-emerald-500">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {spender_profile.risk_flags.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-red-400">Risk Flags</p>
              <ul className="space-y-1">
                {spender_profile.risk_flags.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
                    <span className="mt-0.5 text-red-400">!</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Insight severity summary */}
      {(criticalCount > 0 || warningCount > 0) && (
        <div className="flex gap-3">
          {criticalCount > 0 && (
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-300">
                <strong>{criticalCount}</strong> Critical
              </span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2">
              <Zap className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
              <span className="text-xs text-amber-300">
                <strong>{warningCount}</strong> Warnings
              </span>
            </div>
          )}
        </div>
      )}

      {/* Behavioral insights list */}
      <div className="space-y-2.5">
        {insights.map((insight, i) => {
          const config = SEVERITY_CONFIG[insight.severity];
          const Icon = config.icon;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-xl border p-3.5 ${config.bg}`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${config.text}`} />
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${config.badge}`}>
                    {insight.severity}
                  </span>
                  <span className="text-xs font-medium text-slate-300">{insight.insight_type}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {insight.insight_description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key spending metrics */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Savings Rate",
            value: `${spending_patterns.savings_ratio_pct}%`,
            good: Number(spending_patterns.savings_ratio_pct) >= 15,
          },
          {
            label: "Spend/Income",
            value: `${spending_patterns.spending_to_income_pct}%`,
            good: Number(spending_patterns.spending_to_income_pct) <= 80,
          },
          {
            label: "Weekend Spend",
            value: `${spending_patterns.weekend_spending_pct}%`,
            good: Number(spending_patterns.weekend_spending_pct) <= 35,
          },
          {
            label: "High-Risk %",
            value: `${spending_patterns.high_risk_pct}%`,
            good: Number(spending_patterns.high_risk_pct) <= 10,
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl bg-slate-800/50 border border-slate-700/40 px-3 py-2.5"
          >
            <p className="text-[10px] text-slate-500">{metric.label}</p>
            <p
              className="text-lg font-bold"
              style={{ color: metric.good ? "#10b981" : "#ef4444" }}
            >
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* Category risk breakdown */}
      {category_risk_breakdown.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Category Risk Breakdown
          </p>
          {category_risk_breakdown.slice(0, 5).map((cat) => (
            <div key={cat.category} className="flex items-center gap-3">
              <span
                className="w-14 rounded px-1.5 py-0.5 text-center text-[10px] font-semibold"
                style={{
                  background:
                    cat.risk_level === "High"
                      ? "rgba(239,68,68,0.15)"
                      : cat.risk_level === "Medium"
                      ? "rgba(245,158,11,0.15)"
                      : "rgba(16,185,129,0.15)",
                  color:
                    cat.risk_level === "High"
                      ? "#ef4444"
                      : cat.risk_level === "Medium"
                      ? "#f59e0b"
                      : "#10b981",
                }}
              >
                {cat.risk_level}
              </span>
              <span className="flex-1 text-xs capitalize text-slate-300">{cat.category}</span>
              <span className="text-xs text-slate-400">₹{cat.total_spent.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
