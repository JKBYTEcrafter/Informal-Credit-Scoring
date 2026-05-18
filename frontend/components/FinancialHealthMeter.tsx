"use client";

import { Activity } from "lucide-react";

import { formatPercent } from "@/utils/formatters";
import type { FinancialHealthResponse } from "@/utils/types";

type Props = {
  health: FinancialHealthResponse | null;
  isLoading: boolean;
};

function labelFromFeature(name: string) {
  return name.replaceAll("_", " ");
}

export function FinancialHealthMeter({ health, isLoading }: Props) {
  const indicators = Object.entries(health?.behavioral_indicators ?? {});

  return (
    <section className="border border-line bg-white p-5 shadow-soft">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-mint">Financial health</p>
          <h2 className="mt-1 text-lg font-semibold">Behavioral indicators</h2>
        </div>
        <Activity size={22} className="text-mint" aria-hidden="true" />
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-4xl font-semibold">{isLoading ? "--" : health?.health_score ?? 0}</p>
          <p className="mt-1 text-sm text-slate-600">Health score out of 100</p>
        </div>
        <div className="h-20 w-20 rounded-full border-8 border-paper">
          <div
            className="h-full rounded-full border-8 border-mint"
            style={{ clipPath: `inset(${100 - (health?.health_score ?? 0)}% 0 0 0)` }}
          />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {indicators.map(([name, value]) => (
          <div key={name}>
            <div className="mb-1 flex items-center justify-between text-xs capitalize text-slate-600">
              <span>{labelFromFeature(name)}</span>
              <span>{formatPercent(value)}</span>
            </div>
            <div className="h-2 bg-paper">
              <div className="h-2 bg-plum" style={{ width: `${Math.min(100, value * 100)}%` }} />
            </div>
          </div>
        ))}

        {!isLoading && indicators.length === 0 && (
          <p className="text-sm text-slate-600">Upload transactions to generate health metrics.</p>
        )}
      </div>
    </section>
  );
}
