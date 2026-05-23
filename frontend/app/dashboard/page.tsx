"use client";

import { useCallback, useEffect, useState } from "react";

import { AdvancedSummaryBanner } from "@/components/AdvancedSummaryBanner";
import { AIExplanationPanel } from "@/components/AIExplanationPanel";
import { AIFinancialStory } from "@/components/AIFinancialStory";
import { AppShell } from "@/components/AppShell";
import { BehavioralInsightsPanel } from "@/components/BehavioralInsightsPanel";
import { CSVUpload } from "@/components/CSVUpload";
import { CreditScoreCard } from "@/components/CreditScoreCard";
import { DashboardSummaryCards } from "@/components/DashboardSummaryCards";
import { FeatureImportanceChart } from "@/components/FeatureImportanceChart";
import { FinancialHealthMeter } from "@/components/FinancialHealthMeter";
import { FinancialHealthRadar } from "@/components/FinancialHealthRadar";
import { ModelMetricsPanel } from "@/components/ModelMetricsPanel";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RecommendationFeed } from "@/components/RecommendationFeed";
import { RiskEvolutionChart } from "@/components/RiskEvolutionChart";
import { RiskGauge } from "@/components/RiskGauge";
import { SHAPWaterfallChart } from "@/components/SHAPWaterfallChart";
import { SpendingAnalyticsCharts } from "@/components/SpendingAnalyticsCharts";
import { TransactionChart } from "@/components/TransactionChart";
import { TransactionsTable } from "@/components/TransactionsTable";
import { useAuth } from "@/hooks/useAuth";
import { fetchDashboardSummary } from "@/services/dashboard";
import {
  fetchAdvancedSummary,
  fetchBehavioralAnalysis,
  fetchCreditScore,
  fetchExplainability,
  fetchFinancialHealth,
  fetchFinancialStory,
  fetchModelMetrics,
  fetchRecommendations,
  fetchRiskAnalysis,
  fetchRiskTrends,
} from "@/services/intelligence";
import { fetchTransactions } from "@/services/transactions";
import type {
  AdvancedSummaryResponse,
  BehavioralAnalysisResponse,
  CreditScoreResponse,
  DashboardSummary,
  ExplainabilityResponse,
  FinancialHealthResponse,
  FinancialStoryResponse,
  ModelMetricsResponse,
  RecommendationsResponse,
  RiskAnalysisResponse,
  RiskTrendsResponse,
  Transaction,
} from "@/utils/types";

// ---- Section Header ----
function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">{label}</p>
      <h2 className="text-base font-semibold text-white">{title}</h2>
    </div>
  );
}

