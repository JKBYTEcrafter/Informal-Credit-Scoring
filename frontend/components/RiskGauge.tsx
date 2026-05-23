"use client";

import dynamic from "next/dynamic";
import type { CreditScoreResponse } from "@/utils/types";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[260px] items-center justify-center text-sm text-slate-400">
      Loading risk gauge
    </div>
  ),
});

type Props = {
  creditScore: CreditScoreResponse | null;
  isLoading: boolean;
};

export function RiskGauge({ creditScore, isLoading }: Props) {
  const value = creditScore?.score ?? 300;

  return (
    <section className="bg-transparent border-0 p-0 shadow-none">
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Risk Band</p>
        <h2 className="mt-1 text-lg font-bold text-white">Risk Classification</h2>
      </div>

      {isLoading ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-slate-400">
          Loading risk gauge
        </div>
      ) : (
        <Plot
          data={[
            {
              type: "indicator",
              mode: "gauge+number",
              value,
              number: { font: { size: 36, color: "#ffffff", family: "Inter, sans-serif" } },
              gauge: {
                axis: { range: [300, 900], tickwidth: 0, tickcolor: "#475569" },
                bar: { color: "#6366f1", thickness: 0.18 },
                bgcolor: "#0f172a",
                borderwidth: 0,
                steps: [
                  { range: [300, 600], color: "rgba(239, 68, 68, 0.15)" },
                  { range: [600, 750], color: "rgba(245, 158, 11, 0.15)" },
                  { range: [750, 900], color: "rgba(16, 185, 129, 0.15)" },
                ],
                threshold: {
                  line: { color: "#818cf8", width: 4 },
                  thickness: 0.75,
                  value,
                },
              },
            },
          ]}
          layout={{
            autosize: true,
            height: 260,
            margin: { t: 24, r: 16, b: 16, l: 16 },
            paper_bgcolor: "transparent",
            font: { family: "Inter, sans-serif", color: "#f1f5f9" },
          }}
          config={{ displayModeBar: false, responsive: true }}
          className="h-[260px] w-full"
        />
      )}
    </section>
  );
}
