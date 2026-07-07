"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useSession } from "@/components/session-provider";
import { fetchDeliveriesForProfile, confirmEscrowDelivery } from "@/lib/supabase";
import { formatCurrency } from "@/lib/mock-data";
import type { DeliveryWithParticipants } from "@/lib/types";

export default function ConfirmDeliveryPage() {
  const { profile } = useSession();
  const [deliveriesList, setDeliveriesList] = useState<DeliveryWithParticipants[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);

  async function loadDeliveries() {
    if (!profile) return;
    setLoadingData(true);
    const result = await fetchDeliveriesForProfile(profile);
    setDeliveriesList(result.filter((delivery) => delivery.status === "in_transit"));
    setLoadingData(false);
  }

  useEffect(() => {
    loadDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function handleConfirm(deliveryId: string) {
    setConfirmingId(deliveryId);
    setStatus(null);

    const result = await confirmEscrowDelivery(deliveryId);
    setConfirmingId(null);

    if (!result.ok) {
      setStatus({ message: result.message ?? "Could not confirm delivery.", isError: true });
      return;
    }

    setStatus({ message: "Delivery confirmed. Escrow released to the seller.", isError: false });
    loadDeliveries();
  }

  return (
    <AppShell>
      <section className="page-stack">
        <div className="hero-panel">
          <span className="eyebrow">Buyer escrow action</span>
          <h1>Confirm escrow delivery</h1>
          <p>
            Buyers confirm successful delivery here. Confirming moves held escrow into the
            seller&apos;s wallet.
          </p>
        </div>

        <section className="panel">
          <div className="list">
            {loadingData && <p className="helper">Loading deliveries...</p>}
            {!loadingData && deliveriesList.length === 0 && (
              <p className="helper">Nothing in transit right now.</p>
            )}
            {deliveriesList.map((delivery) => (
              <article className="list-row" key={delivery.id}>
                <div>
                  <strong>{delivery.title}</strong>
                  <small>Delivery ID: {delivery.id.slice(0, 8)}</small>
                  <small>Seller: {delivery.seller?.email ?? "Unassigned"}</small>
                  <small>Escrow amount: {formatCurrency(delivery.amount)}</small>
                </div>
                <button
                  className="button"
                  type="button"
                  disabled={confirmingId === delivery.id}
                  onClick={() => handleConfirm(delivery.id)}
                >
                  {confirmingId === delivery.id ? "Confirming..." : "Confirm and release"}
                </button>
              </article>
            ))}
          </div>

          {status && (
            <p className={`helper ${status.isError ? "error" : "success"}`} style={{ marginTop: "0.75rem" }}>
              {status.message}
            </p>
          )}
        </section>
      </section>
    </AppShell>
  );
}