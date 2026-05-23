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
    <section className="bg-transparent border-0 p-0 shadow-none">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Financial Health</p>
          <h2 className="mt-1 text-lg font-bold text-white">Behavioral Indicators</h2>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Activity size={18} aria-hidden="true" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 bg-slate-900/30 border border-slate-800 p-5 rounded-xl">
        <div>
          <p className="text-4xl font-extrabold text-white">{isLoading ? "--" : health?.health_score ?? 0}</p>
          <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Health score out of 100</p>
        </div>
        <div className="relative h-16 w-16 rounded-full border-4 border-slate-800 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border-4 border-emerald-500 transition-all duration-1000"
            style={{ clipPath: `inset(${100 - (health?.health_score ?? 0)}% 0 0 0)` }}
          />
          <span className="text-xs font-bold text-slate-200 font-mono">{health?.health_score ?? 0}%</span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {indicators.map(([name, value]) => (
          <div key={name}>
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold capitalize text-slate-400">
              <span>{labelFromFeature(name)}</span>
              <span className="font-mono text-white">{formatPercent(value)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-slate-800">
              <div 
                className="h-2 rounded bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" 
                style={{ width: `${Math.min(100, value * 100)}%` }} 
              />
            </div>
          </div>
        ))}

        {!isLoading && indicators.length === 0 && (
          <div className="rounded-xl border border-slate-850 p-4 text-center">
            <p className="text-xs font-medium text-slate-400">Upload statement data above to generate indicators.</p>
          </div>
        )}
      </div>
    </section>
  );
}
