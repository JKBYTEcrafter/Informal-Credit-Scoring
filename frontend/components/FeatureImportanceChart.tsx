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
  }));

  return (
    <section className="border border-line bg-white p-5 shadow-soft">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase text-mint">Explainability</p>
        <h2 className="mt-1 text-lg font-semibold">Feature importance</h2>
      </div>
      <div className="h-[320px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-600">
            Loading importance
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-600">
            No importance data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 18, top: 8, bottom: 8 }}>
              <CartesianGrid stroke="#e7ebf1" horizontal={false} />
              <XAxis type="number" domain={[0, "dataMax"]} hide />
              <YAxis
                dataKey="feature"
                type="category"
                width={150}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => [`${value}%`, "Importance"]} />
              <Bar dataKey="importance_percent" fill="#6d4aff" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
