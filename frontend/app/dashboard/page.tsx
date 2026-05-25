"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  CreditCard,
  HeartPulse,
  Receipt,
  Brain,
  BarChart2,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

import { CreditScoreCard } from "@/components/CreditScoreCard";
import { DashboardSummaryCards } from "@/components/DashboardSummaryCards";
import { RiskGauge } from "@/components/RiskGauge";
import { useAuth } from "@/hooks/useAuth";
import { fetchDashboardSummary } from "@/services/dashboard";
import { fetchCreditScore } from "@/services/intelligence";
import { fetchTransactions } from "@/services/transactions";
import type { CreditScoreResponse, DashboardSummary, Transaction } from "@/utils/types";

// Helper for nav cards
function NavCard({
  title,
  description,
  href,
  icon: Icon,
  isNew,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  isNew?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] ${
        isNew
          ? "border-red-500/30 bg-[#0d1220]/60 hover:border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
          : "border-slate-800/50 bg-[#0d1220]/60 hover:border-indigo-500/50 hover:bg-slate-800/80"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            isNew ? "bg-red-500/10 text-red-400" : "bg-indigo-500/10 text-indigo-400"
          } transition-transform group-hover:scale-110`}
        >
          <Icon size={24} />
        </div>
        {isNew && (
          <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400 uppercase tracking-wider">
            New Module
          </span>
        )}
      </div>
      <div className="mt-6">
        <h3 className={`text-lg font-bold ${isNew ? "text-red-100" : "text-slate-100"}`}>
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
      <div className="mt-6 flex items-center text-sm font-semibold text-slate-300 transition-colors group-hover:text-white">
        Explore <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default function OverviewPage() {
  const { user } = useAuth();
  
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [creditScore, setCreditScore] = useState<CreditScoreResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    
    try {
      const [summaryRes, creditRes, txRes] = await Promise.allSettled([
        fetchDashboardSummary(),
        fetchCreditScore(user.id),
        fetchTransactions()
      ]);
      
      if (summaryRes.status === "fulfilled") setSummary(summaryRes.value);
      if (creditRes.status === "fulfilled") setCreditScore(creditRes.value);
      if (txRes.status === "fulfilled") setTransactions(txRes.value);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const today = new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-slate-800/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
            Enterprise Credit Intelligence Suite
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mt-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {today} • Here's your financial intelligence overview.
          </p>
        </div>
      </div>

      {/* Empty State / Upload Prompt */}
      {!isLoading && transactions.length === 0 && (
        <div className="overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/50 to-indigo-950/40 p-6 md:p-8 shadow-2xl relative">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 rounded-full bg-indigo-500/10 blur-[60px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
                ⚠️ Awaiting Statement Upload
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Assessment calculated on heuristic baseline (Score: 300)
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                To compute a credible, highly accurate alternative credit intelligence profile using our advanced machine learning models, 
                please ingest transactional data by uploading your bank statement in the Transactions module.
              </p>
            </div>
            <Link
              href="/dashboard/transactions"
              className="shrink-0 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all duration-300 hover:scale-[1.02]"
            >
              <Receipt size={18} />
              Go to Transactions
            </Link>
          </div>
        </div>
      )}

      {/* Summary KPIs */}
      <section>
        <h2 className="mb-4 text-base font-bold text-white tracking-tight border-l-4 border-indigo-500 pl-4 py-0.5">
          Core Financial KPIs
        </h2>
        <DashboardSummaryCards summary={summary} isLoading={isLoading} />
      </section>

      {/* Credit Overview */}
      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="rounded-2xl border border-slate-800/50 bg-[#0d1220]/60 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-slate-700/60">
          <CreditScoreCard creditScore={creditScore} isLoading={isLoading} />
        </div>
        <div className="rounded-2xl border border-slate-800/50 bg-[#0d1220]/60 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-slate-700/60">
          <RiskGauge creditScore={creditScore} isLoading={isLoading} />
        </div>
      </section>

      {/* Navigation Modules */}
      <section>
        <h2 className="mb-4 text-base font-bold text-white tracking-tight border-l-4 border-indigo-500 pl-4 py-0.5">
          Intelligence Modules
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <NavCard
            title="Fraud Intelligence"
            description="Real-time behavioral anomaly detection, transaction risk scoring, and fraud explainability."
            href="/dashboard/fraud"
            icon={ShieldAlert}
            isNew
          />
          <NavCard
            title="Credit Intelligence"
            description="Deep dive into your ML-generated credit score and SHAP feature importance."
            href="/dashboard/credit"
            icon={CreditCard}
          />
          <NavCard
            title="Financial Health"
            description="6-dimensional health radar, stability metrics, and historical risk evolution."
            href="/dashboard/health"
            icon={HeartPulse}
          />
          <NavCard
            title="Transactions"
            description="Data ingestion engine, categorized ledger, and cash flow dynamics."
            href="/dashboard/transactions"
            icon={Receipt}
          />
          <NavCard
            title="AI Insights"
            description="Algorithmic spender profiling, AI narratives, and actionable recommendations."
            href="/dashboard/insights"
            icon={Brain}
          />
          <NavCard
            title="ML Analytics"
            description="Model performance metrics, validation scores, and global feature importance."
            href="/dashboard/analytics"
            icon={BarChart2}
          />
        </div>
      </section>
    </div>
  );
}
