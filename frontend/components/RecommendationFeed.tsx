"use client";

import { AlertTriangle, CheckCircle2, Info, Lightbulb, TrendingUp } from "lucide-react";
import type { RecommendationItem } from "@/utils/types";

interface RecommendationFeedProps {
  recommendations: RecommendationItem[];
  highPriorityCount: number;
  isLoading?: boolean;
}

const PRIORITY_CONFIG = {
  High: {
    badge: "bg-red-500/20 text-red-400 border border-red-500/30",
    icon: AlertTriangle,
    iconColor: "text-red-400",
    dot: "bg-red-500",
    bar: "from-red-500/60 to-red-500/20",
  },
  Medium: {
    badge: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    icon: TrendingUp,
    iconColor: "text-amber-400",
    dot: "bg-amber-500",
    bar: "from-amber-500/60 to-amber-500/20",
  },
  Low: {
    badge: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    icon: Lightbulb,
    iconColor: "text-emerald-400",
    dot: "bg-emerald-500",
    bar: "from-emerald-500/60 to-emerald-500/20",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  savings: "Savings",
  risk_spending: "Risk Spending",
  budgeting: "Budgeting",
  income: "Income",
  cash_flow: "Cash Flow",
  spending_patterns: "Spending",
  behavioral: "Behavior",
  transaction_patterns: "Transactions",
  credit_strategy: "Credit Strategy",
  general: "General",
};

function SkeletonRec() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 space-y-2">
      <div className="h-3 w-16 bg-slate-700 rounded" />
      <div className="h-3 w-full bg-slate-700 rounded" />
      <div className="h-3 w-4/5 bg-slate-700 rounded" />
    </div>
  );
}

export function RecommendationFeed({
  recommendations,
  highPriorityCount,
  isLoading,
}: RecommendationFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonRec key={i} />)}
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-3 text-slate-500">
        <CheckCircle2 className="h-10 w-10 text-emerald-500/40" />
        <p className="text-sm">No recommendations yet — upload transactions first</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary banner */}
      {highPriorityCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-400" />
          <p className="text-sm text-red-300">
            <span className="font-semibold">{highPriorityCount} high-priority</span> action
            {highPriorityCount > 1 ? "s" : ""} require your attention
          </p>
        </div>
      )}

      {/* Recommendation list */}
      <div className="space-y-3">
        {recommendations.map((rec, idx) => {
          const config = PRIORITY_CONFIG[rec.priority];
          const Icon = config.icon;
          return (
            <div
              key={rec.id ?? idx}
              className="group relative overflow-hidden rounded-xl border border-slate-700/40 bg-slate-800/50 p-4 transition-all duration-200 hover:border-slate-600/60 hover:bg-slate-800/80"
            >
              {/* Left priority stripe */}
              <div className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl bg-gradient-to-b ${config.bar}`} />

              <div className="flex items-start gap-3 pl-2">
                <div className={`mt-0.5 flex-shrink-0 ${config.iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${config.badge}`}>
                      {rec.priority}
                    </span>
                    <span className="rounded-md bg-slate-700/60 px-2 py-0.5 text-[10px] text-slate-400">
                      {CATEGORY_LABELS[rec.category] ?? rec.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{rec.recommendation}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer tip */}
      <div className="flex items-start gap-2 rounded-xl bg-slate-800/30 px-3 py-2.5">
        <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
        <p className="text-xs text-slate-500">
          Recommendations refresh automatically each time you upload new transactions.
        </p>
      </div>
    </div>
  );
}
