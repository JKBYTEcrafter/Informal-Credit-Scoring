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

// ---- Premium Corporate Section Header ----
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 border-l-4 border-indigo-500 pl-4 py-0.5">
      <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ---- Premium Glassmorphic Panel Card ----
function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-800/50 bg-[#0d1220]/60 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-slate-700/60 ${className}`}
    >
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  // Dashboard state variables
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [creditScore, setCreditScore] = useState<CreditScoreResponse | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysisResponse | null>(null);
  const [financialHealth, setFinancialHealth] = useState<FinancialHealthResponse | null>(null);
  const [modelMetrics, setModelMetrics] = useState<ModelMetricsResponse | null>(null);

  // Advanced explainable AI state
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
      // Fetch Core financial metrics
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

      // Fetch advanced algorithmic indicators
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
        <div className="flex flex-col gap-8 text-slate-100">
          
          {/* Dashboard Premium Title Block */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-slate-800/60 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                Enterprise Credit Intelligence Suite
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white mt-2">
                Financial Intelligence Dashboard
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Real-time explainable credit scoring, transactional analytics, and algorithmic recommendation feeds.
              </p>
            </div>
            {user && (
              <div className="flex items-center gap-2 rounded-lg bg-slate-900/60 border border-slate-800 px-4 py-2 text-sm text-slate-400">
                <span>Welcome back,</span>
                <span className="font-semibold text-white">{user.name}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 shadow-md">
              {error}
            </div>
          )}

          {/* AI Intelligence Summary Banner */}
          <section>
            <AdvancedSummaryBanner summary={advancedSummary} isLoading={isLoading} />
          </section>

          {/* Core Credit Assessment */}
          <section className="space-y-6">
            <SectionHeader 
              title="Core Credit Assessment" 
              subtitle="Real-time credit score analysis and parsed statement metrics" 
            />
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

          {/* SHAP Explainability + AI Financial Story */}
          <section className="space-y-4">
            <SectionHeader 
              title="Explainable AI (XAI) Engine" 
              subtitle="SHAP feature attribution parameters and automated narrative insights" 
            />
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

          {/* Financial Health 6-Dimension Radar */}
          <section className="space-y-4">
            <SectionHeader 
              title="Multi-Dimensional Health Index" 
              subtitle="Six pillars of financial health and historical risk trajectories" 
            />
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

          {/* Behavioral Analysis + Recommendations */}
          <section className="space-y-4">
            <SectionHeader 
              title="Behavioral Intelligence & Recommendations" 
              subtitle="Algorithmic spender profiling and priority-ranked recommendations" 
            />
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

          {/* Upload + Transaction Chart */}
          <section className="space-y-4">
            <SectionHeader 
              title="Ingestion Engine & Cash Flow Dynamics" 
              subtitle="Secure statement parsing and daily inflow vs outflow curves" 
            />
            <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
              <Panel>
                <CSVUpload onUploadComplete={loadDashboard} />
              </Panel>
              <Panel>
                <TransactionChart summary={summary} isLoading={isLoading} />
              </Panel>
            </div>
          </section>

          {/* Financial Health Meter + Spending Analytics */}
          <section className="space-y-4">
            <SectionHeader 
              title="Interactive Spending Intelligence" 
              subtitle="Category distributions and transactional indicators" 
            />
            <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
              <Panel>
                <FinancialHealthMeter health={financialHealth} isLoading={isLoading} />
              </Panel>
              <div className="rounded-2xl border border-slate-800/50 bg-[#0d1220]/60">
                <SpendingAnalyticsCharts health={financialHealth} isLoading={isLoading} />
              </div>
            </div>
          </section>

          {/* Feature Importance + Model Metrics + MLOps */}
          <section className="space-y-4">
            <SectionHeader 
              title="Model Performance & MLOps Analytics" 
              subtitle="Global feature importance and training diagnostics" 
            />
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

          {/* Transactions Table */}
          <section className="space-y-4">
            <SectionHeader 
              title="Ingested Transactions Ledger" 
              subtitle="Fully categorized ledger from parsed statements" 
            />
            <Panel>
              <TransactionsTable transactions={transactions} isLoading={isLoading} />
            </Panel>
          </section>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
