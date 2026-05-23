"use client";

import {
  ArrowUpRight,
  Brain,
  Flame,
  Star,
  TrendingUp,
} from "lucide-react";
import type { AdvancedSummaryResponse } from "@/utils/types";

interface AdvancedSummaryBannerProps {
  summary: AdvancedSummaryResponse | null;
  isLoading?: boolean;
}

export function AdvancedSummaryBanner({
  summary,
  isLoading,
}: AdvancedSummaryBannerProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl bg-gradient-to-r from-slate-800/60 to-slate-800/40 p-6">
        <div className="flex gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-slate-700 rounded" />
              <div className="h-7 w-16 bg-slate-700 rounded" />
              <div className="h-3 w-24 bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const { credit_score, risk_level, health_report, spender_profile, risk_trend_direction, score_change_6m } = summary;

  const scoreColor =
    risk_level === "Low Risk"
      ? "#10b981"
      : risk_level === "Medium Risk"
      ? "#f59e0b"
      : "#ef4444";

  const trendIcon = risk_trend_direction === "Improving"
    ? <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
    : risk_trend_direction === "Declining"
    ? <TrendingUp className="h-3.5 w-3.5 text-red-400 rotate-180" />
    : <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />;

  const stats = [
    {
      icon: <Star className="h-4 w-4" style={{ color: scoreColor }} />,
      label: "Credit Score",
      value: credit_score.toFixed(0),
      sub: risk_level,
      subColor: scoreColor,
    },
    {
      icon: <Brain className="h-4 w-4 text-violet-400" />,
      label: "Health Score",
      value: health_report.health_score.toString(),
      sub: `${health_report.savings_discipline_score} savings`,
      subColor: "#8b5cf6",
    },
    {
      icon: <Flame className="h-4 w-4 text-amber-400" />,
      label: "Profile",
      value: spender_profile.profile_label.split(" ")[0],
      sub: spender_profile.profile_label,
      subColor: "#f59e0b",
    },
    {
      icon: trendIcon,
      label: "6-Month Trend",
      value: `${score_change_6m >= 0 ? "+" : ""}${score_change_6m.toFixed(0)}`,
      sub: risk_trend_direction,
      subColor:
        risk_trend_direction === "Improving"
          ? "#10b981"
          : risk_trend_direction === "Declining"
          ? "#ef4444"
          : "#94a3b8",
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/40 bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 shadow-2xl">
      {/* Headline */}
      <div className="border-b border-slate-700/40 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
          Sprint 3 · AI Intelligence Dashboard
        </p>
        <h2 className="mt-0.5 text-lg font-bold text-white">
          {summary.financial_story_headline}
        </h2>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-px bg-slate-700/20 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-900/60 px-5 py-4">
            <div className="mb-1.5 flex items-center gap-1.5">
              {stat.icon}
              <span className="text-xs text-slate-400">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs font-medium" style={{ color: stat.subColor }}>
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Top recommendation preview */}
      {summary.top_recommendations.length > 0 && (
        <div className="border-t border-slate-700/40 bg-slate-900/40 px-6 py-3">
          <div className="flex items-center gap-2">
            <span
              className="rounded px-2 py-0.5 text-[10px] font-semibold"
              style={{
                background:
                  summary.top_recommendations[0].priority === "High"
                    ? "rgba(239,68,68,0.2)"
                    : summary.top_recommendations[0].priority === "Medium"
                    ? "rgba(245,158,11,0.2)"
                    : "rgba(16,185,129,0.2)",
                color:
                  summary.top_recommendations[0].priority === "High"
                    ? "#ef4444"
                    : summary.top_recommendations[0].priority === "Medium"
                    ? "#f59e0b"
                    : "#10b981",
              }}
            >
              {summary.top_recommendations[0].priority} Priority
            </span>
            <p className="text-xs text-slate-400 line-clamp-1">
              {summary.top_recommendations[0].recommendation.slice(0, 100)}
              {summary.top_recommendations[0].recommendation.length > 100 ? "…" : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
