import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { getProfilesByRole } from "@/lib/mock-data";

export default function SellerSearchPage() {
  const sellers = getProfilesByRole("seller");

  return (
    <AppShell>
      <section className="page-stack">
        <div className="hero-panel">
          <span className="eyebrow">Buyer lookup</span>
          <h1>Search for a seller</h1>
          <p>Buyers search sellers by the main identity ID: email. Payment can start after verification.</p>
        </div>

        <form className="panel form-grid">
          <label className="field full">
            <span>Seller email ID</span>
            <input placeholder="seller@business.com" type="email" />
          </label>
          <button className="button field full" type="button">
            Search seller placeholder
          </button>
        </form>

        <section className="panel">
          <div className="section-heading">
            <h2>Example seller result</h2>
            <StatusPill label="KYC/Keys pending" tone="amber" />
          </div>
          {sellers.map((seller) => (
            <div className="list-row" key={seller.id}>
              <div>
                <strong>{seller.name}</strong>
                <small>Email ID: {seller.email}</small>
                <small>Phone: {seller.phone}</small>
              </div>
              <button className="button" type="button">
                Start escrow payment
              </button>
            </div>
          ))}
        </section>
      </section>
    </AppShell>
  );
}
