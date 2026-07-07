import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { deliveries, formatCurrency } from "@/lib/mock-data";

export default function DeliveriesPage() {
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
            {deliveries.map((delivery) => (
              <article className="list-row" key={delivery.id}>
                <div>
                  <strong>
                    {delivery.id} - {delivery.title}
                  </strong>
                  <small>Seller: {delivery.seller}</small>
                  <small>Buyer: {delivery.buyer}</small>
                  <small>Driver: {delivery.driver}</small>
                  {delivery.storekeeper && <small>Storekeeper: {delivery.storekeeper}</small>}
                  <small>
                    {delivery.pickupAddress} to {delivery.deliveryAddress}
                  </small>
                  {delivery.failureReason && <small>Reason: {delivery.failureReason}</small>}
                </div>
                <div className="right">
                  <strong>{formatCurrency(delivery.amount)}</strong>
                  <StatusPill label={delivery.status} tone={delivery.status === "stored" ? "blue" : "amber"} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
