"use client";

import { useEffect, useState, useCallback } from "react";

import { FeatureImportanceChart } from "@/components/FeatureImportanceChart";
import { ModelMetricsPanel } from "@/components/ModelMetricsPanel";
import { useAuth } from "@/hooks/useAuth";
import { fetchCreditScore, fetchModelMetrics } from "@/services/intelligence";
import type { CreditScoreResponse, ModelMetricsResponse } from "@/utils/types";

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

export default function AnalyticsPage() {
  const { user } = useAuth();
  
  const [modelMetrics, setModelMetrics] = useState<ModelMetricsResponse | null>(null);
  const [creditScore, setCreditScore] = useState<CreditScoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    
    try {
      const [metricsRes, creditRes] = await Promise.allSettled([
        fetchModelMetrics(),
        fetchCreditScore(user.id)
      ]);
      
      if (metricsRes.status === "fulfilled") setModelMetrics(metricsRes.value);
      if (creditRes.status === "fulfilled") setCreditScore(creditRes.value);
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
          MLOps Dashboard
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white mt-2">
          ML Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Model performance metrics, validation scores, and global feature importance.
        </p>
      </div>

      <section className="space-y-4">
        <SectionHeader title="Model Performance" subtitle="Training diagnostics and pipeline health" />
        <Panel>
          <ModelMetricsPanel metrics={modelMetrics} isLoading={isLoading} />
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
