"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/components/session-provider";
import { fetchDeliveriesForProfile, fetchTransactionsForProfile } from "@/lib/supabase";
import { formatCurrency } from "@/lib/mock-data";
import { roleDashboardCopy } from "@/lib/routes";
import { StatusPill } from "@/components/status-pill";
import type { Delivery, Transaction } from "@/lib/types";

const actionLinks: Record<string, string> = {
  "Search seller": "/search/seller",
  "Search driver or storekeeper": "/search/partners",
  "View deliveries": "/deliveries",
  "Confirm escrow delivery": "/escrow/confirm-delivery",
  "Fund wallet": "/wallet/fund",
  Transactions: "/transactions",
  Withdraw: "/withdraw"
};

// StatusPill's `tone` prop currently supports "green" | "amber" | "blue" in your
// existing code — check its definition and add "red" if it isn't there yet,
// since disputed/failed states need to read as distinct from "pending".
const deliveryTone: Record<Delivery["status"], "green" | "amber" | "blue" | "red"> = {
  pending: "amber",
  in_transit: "blue",
  successful: "green",
  failed: "red",
  disputed: "red",
  stored: "blue",
  returned: "amber",
  redelivery_planned: "amber"
};

const transactionTone: Record<Transaction["status"], "green" | "amber" | "blue" | "red"> = {
  pending: "amber",
  held: "amber",
  released: "green",
  failed: "red",
  disputed: "red"
};

const verificationLabels: Record<string, string> = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected"
};

export function RoleDashboard() {
  const { profile } = useSession();
  const [deliveriesList, setDeliveriesList] = useState<Delivery[]>([]);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    setLoadingData(true);

    Promise.all([fetchDeliveriesForProfile(profile), fetchTransactionsForProfile(profile)]).then(
      ([deliveriesResult, transactionsResult]) => {
        if (cancelled) return;
        setDeliveriesList(deliveriesResult);
        setTransactionsList(transactionsResult);
        setLoadingData(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [profile]);

  if (!profile) return null;

  const copy = roleDashboardCopy[profile.role];

  return (
    <section className="page-stack">
      <div className="hero-panel">
        <span className="eyebrow">Role workspace</span>
        <h1>{copy.title}</h1>
        <p>{copy.summary}</p>
        <div className="action-row">
          {copy.actions.map((action) => (
            <Link className="button" href={actionLinks[action]} key={action}>
              {action}
            </Link>
          ))}
        </div>
      </div>

      <div className="metrics-grid">
        <article>
          <span>Wallet balance</span>
          <strong>{formatCurrency(profile.wallet_balance)}</strong>
        </article>
        <article>
          <span>Active deliveries</span>
          <strong>{loadingData ? "..." : deliveriesList.length}</strong>
        </article>
        <article>
          <span>Verification</span>
          <strong>{verificationLabels[profile.verification_status]}</strong>
        </article>
      </div>

      <div className="content-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>Recent transactions</h2>
            <Link href="/transactions">View all</Link>
          </div>
          <div className="list">
            {loadingData && <p className="helper">Loading transactions...</p>}
            {!loadingData && transactionsList.length === 0 && (
              <p className="helper">No transactions yet.</p>
            )}
            {transactionsList.map((transaction) => (
              <div className="list-row" key={transaction.id}>
                <div>
                  <strong>{transaction.id.slice(0, 8)}</strong>
                  <small>
                    {transaction.payer_email} to {transaction.recipient_email}
                  </small>
                </div>
                <div className="right">
                  <strong>{formatCurrency(transaction.amount)}</strong>
                  <StatusPill label={transaction.status} tone={transactionTone[transaction.status]} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <h2>Deliveries</h2>
            <Link href="/deliveries">Open</Link>
          </div>
          <div className="list">
            {loadingData && <p className="helper">Loading deliveries...</p>}
            {!loadingData && deliveriesList.length === 0 && (
              <p className="helper">No deliveries yet.</p>
            )}
            {deliveriesList.map((delivery) => (
              <div className="list-row" key={delivery.id}>
                <div>
                  <strong>{delivery.title}</strong>
                  <small>{delivery.id.slice(0, 8)}</small>
                </div>
                <StatusPill label={delivery.status} tone={deliveryTone[delivery.status]} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}