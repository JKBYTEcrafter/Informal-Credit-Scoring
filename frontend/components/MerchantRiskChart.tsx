import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { BehavioralRiskResponse } from "@/utils/types";

export function MerchantRiskChart({
  behavioralRisk,
  isLoading,
}: {
  behavioralRisk: BehavioralRiskResponse | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="h-[400px] w-full animate-pulse rounded-xl bg-slate-800/30" />
    );
  }

  if (!behavioralRisk || behavioralRisk.indicators.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-800/20">
        <p className="text-sm text-slate-500">No risk indicators available</p>
      </div>
    );
  }

  const data = [...behavioralRisk.indicators]
    .sort((a, b) => b.score - a.score)
    .map(indicator => ({
      ...indicator,
      percentage: Math.round(indicator.score * 100)
    }));

  const getBarColor = (level: string) => {
    switch (level) {
      case "Critical": return "#ef4444";
      case "High": return "#f97316";
      case "Medium": return "#facc15";
      default: return "#10b981";
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const color = getBarColor(data.risk_level);
      
      return (
        <div className="rounded-lg border border-slate-700 bg-[#0b0f1c] p-3 shadow-xl max-w-[250px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <p className="text-sm font-bold text-white leading-tight">{data.readable_label}</p>
          </div>
          <p className="text-xs text-slate-400 mb-2">{data.description}</p>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Risk Score:</span>
            <span className="font-bold text-white">{data.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis 
            type="number" 
            domain={[0, 100]} 
            stroke="#475569" 
            fontSize={11}
            tickFormatter={(val) => `${val}%`}
          />
          <YAxis 
            dataKey="readable_label" 
            type="category" 
            stroke="#94a3b8" 
            fontSize={11}
            width={120}
            tickFormatter={(val) => val.length > 20 ? val.substring(0, 17) + "..." : val}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1e293b", opacity: 0.4 }} />
          <Bar
            dataKey="percentage"
            radius={[0, 4, 4, 0]}
            barSize={24}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.risk_level)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
