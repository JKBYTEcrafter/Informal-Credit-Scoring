"use client";

import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Transaction } from "@/utils/types";

type Props = {
  transactions: Transaction[];
  isLoading: boolean;
};

export function TransactionsTable({ transactions, isLoading }: Props) {
  return (
    <section className="overflow-hidden border border-line bg-white shadow-soft">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="text-sm font-semibold uppercase text-mint">Ledger</p>
          <h2 className="mt-1 text-lg font-semibold">Transactions</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-paper text-left text-xs uppercase text-slate-600">
            <tr>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Merchant</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading && (
              <tr>
                <td className="px-5 py-6 text-slate-600" colSpan={5}>
                  Loading transactions
                </td>
              </tr>
            )}

            {!isLoading && transactions.length === 0 && (
              <tr>
                <td className="px-5 py-6 text-slate-600" colSpan={5}>
                  No transactions uploaded.
                </td>
              </tr>
            )}

            {!isLoading &&
              transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-paper">
                  <td className="whitespace-nowrap px-5 py-4">
                    {formatDate(transaction.timestamp)}
                  </td>
                  <td className="min-w-44 px-5 py-4 font-medium">{transaction.merchant}</td>
                  <td className="whitespace-nowrap px-5 py-4 capitalize text-slate-600">
                    {transaction.category}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={
                        transaction.transaction_type === "credit"
                          ? "text-mint"
                          : "text-saffron"
                      }
                    >
                      {transaction.transaction_type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-semibold">
                    {formatCurrency(Number(transaction.amount))}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
