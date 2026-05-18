"use client";

import { useCallback, useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { CSVUpload } from "@/components/CSVUpload";
import { DashboardSummaryCards } from "@/components/DashboardSummaryCards";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TransactionChart } from "@/components/TransactionChart";
import { TransactionsTable } from "@/components/TransactionsTable";
import { fetchDashboardSummary } from "@/services/dashboard";
import { fetchTransactions } from "@/services/transactions";
import type { DashboardSummary, Transaction } from "@/utils/types";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setError(null);
    try {
      const [summaryResponse, transactionResponse] = await Promise.all([
        fetchDashboardSummary(),
        fetchTransactions(),
      ]);
      setSummary(summaryResponse);
      setTransactions(transactionResponse);
    } catch {
      setError("Unable to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-mint">Sprint 1 MVP</p>
              <h1 className="text-2xl font-semibold text-ink">Credit data dashboard</h1>
            </div>
            <p className="text-sm text-slate-600">Reliable data infrastructure</p>
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <DashboardSummaryCards summary={summary} isLoading={isLoading} />

          <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
            <CSVUpload onUploadComplete={loadDashboard} />
            <TransactionChart summary={summary} isLoading={isLoading} />
          </div>

          <TransactionsTable transactions={transactions} isLoading={isLoading} />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
