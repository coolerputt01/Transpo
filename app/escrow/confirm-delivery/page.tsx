import { AppShell } from "@/components/app-shell";
import { deliveries, formatCurrency } from "@/lib/mock-data";

export default function ConfirmDeliveryPage() {
  const confirmable = deliveries.filter((delivery) => delivery.status === "in_transit");

  return (
    <AppShell>
      <section className="page-stack">
        <div className="hero-panel">
          <span className="eyebrow">Buyer escrow action</span>
          <h1>Confirm escrow delivery</h1>
          <p>
            Buyers confirm successful delivery here. After confirmation, your gateway release logic
            can move held escrow into the seller wallet.
          </p>
        </div>

        <section className="panel">
          <div className="list">
            {confirmable.map((delivery) => (
              <article className="list-row" key={delivery.id}>
                <div>
                  <strong>{delivery.title}</strong>
                  <small>Delivery ID: {delivery.id}</small>
                  <small>Seller: {delivery.seller}</small>
                  <small>Escrow amount: {formatCurrency(delivery.amount)}</small>
                </div>
                <button className="button" type="button">
                  Confirm and release placeholder
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
