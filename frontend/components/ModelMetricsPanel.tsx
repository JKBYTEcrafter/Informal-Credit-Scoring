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
    <section className="border border-line bg-white p-5 shadow-soft">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-mint">MLOps</p>
          <h2 className="mt-1 text-lg font-semibold">Model evaluation</h2>
        </div>
        <ServerCog size={22} className="text-plum" aria-hidden="true" />
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        {rows.map((row) => (
          <div key={row} className="border border-line bg-paper p-3">
            <p className="text-xs capitalize text-slate-600">{row.replaceAll("_", " ")}</p>
            <p className="mt-2 text-lg font-semibold">
              {isLoading ? "--" : metricValue(modelMetrics[row])}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-slate-600">
        <p>{metrics?.model_name ?? "Heuristic Baseline"}</p>
        <p className="mt-1 truncate">{metrics?.model_version ?? "No model artifact"}</p>
      </div>
    </section>
  );
}
