import { AlertTriangle, AlertOctagon, Activity, ShieldAlert, AlertCircle } from "lucide-react";
import type { FraudSummaryResponse } from "@/utils/types";

export function FraudSummaryBanner({
  summary,
  isLoading,
}: {
  summary: FraudSummaryResponse | null;
  isLoading: boolean;
}) {
  if (isLoading || !summary) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-800/50 bg-[#0d1220]/60 p-6 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-slate-800 mb-4" />
            <div className="h-8 w-24 bg-slate-800 rounded mb-2" />
            <div className="h-4 w-32 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Critical Risk": return "text-red-400 bg-red-500/10 border-red-500/30";
      case "High Risk": return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      case "Medium Risk": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      default: return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    }
  };

  const riskColorClass = getRiskColor(summary.risk_level);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      
      {/* Probability */}
      <div className={`rounded-2xl border bg-[#0d1220]/80 p-6 backdrop-blur-sm transition-all hover:scale-[1.02] shadow-lg ${riskColorClass}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-xl bg-current opacity-20" />
          <ShieldAlert size={28} className="absolute ml-2" />
          {["Critical Risk", "High Risk"].includes(summary.risk_level) && (
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-current opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-current"></span>
            </span>
          )}
        </div>
        <h3 className="text-3xl font-black mb-1">{(summary.fraud_probability * 100).toFixed(1)}%</h3>
        <p className="text-sm font-semibold opacity-80">Fraud Probability</p>
        <p className="text-xs opacity-60 mt-1">{summary.risk_level}</p>
      </div>

      {/* Alerts */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1220]/60 p-6 hover:border-slate-700 transition-all">
        <div className="flex items-center gap-3 mb-4 text-orange-400">
          <div className="p-2 rounded-xl bg-orange-500/10">
            <AlertTriangle size={24} />
          </div>
        </div>
        <h3 className="text-3xl font-black text-white mb-1">{summary.active_alerts}</h3>
        <p className="text-sm font-semibold text-slate-300">Active Alerts</p>
        <p className="text-xs text-slate-500 mt-1">{summary.critical_alerts} critical priority</p>
      </div>

      {/* Risk Events */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1220]/60 p-6 hover:border-slate-700 transition-all">
        <div className="flex items-center gap-3 mb-4 text-blue-400">
          <div className="p-2 rounded-xl bg-blue-500/10">
            <Activity size={24} />
          </div>
        </div>
        <h3 className="text-3xl font-black text-white mb-1">{summary.risk_events_count}</h3>
        <p className="text-sm font-semibold text-slate-300">Risk Pipeline Events</p>
        <p className="text-xs text-slate-500 mt-1">Evaluated real-time</p>
      </div>

      {/* Anomaly Score */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1220]/60 p-6 hover:border-slate-700 transition-all">
        <div className="flex items-center gap-3 mb-4 text-purple-400">
          <div className="p-2 rounded-xl bg-purple-500/10">
            <AlertOctagon size={24} />
          </div>
        </div>
        <h3 className="text-3xl font-black text-white mb-1">{(summary.overall_anomaly_score * 100).toFixed(1)}</h3>
        <p className="text-sm font-semibold text-slate-300">Global Anomaly Index</p>
        <p className="text-xs text-slate-500 mt-1">Isolation Forest Ensemble</p>
      </div>

    </div>
  );
}
