import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { AnomalyAnalysisResponse } from "@/utils/types";

export function TransactionVelocityChart({
  analysis,
  isLoading,
}: {
  analysis: AnomalyAnalysisResponse | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="h-64 w-full animate-pulse rounded-xl bg-slate-800/30" />
    );
  }

  if (!analysis || analysis.anomaly_points.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-800/20">
        <p className="text-sm text-slate-500">No velocity data available</p>
      </div>
    );
  }

  const data = analysis.anomaly_points.map((p) => ({
    ...p,
    formattedDate: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-700 bg-[#0b0f1c] p-3 shadow-xl">
          <p className="mb-2 text-sm font-bold text-white">{label}</p>
          <div className="space-y-1">
            <p className="text-xs text-indigo-400">
              <span className="font-semibold text-slate-400">Transactions: </span>
              {data.transaction_count}
            </p>
            <p className="text-xs text-slate-300">
              <span className="font-semibold text-slate-400">Amount: </span>
              ${data.total_amount.toLocaleString()}
            </p>
            {data.is_anomalous && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                Anomaly Detected
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="formattedDate" 
            stroke="#475569" 
            fontSize={11} 
            tickMargin={10} 
            minTickGap={30}
          />
          <YAxis 
            stroke="#475569" 
            fontSize={11} 
            tickFormatter={(val) => Math.round(val).toString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="transaction_count"
            stroke="#6366f1"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#velocityGradient)"
            activeDot={{ r: 6, fill: "#818cf8", stroke: "#070a13", strokeWidth: 2 }}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              if (payload.is_anomalous) {
                return (
                  <circle cx={cx} cy={cy} r={4} fill="#ef4444" stroke="#070a13" strokeWidth={1} key={`dot-${payload.date}`} />
                );
              }
              return null as any;
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
