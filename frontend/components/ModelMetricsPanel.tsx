"use client";

import { ServerCog } from "lucide-react";
import type { ModelMetricsResponse } from "@/utils/types";

type Props = {
  metrics: ModelMetricsResponse | null;
  isLoading: boolean;
};

function metricValue(value: unknown) {
  return typeof value === "number" ? value.toFixed(3) : "--";
}

export function ModelMetricsPanel({ metrics, isLoading }: Props) {
  const modelMetrics = metrics?.metrics ?? {};
  const rows = ["accuracy", "precision", "recall", "f1_score", "roc_auc"];

  return (
    <section className="bg-transparent border-0 p-0 shadow-none">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">MLOps Engine</p>
          <h2 className="mt-1 text-lg font-bold text-white">Model Evaluation</h2>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <ServerCog size={18} aria-hidden="true" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        {rows.map((row) => (
          <div 
            key={row} 
            className="border border-slate-800 bg-[#0d1220]/40 p-4 rounded-xl shadow-md text-center transition-all duration-200 hover:border-slate-700/40"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{row.replaceAll("_", " ")}</p>
            <p className="mt-2 text-xl font-bold text-white font-mono">
              {isLoading ? "--" : metricValue(modelMetrics[row])}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-slate-850 pt-4 text-xs text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span>Active In-Memory Model:</span>
          <span className="font-semibold text-slate-200">{metrics?.model_name ?? "Heuristic Baseline"}</span>
        </div>
        <div className="flex justify-between">
          <span>Version Identifier:</span>
          <span className="font-mono text-slate-300 truncate max-w-[200px]" title={metrics?.model_version ?? ""}>
            {metrics?.model_version ?? "No model artifact"}
          </span>
        </div>
      </div>
    </section>
  );
}
