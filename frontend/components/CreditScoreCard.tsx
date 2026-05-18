"use client";

import { BrainCircuit, TrendingUp } from "lucide-react";

import type { CreditScoreResponse } from "@/utils/types";

type Props = {
  creditScore: CreditScoreResponse | null;
  isLoading: boolean;
};

const riskStyles = {
  "Low Risk": "bg-mint text-white",
  "Medium Risk": "bg-saffron text-ink",
  "High Risk": "bg-red-600 text-white",
};

export function CreditScoreCard({ creditScore, isLoading }: Props) {
  const breakdown = creditScore?.score_breakdown;
  const rows = [
    ["ML prediction", breakdown?.ml_prediction],
    ["Behavioral score", breakdown?.behavioral_score],
    ["Financial health", breakdown?.financial_health_score],
  ] as const;

  return (
    <section className="border border-line bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-mint">Credit intelligence</p>
          <h2 className="mt-1 text-lg font-semibold">Alternative credit score</h2>
        </div>
        <BrainCircuit size={22} className="text-plum" aria-hidden="true" />
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-5xl font-semibold tracking-normal">
            {isLoading ? "--" : Math.round(creditScore?.score ?? 300)}
          </p>
          <p className="mt-2 text-sm text-slate-600">Score range 300-900</p>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-2 px-3 py-2 text-sm font-semibold ${
            creditScore ? riskStyles[creditScore.risk_level] : "bg-paper text-slate-600"
          }`}
        >
          <TrendingUp size={16} aria-hidden="true" />
          {creditScore?.risk_level ?? "Awaiting score"}
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {rows.map(([label, value]) => {
          const width = value ? `${Math.max(0, Math.min(100, ((value - 300) / 600) * 100))}%` : "0%";
          return (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span>{label}</span>
                <span>{value ? Math.round(value) : "--"}</span>
              </div>
              <div className="h-2 bg-paper">
                <div className="h-2 bg-mint" style={{ width }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 border-t border-line pt-4 text-xs text-slate-600">
        <p>{creditScore?.model_name ?? "Heuristic Baseline"}</p>
        <p className="mt-1 truncate">{creditScore?.model_version ?? "No trained model yet"}</p>
      </div>
    </section>
  );
}
