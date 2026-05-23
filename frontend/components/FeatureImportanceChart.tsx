"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FeatureImportanceItem } from "@/utils/types";

type Props = {
  importance: FeatureImportanceItem[];
  isLoading: boolean;
};

export function FeatureImportanceChart({ importance, isLoading }: Props) {
  const data = importance.slice(0, 8).map((item) => ({
    ...item,
    importance_percent: Math.round(item.importance * 1000) / 10,
    clean_label: item.feature.replaceAll("_", " "),
  }));

  return (
    <section className="bg-transparent border-0 p-0 shadow-none">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Global Explainability</p>
        <h2 className="mt-1 text-lg font-bold text-white">Feature Importance</h2>
      </div>
      <div className="h-[320px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400 animate-pulse">
            Loading global importance metrics...
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500 text-center">
            Upload transaction statements to calculate model feature weights.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 18, top: 8, bottom: 8 }}>
              <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" horizontal={false} />
              <XAxis type="number" domain={[0, "dataMax"]} hide />
              <YAxis
                dataKey="clean_label"
                type="category"
                width={130}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 500 }}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, "Importance Weight"]}
                contentStyle={{
                  backgroundColor: "#0d1220",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="importance_percent" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
