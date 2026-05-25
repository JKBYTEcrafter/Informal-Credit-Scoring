import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { FraudExplainabilityResponse } from "@/utils/types";

export function FraudExplainabilityPanel({
  explainability,
  isLoading,
}: {
  explainability: FraudExplainabilityResponse | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="h-[400px] w-full animate-pulse rounded-xl bg-slate-800/30" />
    );
  }

  if (!explainability || explainability.feature_contributions.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-800/20">
        <p className="text-sm text-slate-500">Upload transactions to see fraud explanation</p>
      </div>
    );
  }

  // Build waterfall data
  // Base probability starts at explainability.base_probability
  let currentVal = explainability.base_probability * 100;
  
  const data = explainability.feature_contributions.map((feat) => {
    const start = currentVal;
    const contribution = feat.contribution * 100; // Assuming contribution is e.g. 0.05 for 5%
    const end = start + contribution;
    currentVal = end;
    
    return {
      ...feat,
      start,
      end,
      // For charting we need the difference as the bar height
      // Recharts standard bar doesn't do floating bars easily natively, 
      // but we can use stacked bars: 
      // bottom = min(start, end), size = abs(start - end)
      transparentBase: Math.min(start, end),
      barSize: Math.abs(end - start),
      isPositive: contribution > 0,
      percentage: contribution
    };
  });

  const getBarColor = (impact: string) => {
    switch (impact) {
      case "high_risk": return "#ef4444";
      case "medium_risk": return "#fb923c";
      default: return "#10b981";
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 1) { // payload[0] is transparent base, payload[1] is the bar
      const data = payload[1].payload;
      return (
        <div className="rounded-lg border border-slate-700 bg-[#0b0f1c] p-3 shadow-xl max-w-[250px]">
          <p className="text-sm font-bold text-white leading-tight mb-2">{data.readable_label}</p>
          <p className="text-xs text-slate-400 mb-3">{data.explanation}</p>
          
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Feature Value:</span>
              <span className="text-slate-300 font-medium">{data.feature_value.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-1 mt-1">
              <span className="text-slate-500">Score Impact:</span>
              <span className={`font-bold ${data.isPositive ? "text-red-400" : "text-emerald-400"}`}>
                {data.isPositive ? "+" : ""}{data.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6 p-4 rounded-xl border border-slate-800 bg-[#0d1220]/60">
        <div className="flex-1 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Base Probability</p>
          <p className="text-2xl font-black text-slate-300">{(explainability.base_probability * 100).toFixed(1)}%</p>
        </div>
        <div className="h-10 w-px bg-slate-800" />
        <div className="flex-1 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Final Probability</p>
          <p className={`text-2xl font-black ${explainability.fraud_probability > 0.6 ? "text-red-400" : "text-white"}`}>
            {(explainability.fraud_probability * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: -20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="readable_label" 
              stroke="#475569" 
              fontSize={10}
              interval={0}
              angle={-45}
              textAnchor="end"
              tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + "..." : val}
            />
            <YAxis 
              stroke="#475569" 
              fontSize={11}
              tickFormatter={(val) => `${val}%`}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1e293b", opacity: 0.4 }} />
            
            {/* Transparent base bar to push the colored bar up */}
            <Bar dataKey="transparentBase" stackId="a" fill="transparent" />
            
            {/* The actual contribution bar */}
            <Bar dataKey="barSize" stackId="a" radius={[2, 2, 2, 2]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.impact)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {explainability.anomaly_reasoning && explainability.anomaly_reasoning.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Model Reasoning</h4>
          <ul className="space-y-2">
            {explainability.anomaly_reasoning.map((reason, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="text-indigo-500">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
