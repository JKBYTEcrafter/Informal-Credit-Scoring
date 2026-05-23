"use client";

import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Transaction } from "@/utils/types";

type Props = {
  transactions: Transaction[];
  isLoading: boolean;
};

export function TransactionsTable({ transactions, isLoading }: Props) {
  return (
    <section className="bg-transparent border-0 p-0 shadow-none">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Audit Trail</p>
          <h2 className="mt-1 text-lg font-bold text-white">Historical Transaction Ledger</h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0d1220]/40 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-850 text-sm">
            <thead className="bg-slate-950/60 text-left text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-850">
              <tr>
                <th className="px-5 py-3.5 font-bold">Date</th>
                <th className="px-5 py-3.5 font-bold">Merchant</th>
                <th className="px-5 py-3.5 font-bold">Category</th>
                <th className="px-5 py-3.5 font-bold">Type</th>
                <th className="px-5 py-3.5 text-right font-bold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 text-slate-300">
              {isLoading && (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500 font-medium" colSpan={5}>
                    <span className="animate-pulse">Loading transaction records...</span>
                  </td>
                </tr>
              )}

              {!isLoading && transactions.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500 font-medium" colSpan={5}>
                    No transaction statements processed yet. Upload a statement to load the ledger.
                  </td>
                </tr>
              )}

              {!isLoading &&
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="transition hover:bg-slate-900/40">
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-400">
                      {formatDate(transaction.timestamp)}
                    </td>
                    <td className="min-w-44 px-5 py-4 font-semibold text-slate-200">{transaction.merchant}</td>
                    <td className="whitespace-nowrap px-5 py-4 capitalize text-slate-400 font-medium">
                      {transaction.category}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                          transaction.transaction_type === "credit"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}
                      >
                        {transaction.transaction_type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-extrabold text-white font-mono">
                      {formatCurrency(Number(transaction.amount))}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
