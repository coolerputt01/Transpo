import { AppShell } from "@/components/app-shell";

export default function FundWalletPage() {
  return (
    <AppShell>
      <section className="page-stack">
        <div className="hero-panel">
          <span className="eyebrow">Buyers and sellers</span>
          <h1>Fund wallet</h1>
          <p>
            This page is ready for your payment gateway initialization. Buyers can fund escrow
            payments, and sellers can fund delivery or storekeeper obligations.
          </p>
        </div>

        <form className="panel form-grid">
          <label className="field">
            <span>Email ID</span>
            <input placeholder="user@example.com" type="email" />
          </label>
          <label className="field">
            <span>Amount</span>
            <input placeholder="50000" type="number" />
          </label>
          <label className="field full">
            <span>Funding purpose</span>
            <select defaultValue="escrow">
              <option value="escrow">Buyer escrow payment</option>
              <option value="delivery_fee">Seller delivery fee</option>
              <option value="storage_fee">Seller storekeeper fee</option>
            </select>
          </label>
          <button className="button field full" type="button">
            Initialize payment placeholder
          </button>
        </form>
      </section>
    </AppShell>
  );
}
