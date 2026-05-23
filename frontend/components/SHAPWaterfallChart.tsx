"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SHAPValue } from "@/utils/types";

interface SHAPWaterfallChartProps {
  shapValues: SHAPValue[];
  baseScore: number;
  finalScore: number;
  isLoading?: boolean;
}

interface WaterfallBar {
  label: string;
  base: number;
  value: number;
  impact: "positive" | "negative" | "neutral";
  shapValue: number;
  fill: string;
}

export function SHAPWaterfallChart({
  shapValues,
  baseScore,
  finalScore,
  isLoading,
}: SHAPWaterfallChartProps) {
  const bars: WaterfallBar[] = useMemo(() => {
    if (!shapValues?.length) return [];
    const result: WaterfallBar[] = [];
    let running = baseScore;

    // Only top 7 features for clarity
    const top = shapValues.slice(0, 7);
    for (const sv of top) {
      const val = sv.shap_value;
      const label = sv.readable_label.length > 20
        ? sv.readable_label.slice(0, 20) + "…"
        : sv.readable_label;

      result.push({
        label,
        base: val >= 0 ? running : running + val,
        value: Math.abs(val),
        impact: sv.impact,
        shapValue: val,
        fill:
          sv.impact === "positive"
            ? "#10b981"
            : sv.impact === "negative"
            ? "#ef4444"
            : "#94a3b8",
      });
      running += val;
    }
    return result;
  }, [shapValues, baseScore]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const bar = payload[0].payload as WaterfallBar;
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 shadow-2xl">
        <p className="mb-1 text-xs font-semibold text-slate-400">{bar.label}</p>
        <p
          className="text-base font-bold"
          style={{ color: bar.fill }}
        >
          {bar.shapValue >= 0 ? "+" : ""}
          {bar.shapValue.toFixed(1)} pts
        </p>
        <p className="text-xs text-slate-400 capitalize">{bar.impact} impact</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!bars.length) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-500">
        <span className="text-2xl">📊</span>
        <p className="text-sm">Upload transactions to see SHAP analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Score endpoints */}
      <div className="flex items-center justify-between rounded-xl bg-slate-800/60 px-4 py-3">
        <div>
          <p className="text-xs text-slate-400">Expected Score</p>
          <p className="text-xl font-bold text-slate-300">{baseScore}</p>
        </div>
        <div className="flex-1 mx-4 h-px bg-gradient-to-r from-slate-600 via-violet-500 to-slate-600" />
        <div className="text-right">
          <p className="text-xs text-slate-400">Your Score</p>
          <p
            className="text-xl font-bold"
            style={{ color: finalScore >= 750 ? "#10b981" : finalScore >= 600 ? "#f59e0b" : "#ef4444" }}
          >
            {finalScore.toFixed(0)}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={bars} barSize={28} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            angle={-30}
            textAnchor="end"
            interval={0}
            height={56}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={["dataMin - 20", "dataMax + 20"]} />
          <Tooltip content={<CustomTooltip />} />
          {/* Transparent base */}
          <Bar dataKey="base" stackId="a" fill="transparent" />
          {/* Actual contribution bars */}
          <Bar dataKey="value" stackId="a" radius={[4, 4, 0, 0]}>
            {bars.map((bar, i) => (
              <Cell key={i} fill={bar.fill} fillOpacity={0.9} />
            ))}
          </Bar>
          <ReferenceLine y={baseScore} stroke="#6366f1" strokeDasharray="4 4" strokeWidth={1.5} />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          Positive factor
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500" />
          Negative factor
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-px w-5 border-t-2 border-dashed border-indigo-400" />
          Expected baseline
        </span>
      </div>
    </div>
  );
}
