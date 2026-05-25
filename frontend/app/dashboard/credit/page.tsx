"use client";

import { useEffect, useState, useCallback } from "react";

import { CreditScoreCard } from "@/components/CreditScoreCard";
import { FeatureImportanceChart } from "@/components/FeatureImportanceChart";
import { RiskGauge } from "@/components/RiskGauge";
import { SHAPWaterfallChart } from "@/components/SHAPWaterfallChart";
import { useAuth } from "@/hooks/useAuth";
import { fetchCreditScore, fetchExplainability } from "@/services/intelligence";
import type { CreditScoreResponse, ExplainabilityResponse } from "@/utils/types";

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

export default function CreditIntelligencePage() {
  const { user } = useAuth();
  
  const [creditScore, setCreditScore] = useState<CreditScoreResponse | null>(null);
  const [explainability, setExplainability] = useState<ExplainabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    
    try {
      const [creditRes, explainRes] = await Promise.allSettled([
        fetchCreditScore(user.id),
        fetchExplainability(user.id)
      ]);
      
      if (creditRes.status === "fulfilled") setCreditScore(creditRes.value);
      if (explainRes.status === "fulfilled") setExplainability(explainRes.value);
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
          ML Scoring Module
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white mt-2">
          Credit Intelligence
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Deep dive into your ML-generated credit score and feature importance.
        </p>
      </div>

      <section className="space-y-4">
        <SectionHeader title="Score Analysis" subtitle="Core credit assessment" />
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <Panel>
            <CreditScoreCard creditScore={creditScore} isLoading={isLoading} />
          </Panel>
          <Panel>
            <RiskGauge creditScore={creditScore} isLoading={isLoading} />
          </Panel>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader title="SHAP Explainability Engine" subtitle="Local feature contribution analysis" />
        <Panel>
          <h3 className="mb-4 text-sm font-semibold text-slate-200">
            SHAP Waterfall
          </h3>
          <p className="mb-4 text-xs text-slate-500">
            Each bar shows how much a feature pushed your score above or below the expected baseline.
          </p>
          <SHAPWaterfallChart
            shapValues={explainability?.shap_values ?? []}
            baseScore={explainability?.base_score ?? 600}
            finalScore={explainability?.credit_score ?? creditScore?.score ?? 600}
            isLoading={isLoading}
          />
        </Panel>
      </section>

      <section className="space-y-4">
        <SectionHeader title="Global Feature Importance" subtitle="Overall model parameters" />
        <Panel>
          <FeatureImportanceChart
            importance={creditScore?.feature_importance ?? []}
            isLoading={isLoading}
          />
        </Panel>
      </section>
    </div>
  );
}
