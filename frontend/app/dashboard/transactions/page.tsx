"use client";

import { useEffect, useState, useCallback } from "react";

import { CSVUpload } from "@/components/CSVUpload";
import { SpendingAnalyticsCharts } from "@/components/SpendingAnalyticsCharts";
import { TransactionChart } from "@/components/TransactionChart";
import { TransactionsTable } from "@/components/TransactionsTable";
import { useAuth } from "@/hooks/useAuth";
import { fetchDashboardSummary } from "@/services/dashboard";
import { fetchFinancialHealth } from "@/services/intelligence";
import { fetchTransactions } from "@/services/transactions";
import type { DashboardSummary, FinancialHealthResponse, Transaction } from "@/utils/types";

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

export default function TransactionsPage() {
  const { user } = useAuth();
  
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [health, setHealth] = useState<FinancialHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    
    try {
      const [sumRes, txRes, healthRes] = await Promise.allSettled([
        fetchDashboardSummary(),
        fetchTransactions(),
        fetchFinancialHealth(user.id)
      ]);
      
      if (sumRes.status === "fulfilled") setSummary(sumRes.value);
      if (txRes.status === "fulfilled") setTransactions(txRes.value);
      if (healthRes.status === "fulfilled") setHealth(healthRes.value);
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
          Ingestion & Analytics
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white mt-2">
          Transactions Ledger
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Data ingestion engine, categorized ledger, and cash flow dynamics.
        </p>
      </div>

      <section className="space-y-4" id="ingestion-engine">
        <SectionHeader title="Ingestion Engine & Cash Flow Dynamics" subtitle="Secure statement parsing and daily inflow vs outflow curves" />
        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <Panel>
            <CSVUpload onUploadComplete={loadData} />
          </Panel>
          <Panel>
            <TransactionChart summary={summary} isLoading={isLoading} />
          </Panel>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader title="Spending Analytics" subtitle="Category distributions and transactional indicators" />
        <div className="rounded-2xl border border-slate-800/50 bg-[#0d1220]/60 p-6 shadow-xl backdrop-blur-sm">
          <SpendingAnalyticsCharts health={health} isLoading={isLoading} />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader title="Full Transactions Ledger" subtitle="Fully categorized ledger from parsed statements" />
        <Panel>
          <TransactionsTable transactions={transactions} isLoading={isLoading} />
        </Panel>
      </section>
    </div>
  );
}
