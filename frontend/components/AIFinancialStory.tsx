"use client";

import { BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";
import type { FinancialStoryResponse, StorySegment } from "@/utils/types";

interface AIFinancialStoryProps {
  story: FinancialStoryResponse | null;
  isLoading?: boolean;
}

const SEGMENT_STYLES: Record<StorySegment["segment_type"], string> = {
  header: "text-slate-200 font-medium",
  positive: "text-emerald-300",
  warning: "text-amber-300",
  neutral: "text-slate-300",
  recommendation: "text-violet-300",
};

const SEGMENT_ICONS: Record<StorySegment["segment_type"], string> = {
  header: "📊",
  positive: "✅",
  warning: "⚠️",
  neutral: "📋",
  recommendation: "💡",
};

export function AIFinancialStory({ story, isLoading }: AIFinancialStoryProps) {
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-5 w-3/4 bg-slate-700 rounded" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 bg-slate-800 rounded" style={{ width: `${85 - i * 8}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-3 text-slate-500">
        <BookOpen className="h-10 w-10 opacity-30" />
        <p className="text-sm">Upload transactions to generate your financial story</p>
      </div>
    );
  }

  const visibleSegments = expanded ? story.narrative_segments : story.narrative_segments.slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Headline */}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-1">
            AI Financial Narrative
          </p>
          <h3 className="text-base font-bold text-white leading-snug">{story.headline}</h3>
        </div>
      </div>

      {/* Score context */}
      <div className="flex items-center gap-3 rounded-xl bg-slate-800/60 px-4 py-3 border border-slate-700/40">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{story.credit_score.toFixed(0)}</p>
          <p className="text-[10px] text-slate-500">Score</p>
        </div>
        <div className="h-8 w-px bg-slate-700" />
        <div>
          <span
            className="inline-block rounded-lg px-2.5 py-1 text-xs font-semibold"
            style={{
              background:
                story.risk_level === "Low Risk"
                  ? "rgba(16,185,129,0.15)"
                  : story.risk_level === "Medium Risk"
                  ? "rgba(245,158,11,0.15)"
                  : "rgba(239,68,68,0.15)",
              color:
                story.risk_level === "Low Risk"
                  ? "#10b981"
                  : story.risk_level === "Medium Risk"
                  ? "#f59e0b"
                  : "#ef4444",
            }}
          >
            {story.risk_level}
          </span>
        </div>
      </div>

      {/* Narrative segments */}
      <div className="space-y-3">
        {visibleSegments.map((seg, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl border border-slate-700/30 bg-slate-800/30 p-3.5 transition-all"
          >
            <span className="text-lg leading-none mt-0.5">{SEGMENT_ICONS[seg.segment_type]}</span>
            <p className={`text-sm leading-relaxed ${SEGMENT_STYLES[seg.segment_type]}`}>
              {seg.text}
            </p>
          </div>
        ))}
      </div>

      {/* Expand/collapse */}
      {story.narrative_segments.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/40 bg-slate-800/40 py-2.5 text-xs font-medium text-slate-400 transition-all hover:border-violet-500/40 hover:text-violet-400"
        >
          {expanded ? "Show less" : `Read full story (${story.narrative_segments.length} sections)`}
          <ChevronRight
            className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </button>
      )}

      <p className="text-[10px] text-slate-600">
        Generated {new Date(story.generated_at).toLocaleDateString()}
      </p>
    </div>
  );
}
