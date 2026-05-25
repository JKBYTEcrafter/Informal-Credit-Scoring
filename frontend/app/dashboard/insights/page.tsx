"use client";

import { useEffect, useState, useCallback } from "react";

import { AdvancedSummaryBanner } from "@/components/AdvancedSummaryBanner";
import { AIFinancialStory } from "@/components/AIFinancialStory";
import { BehavioralInsightsPanel } from "@/components/BehavioralInsightsPanel";
import { RecommendationFeed } from "@/components/RecommendationFeed";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchAdvancedSummary,
  fetchBehavioralAnalysis,
  fetchFinancialStory,
  fetchRecommendations,
} from "@/services/intelligence";
import type {
  AdvancedSummaryResponse,
  BehavioralAnalysisResponse,
  FinancialStoryResponse,
  RecommendationsResponse,
} from "@/utils/types";

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 border-l-4 border-indigo-500 pl-4 py-0.5">
      <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800/50 bg-[#0d1220]/60 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-slate-700/60">
      {children}
    </div>
  );
}

export default function InsightsPage() {
  const { user } = useAuth();
  
  const [advancedSummary, setAdvancedSummary] = useState<AdvancedSummaryResponse | null>(null);
  const [behavioral, setBehavioral] = useState<BehavioralAnalysisResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [financialStory, setFinancialStory] = useState<FinancialStoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    
    try {
      const [advRes, behavRes, recRes, storyRes] = await Promise.allSettled([
        fetchAdvancedSummary(user.id),
        fetchBehavioralAnalysis(user.id),
        fetchRecommendations(user.id),
        fetchFinancialStory(user.id)
      ]);
      
      if (advRes.status === "fulfilled") setAdvancedSummary(advRes.value);
      if (behavRes.status === "fulfilled") setBehavioral(behavRes.value);
      if (recRes.status === "fulfilled") setRecommendations(recRes.value);
      if (storyRes.status === "fulfilled") setFinancialStory(storyRes.value);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <div className="flex flex-col gap-8 text-slate-100">
      <div className="border-b border-slate-800/60 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
          Intelligence Module
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white mt-2">
          AI Insights
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Algorithmic spender profiling, AI narratives, and actionable recommendations.
        </p>
      </div>

      <section>
        <AdvancedSummaryBanner summary={advancedSummary} isLoading={isLoading} />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Behavioral Intelligence" subtitle="Algorithmic spender profiling and insights" />
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel>
            <h3 className="mb-4 text-sm font-semibold text-slate-200">
              Spender Profile
            </h3>
            <BehavioralInsightsPanel behavioral={behavioral} isLoading={isLoading} />
          </Panel>
          <Panel>
            <h3 className="mb-4 text-sm font-semibold text-slate-200">
              Personalized Recommendations
            </h3>
            <RecommendationFeed
              recommendations={recommendations?.recommendations ?? []}
              highPriorityCount={recommendations?.high_priority_count ?? 0}
              isLoading={isLoading}
            />
          </Panel>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader title="Financial Narrative" subtitle="AI-generated financial story based on your patterns" />
        <Panel>
          <AIFinancialStory story={financialStory} isLoading={isLoading} />
        </Panel>
      </section>
    </div>
  );
}
