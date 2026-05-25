import { Activity, Clock, CreditCard, Crosshair, Map, Navigation, Shield, ShoppingCart, TrendingUp } from "lucide-react";
import type { BehavioralRiskResponse, BehavioralRiskItem } from "@/utils/types";

export function BehavioralRiskPanel({
  behavioralRisk,
  isLoading,
}: {
  behavioralRisk: BehavioralRiskResponse | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex flex-col p-4 rounded-xl border border-slate-800 bg-[#0d1220]/40 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded bg-slate-800" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-slate-800 rounded" />
                  <div className="h-3 w-32 bg-slate-800 rounded" />
                </div>
              </div>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!behavioralRisk || behavioralRisk.indicators.length === 0) {
    return (
      <div className="p-8 text-center border border-slate-800 border-dashed rounded-xl bg-slate-900/20">
        <p className="text-slate-400">Behavioral indicators require transaction data to compute.</p>
      </div>
    );
  }

  const getIconForIndicator = (indicator: string) => {
    switch (indicator) {
      case "transaction_velocity": return Activity;
      case "spending_spike_ratio": return TrendingUp;
      case "merchant_concentration_score": return Crosshair;
      case "nighttime_transaction_ratio": return Clock;
      case "category_drift_score": return Navigation;
      case "merchant_novelty_score": return Map;
      case "round_number_ratio": return ShoppingCart;
      case "behavioral_fingerprint_deviation": return Shield;
      default: return CreditCard;
    }
  };

  const getRiskColors = (level: string) => {
    switch (level) {
      case "Critical": return { text: "text-red-400", bg: "bg-red-500", badgeBg: "bg-red-500/10", border: "border-red-500/30" };
      case "High": return { text: "text-orange-400", bg: "bg-orange-500", badgeBg: "bg-orange-500/10", border: "border-orange-500/30" };
      case "Medium": return { text: "text-yellow-400", bg: "bg-yellow-400", badgeBg: "bg-yellow-500/10", border: "border-yellow-500/30" };
      default: return { text: "text-emerald-400", bg: "bg-emerald-500", badgeBg: "bg-emerald-500/10", border: "border-emerald-500/30" };
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {behavioralRisk.indicators.map((indicator: BehavioralRiskItem, i) => {
        const Icon = getIconForIndicator(indicator.indicator);
        const colors = getRiskColors(indicator.risk_level);
        const percentage = Math.min(100, Math.max(0, indicator.score * 100));

        return (
          <div 
            key={i}
            className={`flex flex-col p-4 rounded-xl border bg-gradient-to-br from-[#0b0f1c] to-[#12182b] transition-all hover:scale-[1.02] ${colors.border}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3 min-w-0">
                <div className={`shrink-0 flex items-center justify-center h-8 w-8 rounded ${colors.badgeBg} ${colors.text}`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate pr-2">
                    {indicator.readable_label}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                    {indicator.description}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end">
                <span className={`text-lg font-black tracking-tighter ${colors.text} leading-none`}>
                  {percentage.toFixed(0)}%
                </span>
                <span className={`mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${colors.badgeBg} ${colors.text}`}>
                  {indicator.risk_level}
                </span>
              </div>
            </div>

            <div className="mt-auto relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${colors.bg}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
