"use client";

import { useEffect, useState, useCallback } from "react";

import { AIExplanationPanel } from "@/components/AIExplanationPanel";
import { FinancialHealthMeter } from "@/components/FinancialHealthMeter";
import { FinancialHealthRadar } from "@/components/FinancialHealthRadar";
import { RiskEvolutionChart } from "@/components/RiskEvolutionChart";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchCreditScore,
  fetchFinancialHealth,
  fetchRiskAnalysis,
  fetchRiskTrends,
} from "@/services/intelligence";
import type {
  CreditScoreResponse,
  FinancialHealthResponse,
  RiskAnalysisResponse,
  RiskTrendsResponse,
} from "@/utils/types";

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 border-l-4 border-indigo-500 pl-4 py-0.5">
      <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-800/50 bg-[#0d1220]/60 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-slate-700/60 ${className}`}>
      {children}
    </div>
  );
}

export default function FinancialHealthPage() {
  const { user } = useAuth();
  
  const [financialHealth, setFinancialHealth] = useState<FinancialHealthResponse | null>(null);
  const [riskTrends, setRiskTrends] = useState<RiskTrendsResponse | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysisResponse | null>(null);
  const [creditScore, setCreditScore] = useState<CreditScoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // We map the simple FinancialHealthResponse to a mock report structure for the radar if needed,
  // or fetch advanced summary if preferred. For simplicity, we can pass null to radar 
  // until we have the advanced report endpoint here if we want. But the radar expects HealthReport,
  // Let's use the actual advanced health report endpoint if it exists, or just pass what we have.
  // Actually, FinancialHealthRadar expects `healthReport: FinancialHealthReportResponse | null`.
  // Wait, let's fetch advanced summary just to get the health report.
  const [healthReport, setHealthReport] = useState<any>(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    
    try {
      const [healthRes, trendsRes, analysisRes, creditRes] = await Promise.allSettled([
        fetchFinancialHealth(user.id),
        fetchRiskTrends(user.id),
        fetchRiskAnalysis(user.id),
        fetchCreditScore(user.id)
      ]);
      
      if (healthRes.status === "fulfilled") setFinancialHealth(healthRes.value);
      if (trendsRes.status === "fulfilled") setRiskTrends(trendsRes.value);
      if (analysisRes.status === "fulfilled") setRiskAnalysis(analysisRes.value);
      if (creditRes.status === "fulfilled") setCreditScore(creditRes.value);
      
      // Temporary fetch for radar since it uses the sprint3 report
      try {
        const { fetchAdvancedSummary } = await import("@/services/intelligence");
        const adv = await fetchAdvancedSummary(user.id);
        setHealthReport(adv.health_report);
      } catch (e) {
        console.error(e);
      }
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
          Health Module
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white mt-2">
          Financial Health
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Six pillars of financial health and historical risk trajectories.
        </p>
      </div>

      <section className="space-y-4">
        <SectionHeader title="Health Index" subtitle="Radar and Meter visualization" />
        <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
          <Panel>
            <h3 className="mb-5 text-sm font-semibold text-slate-200">
              Health Dimensions & Benchmarks
            </h3>
            <FinancialHealthRadar healthReport={healthReport} isLoading={isLoading} />
          </Panel>
          <Panel className="flex flex-col justify-center">
            <FinancialHealthMeter health={financialHealth} isLoading={isLoading} />
          </Panel>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader title="Risk Evolution" subtitle="6-month risk trend analysis" />
        <Panel>
          <RiskEvolutionChart riskTrends={riskTrends} isLoading={isLoading} />
        </Panel>
      </section>

      <section className="space-y-4">
        <SectionHeader title="Risk Factors Breakdown" subtitle="Detailed explanation of risk drivers" />
        <AIExplanationPanel
          riskAnalysis={riskAnalysis}
          explanations={creditScore?.explanations ?? []}
          isLoading={isLoading}
        />
      </section>
    </div>
  );
}
