"use client";

import { BrainCircuit, TrendingUp } from "lucide-react";
import type { CreditScoreResponse } from "@/utils/types";

type Props = {
  creditScore: CreditScoreResponse | null;
  isLoading: boolean;
};

const riskStyles = {
  "Low Risk": "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400",
  "Medium Risk": "bg-amber-500/10 border border-amber-500/30 text-amber-400",
  "High Risk": "bg-red-500/10 border border-red-500/30 text-red-400",
};

export function CreditScoreCard({ creditScore, isLoading }: Props) {
  const breakdown = creditScore?.score_breakdown;
  const rows = [
    { label: "ML prediction", value: breakdown?.ml_prediction },
    { label: "Behavioral score", value: breakdown?.behavioral_score },
    { label: "Financial health", value: breakdown?.financial_health_score },
  ] as const;

  return (
    <section className="bg-transparent border-0 p-0 shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Credit Intelligence</p>
          <h2 className="mt-1 text-lg font-bold text-white">Alternative Credit Score</h2>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <BrainCircuit size={18} aria-hidden="true" />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-5xl font-extrabold tracking-tight text-white">
            {isLoading ? (
              <span className="inline-block h-12 w-24 animate-pulse rounded bg-slate-800" />
            ) : (
              Math.round(creditScore?.score ?? 300)
            )}
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Score range 300-900</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg ${
            creditScore ? riskStyles[creditScore.risk_level] : "bg-slate-800 text-slate-400"
          }`}
        >
          <TrendingUp size={14} aria-hidden="true" />
          {creditScore?.risk_level ?? "Awaiting statement"}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {rows.map((row) => {
          const width = row.value ? `${Math.max(0, Math.min(100, ((row.value - 300) / 600) * 100))}%` : "0%";
          return (
            <div key={row.label}>
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>{row.label}</span>
                <span className="font-mono text-white">{row.value ? Math.round(row.value) : "--"}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded bg-slate-800">
                <div 
                  className="h-2 rounded bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" 
                  style={{ width }} 
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-slate-800/80 pt-4 text-xs text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span>Engine Model:</span>
          <span className="font-semibold text-slate-200">{creditScore?.model_name ?? "Heuristic Baseline"}</span>
        </div>
        <div className="flex justify-between">
          <span>Version Tag:</span>
          <span className="font-mono text-slate-300 truncate max-w-[200px]" title={creditScore?.model_version ?? ""}>
            {creditScore?.model_version ?? "heuristics-v1.0"}
          </span>
        </div>
      </div>
    </section>
  );
}
