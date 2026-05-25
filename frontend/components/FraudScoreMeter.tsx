import { ShieldAlert } from "lucide-react";
import type { FraudScoreResponse } from "@/utils/types";

export function FraudScoreMeter({
  fraudScore,
  isLoading,
}: {
  fraudScore: FraudScoreResponse | null;
  isLoading: boolean;
}) {
  if (isLoading || !fraudScore) {
    return (
      <div className="flex flex-col items-center justify-center p-8 animate-pulse">
        <div className="h-48 w-48 rounded-full border-[12px] border-slate-800" />
        <div className="mt-8 flex gap-2">
          <div className="h-6 w-24 rounded-full bg-slate-800" />
          <div className="h-6 w-24 rounded-full bg-slate-800" />
        </div>
      </div>
    );
  }

  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - fraudScore.fraud_probability * circumference;

  const getRiskColors = (level: string) => {
    switch (level) {
      case "Critical Risk": return { circle: "stroke-red-500", text: "text-red-400" };
      case "High Risk": return { circle: "stroke-orange-500", text: "text-orange-400" };
      case "Medium Risk": return { circle: "stroke-yellow-400", text: "text-yellow-400" };
      default: return { circle: "stroke-emerald-500", text: "text-emerald-400" };
    }
  };

  const colors = getRiskColors(fraudScore.risk_level);

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="-rotate-90 transform drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        >
          {/* Background circle */}
          <circle
            stroke="#1e293b"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            className={`${colors.circle} transition-all duration-1000 ease-out`}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset }}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <ShieldAlert size={20} className={`${colors.text} mb-1 opacity-80`} />
          <span className="text-4xl font-black text-white tracking-tighter">
            {(fraudScore.fraud_probability * 100).toFixed(0)}%
          </span>
          <span className={`text-xs font-bold uppercase tracking-wider ${colors.text} mt-1`}>
            {fraudScore.risk_level}
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center w-full max-w-sm">
        <div className="flex justify-between w-full mb-2 text-xs font-semibold">
          <span className="text-slate-400">Confidence Score</span>
          <span className="text-indigo-400">{(fraudScore.confidence_score * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-6">
          <div 
            className="bg-indigo-500 h-1.5 rounded-full" 
            style={{ width: `${fraudScore.confidence_score * 100}%` }}
          />
        </div>

        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider self-start mb-3">Top Risk Factors</h4>
        <div className="flex flex-wrap gap-2 justify-center w-full">
          {fraudScore.top_risk_factors.slice(0, 3).map((factor, i) => (
            <span key={i} className="px-3 py-1.5 rounded-md bg-slate-800/80 border border-slate-700/50 text-xs font-medium text-slate-300 shadow-sm">
              {factor}
            </span>
          ))}
          {fraudScore.top_risk_factors.length === 0 && (
            <span className="text-sm text-slate-500 italic">No significant risk factors detected</span>
          )}
        </div>
      </div>
    </div>
  );
}
