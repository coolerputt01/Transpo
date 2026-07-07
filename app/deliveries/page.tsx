"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { useSession } from "@/components/session-provider";
import { fetchDeliveriesForProfile } from "@/lib/supabase";
import { formatCurrency } from "@/lib/mock-data";
import type { DeliveryWithParticipants } from "@/lib/types";

const statusTone: Record<DeliveryWithParticipants["status"], "green" | "amber" | "blue" | "red"> = {
  pending: "amber",
  in_transit: "blue",
  successful: "green",
  failed: "red",
  disputed: "red",
  stored: "blue",
  returned: "amber",
  redelivery_planned: "amber"
};

export default function DeliveriesPage() {
  const { profile } = useSession();
  const [deliveriesList, setDeliveriesList] = useState<DeliveryWithParticipants[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    setLoadingData(true);

    fetchDeliveriesForProfile(profile).then((result) => {
      if (cancelled) return;
      setDeliveriesList(result);
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
          <span className="eyebrow">Buyer and seller delivery view</span>
          <h1>Deliveries</h1>
          <p>
            View delivery status, buyer/seller identities, driver, addresses, failed-delivery
            storekeeper details, and escrow amount.
          </p>
        </div>

        <section className="panel">
          <div className="list">
            {loadingData && <p className="helper">Loading deliveries...</p>}
            {!loadingData && deliveriesList.length === 0 && (
              <p className="helper">No deliveries yet.</p>
            )}
            {deliveriesList.map((delivery) => (
              <article className="list-row" key={delivery.id}>
                <div>
                  <strong>
                    {delivery.id.slice(0, 8)} - {delivery.title}
                  </strong>
                  <small>Seller: {delivery.seller?.email ?? "Unassigned"}</small>
                  <small>Buyer: {delivery.buyer_email}</small>
                  <small>Driver: {delivery.driver?.email ?? "Unassigned"}</small>
                  {delivery.storekeeper && <small>Storekeeper: {delivery.storekeeper.email}</small>}
                  <small>
                    {delivery.pickup_address} to {delivery.delivery_address}
                  </small>
                  {delivery.failure_reason && <small>Reason: {delivery.failure_reason}</small>}
                </div>
                <div className="right">
                  <strong>{formatCurrency(delivery.amount)}</strong>
                  <StatusPill label={delivery.status} tone={statusTone[delivery.status]} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}