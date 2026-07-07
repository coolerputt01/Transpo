"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { useSession } from "@/components/session-provider";
import { fetchTransactionsForProfile } from "@/lib/supabase";
import { formatCurrency } from "@/lib/mock-data";
import type { Transaction } from "@/lib/types";

const transactionTone: Record<Transaction["status"], "green" | "amber" | "blue" | "red"> = {
  pending: "amber",
  held: "amber",
  released: "green",
  failed: "red",
  disputed: "red"
};

export default function TransactionsPage() {
  const { profile } = useSession();
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    setLoadingData(true);

    fetchTransactionsForProfile(profile).then((result) => {
      if (cancelled) return;
      setTransactionsList(result);
      setLoadingData(false);
    });

    return () => {
      cancelled = true;
    };
  }, [profile]);

  return (
    <AppShell>
      <section className="page-stack">
        <div className="hero-panel">
          <span className="eyebrow">Payment records</span>
          <h1>Transactions</h1>
          <p>
            Buyer-to-seller payments, seller-to-driver delivery fees, seller-to-storekeeper
            holding fees, wallet funding, withdrawals, receipts, and disputes belong here.
          </p>
        </div>

        <section className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Payer</th>
                  <th>Recipient</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingData && (
                  <tr>
                    <td colSpan={6} className="helper">Loading transactions...</td>
                  </tr>
                )}
                {!loadingData && transactionsList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="helper">No transactions yet.</td>
                  </tr>
                )}
                {transactionsList.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.id.slice(0, 8)}</td>
                    <td>{transaction.payer_email}</td>
                    <td>{transaction.recipient_email}</td>
                    <td>{transaction.type.split("_").join(" ")}</td>
                    <td>{formatCurrency(transaction.amount)}</td>
                    <td>
                      <StatusPill label={transaction.status} tone={transactionTone[transaction.status]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </AppShell>
  );
}