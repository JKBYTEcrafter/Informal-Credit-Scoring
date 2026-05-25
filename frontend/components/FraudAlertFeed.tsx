import { AlertTriangle, AlertOctagon, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import type { FraudAlertsResponse } from "@/utils/types";

export function FraudAlertFeed({
  alerts,
  isLoading,
}: {
  alerts: FraudAlertsResponse | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-800 bg-[#0d1220]/40 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/3 bg-slate-800 rounded" />
              <div className="h-4 w-full bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!alerts || alerts.alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <h4 className="text-lg font-semibold text-white">No active fraud alerts</h4>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          Your transaction patterns look normal. We continuously monitor for behavioral anomalies.
        </p>
      </div>
    );
  }

  const getAlertConfig = (severity: string) => {
    switch (severity) {
      case "Critical": 
        return { icon: AlertOctagon, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" };
      case "High": 
        return { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30" };
      case "Medium": 
        return { icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" };
      default: 
        return { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" };
    }
  };

  const displayAlerts = alerts.alerts.slice(0, 10);
  const remaining = alerts.total_count - displayAlerts.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold text-slate-200">Recent Risk Alerts</h3>
        <span className="text-xs font-medium text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-full">
          {alerts.total_count} Total
        </span>
      </div>

      <div className="space-y-3">
        {displayAlerts.map((alert) => {
          const config = getAlertConfig(alert.severity);
          const Icon = config.icon;
          
          return (
            <div 
              key={alert.id}
              className={`flex items-start gap-4 p-4 rounded-xl border bg-gradient-to-r from-[#0d1220] to-[#12182b] transition-all hover:-translate-y-0.5 hover:shadow-lg ${config.border}`}
            >
              <div className={`mt-0.5 shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${config.bg} ${config.color}`}>
                <Icon size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                  <h4 className="text-sm font-bold text-white truncate pr-4">
                    {alert.alert_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </h4>
                  <div className="flex items-center gap-2 shrink-0 text-xs">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${config.bg} ${config.color}`}>
                      {alert.severity}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {new Date(alert.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-400 leading-relaxed">
                  {alert.description}
                </p>
                
                <div className="mt-3 flex items-center gap-4">
                  <span className="text-xs font-semibold text-slate-500">
                    Risk Score: <span className="text-slate-300">{(alert.risk_score * 100).toFixed(0)}</span>
                  </span>
                  <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Acknowledge
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {remaining > 0 && (
        <button className="w-full mt-4 py-3 rounded-xl border border-slate-700/50 bg-slate-800/30 text-sm font-semibold text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors">
          View all {alerts.total_count} alerts
        </button>
      )}
    </div>
  );
}