// ---- Panel Card ----
function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-700/40 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  // Sprint 2 state
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [creditScore, setCreditScore] = useState<CreditScoreResponse | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysisResponse | null>(null);
  const [financialHealth, setFinancialHealth] = useState<FinancialHealthResponse | null>(null);
  const [modelMetrics, setModelMetrics] = useState<ModelMetricsResponse | null>(null);

  // Sprint 3 state
  const [explainability, setExplainability] = useState<ExplainabilityResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [behavioral, setBehavioral] = useState<BehavioralAnalysisResponse | null>(null);
  const [riskTrends, setRiskTrends] = useState<RiskTrendsResponse | null>(null);
  const [financialStory, setFinancialStory] = useState<FinancialStoryResponse | null>(null);
  const [advancedSummary, setAdvancedSummary] = useState<AdvancedSummaryResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Sprint 2: parallel fetch
      const [
        summaryRes,
        transactionRes,
        creditScoreRes,
        riskAnalysisRes,
        financialHealthRes,
        modelMetricsRes,
      ] = await Promise.all([
        fetchDashboardSummary(),
        fetchTransactions(),
        fetchCreditScore(user.id),
        fetchRiskAnalysis(user.id),
        fetchFinancialHealth(user.id),
        fetchModelMetrics(),
      ]);

      setSummary(summaryRes);
      setTransactions(transactionRes);
      setCreditScore(creditScoreRes);
      setRiskAnalysis(riskAnalysisRes);
      setFinancialHealth(financialHealthRes);
      setModelMetrics(modelMetricsRes);

      // Sprint 3: parallel fetch (non-blocking — errors soft-fail individually)
      const [
        explainabilityRes,
        recommendationsRes,
        behavioralRes,
        riskTrendsRes,
        storyRes,
        advancedRes,
      ] = await Promise.allSettled([
        fetchExplainability(user.id),
        fetchRecommendations(user.id),
        fetchBehavioralAnalysis(user.id),
        fetchRiskTrends(user.id),
        fetchFinancialStory(user.id),
        fetchAdvancedSummary(user.id),
      ]);

      if (explainabilityRes.status === "fulfilled") setExplainability(explainabilityRes.value);
      if (recommendationsRes.status === "fulfilled") setRecommendations(recommendationsRes.value);
      if (behavioralRes.status === "fulfilled") setBehavioral(behavioralRes.value);
      if (riskTrendsRes.status === "fulfilled") setRiskTrends(riskTrendsRes.value);
      if (storyRes.status === "fulfilled") setFinancialStory(storyRes.value);
      if (advancedRes.status === "fulfilled") setAdvancedSummary(advancedRes.value);
    } catch {
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <ProtectedRoute>
      <AppShell>
        <div
          className="flex flex-col gap-8"
          style={{ background: "linear-gradient(180deg, #0f172a 0%, #0a0f1e 100%)", minHeight: "100vh" }}
        >
          {/* Page header */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                Alternative Credit Intelligence Platform
              </p>
              <h1 className="text-2xl font-bold text-white">Financial Intelligence Dashboard</h1>
              <p className="mt-0.5 text-sm text-slate-400">
                Sprint 3 · Explainable AI · Behavioral Analytics · Personalized Insights
              </p>
            </div>
            {user && (
              <p className="text-sm text-slate-500">
                Welcome, <span className="font-medium text-slate-300">{user.name}</span>
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              SPRINT 3 — AI Intelligence Summary Banner
          ═══════════════════════════════════════════════════════════ */}
          <section>
            <AdvancedSummaryBanner summary={advancedSummary} isLoading={isLoading} />
          </section>

          {/* ═══════════════════════════════════════════════════════════
              SPRINT 2 — Core Score + Dashboard Cards
          ═══════════════════════════════════════════════════════════ */}
          <section className="space-y-6">
            <SectionHeader label="Sprint 2 · Credit Engine" title="Credit Score & Financial Overview" />
            <DashboardSummaryCards summary={summary} isLoading={isLoading} />

            <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
              <Panel>
                <CreditScoreCard creditScore={creditScore} isLoading={isLoading} />
              </Panel>
              <Panel>
                <RiskGauge creditScore={creditScore} isLoading={isLoading} />
              </Panel>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════
              SPRINT 3 — SHAP Explainability + AI Financial Story
          ═══════════════════════════════════════════════════════════ */}
          <section className="space-y-4">
            <SectionHeader label="Sprint 3 · Explainable AI" title="Why You Received This Score" />
            <div className="grid gap-6 xl:grid-cols-2">
              <Panel>
                <h3 className="mb-4 text-sm font-semibold text-slate-200">
                  SHAP Feature Contribution Analysis
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
              <Panel>
                <h3 className="mb-4 text-sm font-semibold text-slate-200">AI Financial Narrative</h3>
                <AIFinancialStory story={financialStory} isLoading={isLoading} />
              </Panel>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════
              SPRINT 3 — Financial Health 6-Dimension Radar
          ═══════════════════════════════════════════════════════════ */}
          <section className="space-y-4">
            <SectionHeader label="Sprint 3 · Financial Health" title="Six-Dimension Health Assessment" />
            <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
              <Panel>
                <h3 className="mb-5 text-sm font-semibold text-slate-200">
                  Health Dimensions & Benchmarks
                </h3>
                <FinancialHealthRadar
                  healthReport={advancedSummary?.health_report ?? null}
                  isLoading={isLoading}
                />
              </Panel>
              <Panel>
                <h3 className="mb-4 text-sm font-semibold text-slate-200">
                  Risk Score Evolution
                </h3>
                <RiskEvolutionChart riskTrends={riskTrends} isLoading={isLoading} />

                {/* Explanations panel below the chart */}
                <div className="mt-6">
                  <AIExplanationPanel
                    riskAnalysis={riskAnalysis}
                    explanations={creditScore?.explanations ?? []}
                    isLoading={isLoading}
                  />
                </div>
              </Panel>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════
              SPRINT 3 — Behavioral Analysis + Recommendations
          ═══════════════════════════════════════════════════════════ */}
          <section className="space-y-4">
            <SectionHeader label="Sprint 3 · Behavioral Intelligence" title="Spending Patterns & Personalized Recommendations" />
            <div className="grid gap-6 xl:grid-cols-2">
              <Panel>
                <h3 className="mb-4 text-sm font-semibold text-slate-200">
                  Behavioral Analysis & Spender Profile
                </h3>
                <BehavioralInsightsPanel behavioral={behavioral} isLoading={isLoading} />
              </Panel>
              <Panel>
                <h3 className="mb-4 text-sm font-semibold text-slate-200">
                  Personalized Financial Recommendations
                </h3>
                <RecommendationFeed
                  recommendations={recommendations?.recommendations ?? []}
                  highPriorityCount={recommendations?.high_priority_count ?? 0}
                  isLoading={isLoading}
                />
              </Panel>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════
              SPRINT 2 — Upload + Transaction Chart
          ═══════════════════════════════════════════════════════════ */}
          <section className="space-y-4">
            <SectionHeader label="Sprint 1 · Data Ingestion" title="Upload Transactions & Cash Flow" />
            <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
              <Panel>
                <CSVUpload onUploadComplete={loadDashboard} />
              </Panel>
              <Panel>
                <TransactionChart summary={summary} isLoading={isLoading} />
              </Panel>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════
              SPRINT 2 — Financial Health Meter + Spending Analytics
          ═══════════════════════════════════════════════════════════ */}
          <section className="space-y-4">
            <SectionHeader label="Sprint 2 · Analytics" title="Spending Intelligence & Financial Health" />
            <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
              <Panel>
                <FinancialHealthMeter health={financialHealth} isLoading={isLoading} />
              </Panel>
              <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60">
                <SpendingAnalyticsCharts health={financialHealth} isLoading={isLoading} />
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════
              SPRINT 2 — Feature Importance + Model Metrics + MLOps
          ═══════════════════════════════════════════════════════════ */}
          <section className="space-y-4">
            <SectionHeader label="Sprint 2 · MLOps" title="Model Analytics & Feature Importance" />
            <div className="grid gap-6 xl:grid-cols-2">
              <Panel>
                <FeatureImportanceChart
                  importance={creditScore?.feature_importance ?? []}
                  isLoading={isLoading}
                />
              </Panel>
              <Panel>
                <ModelMetricsPanel metrics={modelMetrics} isLoading={isLoading} />
              </Panel>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════
              SPRINT 1 — Transactions Table
          ═══════════════════════════════════════════════════════════ */}
          <section className="space-y-4">
            <SectionHeader label="Sprint 1 · Ledger" title="Transaction History" />
            <Panel>
              <TransactionsTable transactions={transactions} isLoading={isLoading} />
            </Panel>
          </section>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
