"use client";

import { useEffect, useState, useCallback } from "react";

import { AnomalyHeatmap } from "@/components/AnomalyHeatmap";
import { BehavioralRiskPanel } from "@/components/BehavioralRiskPanel";
import { FraudAlertFeed } from "@/components/FraudAlertFeed";
import { FraudExplainabilityPanel } from "@/components/FraudExplainabilityPanel";
import { FraudScoreMeter } from "@/components/FraudScoreMeter";
import { FraudSummaryBanner } from "@/components/FraudSummaryBanner";
import { MerchantRiskChart } from "@/components/MerchantRiskChart";
import { RiskEventTimeline } from "@/components/RiskEventTimeline";
import { TransactionVelocityChart } from "@/components/TransactionVelocityChart";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchAnomalyAnalysis,
  fetchBehavioralRisk,
  fetchFraudAlerts,
  fetchFraudExplainability,
  fetchFraudScore,
  fetchFraudSummary,
  fetchRiskEvents,
} from "@/services/fraud";
import type {
  AnomalyAnalysisResponse,
  BehavioralRiskResponse,
  FraudAlertsResponse,
  FraudExplainabilityResponse,
  FraudScoreResponse,
  FraudSummaryResponse,
  RiskEventsResponse,
} from "@/utils/types";

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 border-l-4 border-red-500 pl-4 py-0.5">
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

export default function FraudPage() {
  const { user } = useAuth();
  
  const [fraudSummary, setFraudSummary] = useState<FraudSummaryResponse | null>(null);
  const [fraudScore, setFraudScore] = useState<FraudScoreResponse | null>(null);
  const [behavioralRisk, setBehavioralRisk] = useState<BehavioralRiskResponse | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlertsResponse | null>(null);
  const [riskEvents, setRiskEvents] = useState<RiskEventsResponse | null>(null);
  const [anomalyAnalysis, setAnomalyAnalysis] = useState<AnomalyAnalysisResponse | null>(null);
  const [fraudExplainability, setFraudExplainability] = useState<FraudExplainabilityResponse | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  const loadFraud = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    
    try {
      const [
        summaryRes,
        scoreRes,
        behavRes,
        alertsRes,
        eventsRes,
        anomalyRes,
        explainRes
      ] = await Promise.allSettled([
        fetchFraudSummary(user.id),
        fetchFraudScore(user.id),
        fetchBehavioralRisk(user.id),
        fetchFraudAlerts(user.id),
        fetchRiskEvents(user.id),
        fetchAnomalyAnalysis(user.id),
        fetchFraudExplainability(user.id)
      ]);
      
      if (summaryRes.status === "fulfilled") setFraudSummary(summaryRes.value);
      if (scoreRes.status === "fulfilled") setFraudScore(scoreRes.value);
      if (behavRes.status === "fulfilled") setBehavioralRisk(behavRes.value);
      if (alertsRes.status === "fulfilled") setFraudAlerts(alertsRes.value);
      if (eventsRes.status === "fulfilled") setRiskEvents(eventsRes.value);
      if (anomalyRes.status === "fulfilled") setAnomalyAnalysis(anomalyRes.value);
      if (explainRes.status === "fulfilled") setFraudExplainability(explainRes.value);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadFraud();
  }, [loadFraud]);

  return (
    <div className="flex flex-col gap-8 text-slate-100 pb-10">
      {/* Page Header */}
      <div className="border-b border-slate-800/60 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 border border-red-500/20">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Fraud Intelligence Engine
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white mt-2">
          Fraud Detection & Risk Intelligence
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time behavioral anomaly detection, transaction risk scoring, and fraud explainability.
        </p>
      </div>
      
      {/* 1. Summary Banner */}
      <section>
        <FraudSummaryBanner summary={fraudSummary} isLoading={isLoading} />
      </section>
      
      {/* 2. Fraud Risk Assessment */}
      <section className="space-y-4">
        <SectionHeader title="Fraud Risk Assessment" subtitle="Real-time fraud probability scoring and behavioral risk profiling" />
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel>
            <FraudScoreMeter fraudScore={fraudScore} isLoading={isLoading} />
          </Panel>
          <Panel>
            <h3 className="mb-4 text-sm font-semibold text-slate-200">Behavioral Indicators</h3>
            <BehavioralRiskPanel behavioralRisk={behavioralRisk} isLoading={isLoading} />
          </Panel>
        </div>
      </section>
      
      {/* 3. Alert & Event Center */}
      <section className="space-y-4">
        <SectionHeader title="Alert & Event Center" subtitle="Active fraud alerts and risk event pipeline" />
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel>
            <FraudAlertFeed alerts={fraudAlerts} isLoading={isLoading} />
          </Panel>
          <Panel>
            <h3 className="mb-4 text-sm font-semibold text-slate-200">Risk Event Pipeline</h3>
            <RiskEventTimeline events={riskEvents} isLoading={isLoading} />
          </Panel>
        </div>
      </section>
      
      {/* 4. Anomaly Intelligence */}
      <section className="space-y-4">
        <SectionHeader title="Transaction Anomaly Intelligence" subtitle="Daily anomaly heatmap and velocity pattern analysis" />
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel className="flex flex-col items-center">
            <h3 className="mb-4 self-start text-sm font-semibold text-slate-200">Anomaly Heatmap</h3>
            <AnomalyHeatmap analysis={anomalyAnalysis} isLoading={isLoading} />
          </Panel>
          <Panel>
            <h3 className="mb-4 text-sm font-semibold text-slate-200">Transaction Velocity</h3>
            <TransactionVelocityChart analysis={anomalyAnalysis} isLoading={isLoading} />
          </Panel>
        </div>
      </section>
      
      {/* 5. Risk Distribution */}
      <section className="space-y-4">
        <SectionHeader title="Risk Indicator Distribution" subtitle="Ranked behavioral risk factors" />
        <Panel>
          <MerchantRiskChart behavioralRisk={behavioralRisk} isLoading={isLoading} />
        </Panel>
      </section>
      
      {/* 6. Fraud Explainability */}
      <section className="space-y-4">
        <SectionHeader title="Fraud Explainability Engine" subtitle="Feature contributions to fraud probability score" />
        <Panel>
          <h3 className="mb-4 text-sm font-semibold text-slate-200">Fraud Feature Attribution</h3>
          <FraudExplainabilityPanel explainability={fraudExplainability} isLoading={isLoading} />
        </Panel>
      </section>
    </div>
  );
}
