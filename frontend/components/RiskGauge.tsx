"use client";

import dynamic from "next/dynamic";

import type { CreditScoreResponse } from "@/utils/types";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[260px] items-center justify-center text-sm text-slate-600">
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
    <section className="border border-line bg-white p-5 shadow-soft">
      <div className="mb-3">
        <p className="text-sm font-semibold uppercase text-mint">Risk band</p>
        <h2 className="mt-1 text-lg font-semibold">Risk classification</h2>
      </div>

      {isLoading ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-slate-600">
          Loading risk gauge
        </div>
      ) : (
        <Plot
          data={[
            {
              type: "indicator",
              mode: "gauge+number",
              value,
              number: { font: { size: 36, color: "#17202a" } },
              gauge: {
                axis: { range: [300, 900], tickwidth: 0, tickcolor: "#d9dee8" },
                bar: { color: "#17202a", thickness: 0.18 },
                bgcolor: "white",
                borderwidth: 0,
                steps: [
                  { range: [300, 600], color: "#fee2e2" },
                  { range: [600, 750], color: "#fef3c7" },
                  { range: [750, 900], color: "#ccfbf1" },
                ],
                threshold: {
                  line: { color: "#6d4aff", width: 4 },
                  thickness: 0.75,
                  value,
                },
              },
            },
          ]}
          layout={{
            autosize: true,
            height: 260,
            margin: { t: 16, r: 12, b: 10, l: 12 },
            paper_bgcolor: "white",
            font: { family: "Inter, sans-serif", color: "#17202a" },
          }}
          config={{ displayModeBar: false, responsive: true }}
          className="h-[260px] w-full"
        />
      )}
    </section>
  );
}
