"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredSession } from "@/components/app-shell";
import { deliveries, formatCurrency, transactions } from "@/lib/mock-data";
import { roleDashboardCopy } from "@/lib/routes";
import type { UserRole } from "@/lib/types";
import { StatusPill } from "@/components/status-pill";

const actionLinks: Record<string, string> = {
  "Search seller": "/search/seller",
  "Search driver or storekeeper": "/search/partners",
  "View deliveries": "/deliveries",
  "Confirm escrow delivery": "/escrow/confirm-delivery",
  "Fund wallet": "/wallet/fund",
  Transactions: "/transactions",
  Withdraw: "/withdraw"
};

export function RoleDashboard() {
  const [role, setRole] = useState<UserRole>("buyer");

  useEffect(() => {
    setRole(getStoredSession().role);
  }, []);

  const copy = roleDashboardCopy[role];
  const activeDeliveries = deliveries.filter((delivery) =>
    role === "buyer"
      ? delivery.buyer === "ada@example.com" || delivery.buyer.includes("buyer")
      : role === "seller"
        ? delivery.seller.includes("seller")
        : role === "driver"
          ? delivery.driver.includes("driver")
          : delivery.storekeeper?.includes("storekeeper")
  );

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
          <strong>{formatCurrency(role === "seller" ? 250000 : role === "buyer" ? 85000 : 52000)}</strong>
        </article>
        <article>
          <span>Active deliveries</span>
          <strong>{activeDeliveries.length}</strong>
        </article>
        <article>
          <span>Pending verification</span>
          <strong>KYC/Keys</strong>
        </article>
      </div>

      <div className="content-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>Recent transactions</h2>
            <Link href="/transactions">View all</Link>
          </div>
          <div className="list">
            {transactions.map((transaction) => (
              <div className="list-row" key={transaction.id}>
                <div>
                  <strong>{transaction.id}</strong>
                  <small>
                    {transaction.payer} to {transaction.recipient}
                  </small>
                </div>
                <div className="right">
                  <strong>{formatCurrency(transaction.amount)}</strong>
                  <StatusPill label={transaction.status} tone={transaction.status === "released" ? "green" : "amber"} />
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
            {activeDeliveries.map((delivery) => (
              <div className="list-row" key={delivery.id}>
                <div>
                  <strong>{delivery.title}</strong>
                  <small>{delivery.id}</small>
                </div>
                <StatusPill label={delivery.status} tone={delivery.status === "stored" ? "blue" : "amber"} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
