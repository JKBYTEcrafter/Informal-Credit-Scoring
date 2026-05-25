import type { RiskEventsResponse } from "@/utils/types";

export function RiskEventTimeline({
  events,
  isLoading,
}: {
  events: RiskEventsResponse | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="flex flex-col items-center">
              <div className="h-4 w-4 rounded-full bg-slate-800" />
              <div className="h-full w-0.5 bg-slate-800 my-1 min-h-[40px]" />
            </div>
            <div className="flex-1 pb-4">
              <div className="h-4 w-1/4 bg-slate-800 rounded mb-2" />
              <div className="h-3 w-1/2 bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.events.length === 0) {
    return (
      <div className="p-8 text-center border border-slate-800 border-dashed rounded-xl bg-slate-900/20">
        <p className="text-slate-400">No risk events recorded in pipeline.</p>
      </div>
    );
  }

  const getEventColor = (score: number) => {
    if (score > 0.7) return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
    if (score > 0.4) return "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]";
    return "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]";
  };

  const getRelativeTime = (dateStr: string) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDifference = Math.round((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference === 0) {
      const hoursDiff = Math.round((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60));
      if (hoursDiff === 0) {
        const minsDiff = Math.round((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60));
        if (minsDiff === 0) return "Just now";
        return rtf.format(minsDiff, 'minute');
      }
      return rtf.format(hoursDiff, 'hour');
    }
    return rtf.format(daysDifference, 'day');
  };

  const displayEvents = events.events.slice(0, 10);

  return (
    <div className="relative">
      <div className="space-y-0">
        {displayEvents.map((event, i) => {
          const isLast = i === displayEvents.length - 1;
          const colorClass = getEventColor(event.event_score);
          
          return (
            <div key={event.id} className="flex gap-4 group">
              <div className="flex flex-col items-center">
                <div className={`h-3 w-3 rounded-full ${colorClass} ring-4 ring-[#0d1220] z-10 mt-1`} />
                {!isLast && <div className="w-0.5 bg-slate-800/80 grow my-1 min-h-[40px] group-hover:bg-slate-700 transition-colors" />}
              </div>
              
              <div className="flex-1 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                  <h4 className="text-sm font-bold text-slate-200">
                    {event.event_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </h4>
                  <span className="text-[10px] font-medium text-slate-500">
                    {getRelativeTime(event.created_at)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-400">
                    Score: {(event.event_score * 100).toFixed(0)}
                  </span>
                  
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <span className="text-[10px] text-slate-500 truncate max-w-[200px]">
                      {Object.values(event.metadata)[0] as string}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
