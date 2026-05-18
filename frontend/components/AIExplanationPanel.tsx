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
    <section className="border border-line bg-white p-5 shadow-soft">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase text-mint">AI explanation</p>
        <h2 className="mt-1 text-lg font-semibold">Why this score was generated</h2>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-600">Loading explanations</p>
      ) : explanations.length === 0 ? (
        <p className="text-sm text-slate-600">Upload transactions to generate explanations.</p>
      ) : (
        <div className="space-y-3">
          {explanations.map((item) => {
            const Icon = iconForImpact(item.impact);
            return (
              <div key={`${item.feature}-${item.message}`} className="flex gap-3 border border-line p-3">
                <Icon
                  size={18}
                  className={
                    item.impact === "positive"
                      ? "mt-0.5 shrink-0 text-mint"
                      : item.impact === "negative"
                        ? "mt-0.5 shrink-0 text-red-600"
                        : "mt-0.5 shrink-0 text-slate-500"
                  }
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium">{item.message}</p>
                  <p className="mt-1 text-xs capitalize text-slate-600">
                    {item.feature.replaceAll("_", " ")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {riskAnalysis && (
        <div className="mt-5 border-t border-line pt-4 text-sm text-slate-600">
          <p>
            Risk band <span className="font-semibold text-ink">{riskAnalysis.band}</span>
          </p>
        </div>
      )}
    </section>
  );
}
