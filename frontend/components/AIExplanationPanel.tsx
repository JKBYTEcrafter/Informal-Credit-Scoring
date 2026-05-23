"use client";

import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { ExplanationItem, RiskAnalysisResponse } from "@/utils/types";

type Props = {
  riskAnalysis: RiskAnalysisResponse | null;
  explanations: ExplanationItem[];
  isLoading: boolean;
};

function iconForImpact(impact: ExplanationItem["impact"]) {
  if (impact === "positive") {
    return CheckCircle2;
  }
  if (impact === "negative") {
    return AlertTriangle;
  }
  return Info;
}

export function AIExplanationPanel({ riskAnalysis, explanations, isLoading }: Props) {
  return (
    <section className="bg-transparent border-0 p-0 shadow-none">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">AI Explanation</p>
        <h2 className="mt-1 text-lg font-bold text-white">Why this score was generated</h2>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading explanations...</p>
      ) : explanations.length === 0 ? (
        <div className="rounded-xl border border-slate-800/60 bg-[#0d1220]/40 p-6 text-center">
          <p className="text-sm text-slate-400">Upload transaction statements below to run our explainable AI algorithms and view feature contributions.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {explanations.map((item) => {
            const Icon = iconForImpact(item.impact);
            return (
              <div 
                key={`${item.feature}-${item.message}`} 
                className="flex gap-3 rounded-xl border border-slate-800 bg-slate-900/30 p-4 transition-all duration-300 hover:border-slate-700/40"
              >
                <Icon
                  size={18}
                  className={
                    item.impact === "positive"
                      ? "mt-0.5 shrink-0 text-emerald-400"
                      : item.impact === "negative"
                        ? "mt-0.5 shrink-0 text-red-400"
                        : "mt-0.5 shrink-0 text-slate-400"
                  }
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-200">{item.message}</p>
                  <p className="mt-1 text-xs capitalize text-slate-500 font-mono">
                    {item.feature.replaceAll("_", " ")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {riskAnalysis && (
        <div className="mt-5 border-t border-slate-850 pt-4 text-sm text-slate-400 flex justify-between items-center">
          <span>Target Risk Band:</span>
          <span className="font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-xs">
            {riskAnalysis.band}
          </span>
        </div>
      )}
    </section>
  );
}
