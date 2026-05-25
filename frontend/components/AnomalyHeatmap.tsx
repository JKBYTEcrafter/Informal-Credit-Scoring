import { useMemo } from "react";
import type { AnomalyAnalysisResponse, AnomalyDataPoint } from "@/utils/types";

export function AnomalyHeatmap({
  analysis,
  isLoading,
}: {
  analysis: AnomalyAnalysisResponse | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8 animate-pulse">
        <div className="flex gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="h-3 w-3 rounded-sm bg-slate-800" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analysis || analysis.anomaly_points.length === 0) {
    return (
      <div className="p-12 text-center border border-slate-800 border-dashed rounded-xl bg-slate-900/20">
        <p className="text-slate-400">Upload transactions to see anomaly patterns.</p>
      </div>
    );
  }

  // Simple grid construction for the last N days
  // Group by week, 7 days a column
  const weeks = [];
  const points = [...analysis.anomaly_points];
  
  // Ensure points are sorted by date
  points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Pick the last 90 days roughly (or use whatever is there up to 12 weeks)
  const displayPoints = points.slice(-84); // 12 weeks * 7 days
  
  // Pad the start if needed to make full columns
  const remainder = displayPoints.length % 7;
  if (remainder !== 0) {
    const padCount = 7 - remainder;
    for (let i = 0; i < padCount; i++) {
      displayPoints.unshift(null as unknown as AnomalyDataPoint);
    }
  }

  for (let i = 0; i < displayPoints.length; i += 7) {
    weeks.push(displayPoints.slice(i, i + 7));
  }

  const getColor = (score: number) => {
    if (score < 0.2) return "bg-emerald-900/40";
    if (score < 0.4) return "bg-emerald-600/60";
    if (score < 0.6) return "bg-yellow-500/60";
    if (score < 0.8) return "bg-orange-500/80";
    return "bg-red-500";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-start gap-2 overflow-x-auto pb-4 custom-scrollbar max-w-full">
        {/* Day Labels */}
        <div className="flex flex-col gap-1 mt-6 text-[10px] font-semibold text-slate-500 pr-2">
          <div className="h-3 leading-3">Mon</div>
          <div className="h-3 leading-3 opacity-0">Tue</div>
          <div className="h-3 leading-3">Wed</div>
          <div className="h-3 leading-3 opacity-0">Thu</div>
          <div className="h-3 leading-3">Fri</div>
          <div className="h-3 leading-3 opacity-0">Sat</div>
          <div className="h-3 leading-3">Sun</div>
        </div>

        {/* Heatmap Grid */}
        <div className="flex gap-1 pt-6">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1 relative group/col">
              {week.map((day, dIdx) => {
                if (!day) return <div key={dIdx} className="h-3 w-3 rounded-sm bg-transparent" />;
                
                return (
                  <div 
                    key={dIdx} 
                    className={`h-3 w-3 rounded-sm ${getColor(day.anomaly_score)} hover:ring-1 ring-white/50 cursor-pointer relative group/cell transition-colors`}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white opacity-0 group-hover/cell:opacity-100 pointer-events-none z-10 shadow-xl transition-opacity">
                      <div className="font-bold mb-1">{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</div>
                      <div className="flex gap-3 text-[10px] text-slate-300">
                        <span>Score: <strong className="text-white">{(day.anomaly_score * 100).toFixed(0)}</strong></span>
                        <span>Txns: <strong className="text-white">{day.transaction_count}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 text-[10px] font-medium text-slate-400">
        <span>Low Risk</span>
        <div className="flex gap-0.5">
          <div className="h-2 w-2 rounded-sm bg-emerald-900/40" />
          <div className="h-2 w-2 rounded-sm bg-emerald-600/60" />
          <div className="h-2 w-2 rounded-sm bg-yellow-500/60" />
          <div className="h-2 w-2 rounded-sm bg-orange-500/80" />
          <div className="h-2 w-2 rounded-sm bg-red-500" />
        </div>
        <span>High Risk</span>
      </div>
    </div>
  );
}
